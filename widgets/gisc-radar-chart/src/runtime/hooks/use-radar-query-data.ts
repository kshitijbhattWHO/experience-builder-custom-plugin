import { React } from 'jimu-core'
import type { DataSource, FeatureLayerQueryParams, QueriableDataSource } from 'jimu-core'
import type { ChartData } from 'chart.js'
import { CategoryType, type RadarChartDataSource, type ByGroupConfig, type ByFieldConfig } from '../../config'

/**
 * Hook to fetch and transform data using query-based approach (Chart widget-style)
 *
 * This replaces the legacy fieldMapping approach with proper query execution
 *
 * @param dataSource - ArcGIS data source instance
 * @param radarChartDataSource - Query-based configuration
 * @param colors - Custom color palette
 * @param pointRadius - Size of data points
 * @param fillOpacity - Opacity of filled area
 * @param queryVersion - Version number for reactive filtering
 * @returns Radar chart data in Chart.js format
 */
export const useRadarQueryData = (
  dataSource: DataSource | undefined,
  radarChartDataSource: RadarChartDataSource | undefined,
  colors?: string[],
  pointRadius?: number,
  fillOpacity?: number,
  queryVersion?: number
): {
  data: ChartData<'radar'> | null
  loading: boolean
  error: string | null
} => {
  const [data, setData] = React.useState<ChartData<'radar'> | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const fetchData = React.useCallback(async () => {
    // Wait for data source
    if (!dataSource) {
      console.log('[useRadarQueryData] Waiting for data source...')
      setLoading(false)
      setData(null)
      setError(null)
      return
    }

    // Check if radarChartDataSource is configured
    if (!radarChartDataSource) {
      console.log('[useRadarQueryData] No radarChartDataSource configured, skipping query')
      setData(null)
      setError(null)
      return
    }

    console.log('[useRadarQueryData] Starting query with config:', {
      categoryType: radarChartDataSource.categoryType,
      hasQuery: !!radarChartDataSource.query,
      query: radarChartDataSource.query
    })

    // Validate configuration based on category type
    if (radarChartDataSource.categoryType === CategoryType.ByGroup) {
      const byGroupConfig = radarChartDataSource.byGroupConfig
      if (!byGroupConfig?.categoryField || !byGroupConfig?.numericField) {
        setData(null)
        setError('Category Field and Numeric Field are required for By Group mode')
        return
      }
    } else if (radarChartDataSource.categoryType === CategoryType.ByField) {
      const byFieldConfig = radarChartDataSource.byFieldConfig
      if (!byFieldConfig?.numericFields || byFieldConfig.numericFields.length === 0) {
        setData(null)
        setError('At least one numeric field is required for By Field mode')
        return
      }
    }

    setLoading(true)
    setError(null)

    try {
      // Get runtime filters from connected widgets
      const runtimeFilters = (dataSource as QueriableDataSource)?.getCurrentQueryParams?.() ?? {}
      const { where, geometry, time, distance, units, gdbVersion } = runtimeFilters

      // Merge configured query with runtime filters
      const baseQuery = radarChartDataSource.query || {}
      const queryParams: any = {
        ...baseQuery,
        where: where || baseQuery.where || '1=1',
        returnGeometry: false
      }

      // Apply spatial filter if provided
      if (geometry) {
        queryParams.geometry = geometry
        if (distance && units) {
          queryParams.distance = distance
          queryParams.units = units
        }
      }

      // Apply temporal filter if provided
      if (time) {
        queryParams.time = time
      }

      // Apply geodatabase version if provided
      if (gdbVersion) {
        queryParams.gdbVersion = gdbVersion
      }

      console.log('[useRadarQueryData] Executing query:', queryParams)

      const result = await (dataSource as QueriableDataSource).query(queryParams)

      console.log('[useRadarQueryData] Query result:', {
        recordCount: result?.records?.length,
        hasRecords: !!result?.records
      })

      if (!result || !result.records || result.records.length === 0) {
        setError('No data returned from query')
        setData(null)
        setLoading(false)
        return
      }

      // Transform records to Chart.js format based on category type
      const chartData = transformQueryResultToRadarData(
        result.records,
        radarChartDataSource,
        colors,
        pointRadius,
        fillOpacity
      )

      setData(chartData)
      setLoading(false)
    } catch (err) {
      console.error('[useRadarQueryData] Error:', err)
      setError(err.message || 'Failed to fetch data')
      setData(null)
      setLoading(false)
    }
  }, [dataSource, radarChartDataSource, colors, pointRadius, fillOpacity, queryVersion])

  React.useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error }
}

/**
 * Transform query results to Chart.js radar data format
 * Handles both ByGroup and ByField category types
 */
const transformQueryResultToRadarData = (
  records: any[],
  radarChartDataSource: RadarChartDataSource,
  colors?: string[],
  pointRadius?: number,
  fillOpacity?: number
): ChartData<'radar'> => {
  const { categoryType, byGroupConfig, byFieldConfig } = radarChartDataSource

  if (categoryType === CategoryType.ByGroup && byGroupConfig) {
    return transformByGroupData(records, byGroupConfig, colors, pointRadius, fillOpacity)
  } else if (categoryType === CategoryType.ByField && byFieldConfig) {
    return transformByFieldData(records, byFieldConfig, colors, pointRadius, fillOpacity)
  }

  // Fallback empty chart
  return { labels: [], datasets: [] }
}

/**
 * Transform ByGroup query results to radar chart data
 */
const transformByGroupData = (
  records: any[],
  config: ByGroupConfig,
  colors?: string[],
  pointRadius?: number,
  fillOpacity?: number
): ChartData<'radar'> => {
  const { categoryField, numericField, statisticType, splitByField } = config

  console.log('[transformByGroupData] Records:', records.length, 'Config:', config)

  // Extract labels (category values)
  const labels = records.map(record => {
    const value = record.getData()[categoryField]
    return value != null ? String(value) : 'Undefined'
  })

  // Extract values (aggregated numeric values)
  const values = records.map(record => {
    const data = record.getData()
    // The aggregated value is stored with name like "sum_of_fieldname"
    const statFieldName = `${statisticType}_of_${numericField}`
    return data[statFieldName] ?? data[numericField] ?? 0
  })

  // Create dataset
  const defaultColors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40']
  const colorPalette = colors && colors.length > 0 ? colors : defaultColors

  const dataset = {
    label: splitByField || numericField,
    data: values,
    backgroundColor: adjustColorAlpha(colorPalette[0], fillOpacity ?? 0.2),
    borderColor: colorPalette[0],
    borderWidth: 2,
    pointRadius: pointRadius ?? 3,
    pointBackgroundColor: colorPalette[0],
    pointBorderColor: '#fff',
    pointHoverRadius: (pointRadius ?? 3) + 2
  }

  return {
    labels,
    datasets: [dataset]
  }
}

/**
 * Transform ByField query results to radar chart data
 */
const transformByFieldData = (
  records: any[],
  config: ByFieldConfig,
  colors?: string[],
  pointRadius?: number,
  fillOpacity?: number
): ChartData<'radar'> => {
  const { numericFields, statisticType } = config

  console.log('[transformByFieldData] Records:', records.length, 'Config:', config)

  // For ByField, there's typically one aggregated record with all field statistics
  if (records.length === 0) {
    return { labels: [], datasets: [] }
  }

  const record = records[0]
  const data = record.getData()

  // Extract field names as labels
  const labels = numericFields

  // Extract aggregated values for each field
  const values = numericFields.map(field => {
    // The aggregated value might be the field itself or a statistic field
    return data[field] ?? 0
  })

  const defaultColors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40']
  const colorPalette = colors && colors.length > 0 ? colors : defaultColors

  const dataset = {
    label: `${statisticType} of fields`,
    data: values,
    backgroundColor: adjustColorAlpha(colorPalette[0], fillOpacity ?? 0.2),
    borderColor: colorPalette[0],
    borderWidth: 2,
    pointRadius: pointRadius ?? 3,
    pointBackgroundColor: colorPalette[0],
    pointBorderColor: '#fff',
    pointHoverRadius: (pointRadius ?? 3) + 2
  }

  return {
    labels,
    datasets: [dataset]
  }
}

/**
 * Adjust color alpha/opacity
 */
const adjustColorAlpha = (color: string, alpha: number): string => {
  if (!color) return `rgba(0, 0, 0, ${alpha})`

  if (color.startsWith('#')) {
    const r = parseInt(color.slice(1, 3), 16)
    const g = parseInt(color.slice(3, 5), 16)
    const b = parseInt(color.slice(5, 7), 16)
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }

  if (color.startsWith('rgb')) {
    return color.replace(/rgba?\(([^)]+)\)/, (_, values) => {
      const parts = values.split(',').slice(0, 3)
      return `rgba(${parts.join(',')}, ${alpha})`
    })
  }

  return color
}
