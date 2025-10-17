import { React } from 'jimu-core'
import type { DataSource } from 'jimu-core'
import type { ChartData } from 'chart.js'
import { transformFeaturesToRadarData } from '../../utils/data-transformer'
import type { FieldMapping } from '../../config'

/**
 * Hook to fetch and transform data for radar chart with performance optimizations
 *
 * @param dataSource - ArcGIS data source instance
 * @param fieldMapping - Field mapping configuration
 * @param colors - Custom color palette
 * @param pointRadius - Size of data points
 * @param fillOpacity - Opacity of filled area
 * @param queryVersion - Version number that increments when query needs to be re-executed (for reactive filtering)
 * @returns Radar chart data in Chart.js format
 */
export const useRadarData = (
  dataSource: DataSource | undefined,
  fieldMapping: FieldMapping,
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

  // Memoize field mapping to prevent unnecessary re-fetches
  const fieldMappingStr = React.useMemo(() => {
    return JSON.stringify({
      labelField: fieldMapping.labelField,
      valueFields: fieldMapping.valueFields,
      seriesField: fieldMapping.seriesField
    })
  }, [fieldMapping.labelField, fieldMapping.valueFields, fieldMapping.seriesField])

  // Memoize colors array
  const colorsStr = React.useMemo(() => {
    return colors ? JSON.stringify(colors) : ''
  }, [colors])

  // Memoize data fetching function
  const fetchData = React.useCallback(async () => {
    // Don't show error if data source is not ready yet - just wait silently
    if (!dataSource) {
      console.log('[useRadarData] Waiting for data source to be ready...')
      setLoading(false)
      setData(null)
      setError(null) // Don't show error while waiting
      return
    }

    console.log('[useRadarData] Data source is ready, ID:', (dataSource as any)?.id)
    console.log('[useRadarData] Field mapping check:', {
      hasLabelField: !!fieldMapping?.labelField,
      labelField: fieldMapping?.labelField,
      hasValueFields: !!fieldMapping?.valueFields,
      valueFieldsLength: fieldMapping?.valueFields?.length,
      valueFields: fieldMapping?.valueFields
    })

    if (!fieldMapping?.labelField || !fieldMapping?.valueFields || fieldMapping.valueFields.length === 0) {
      setData(null)
      const errorMsg = !fieldMapping?.labelField
        ? 'Label field is required'
        : 'At least one value field is required'
      console.log('[useRadarData] Validation failed:', errorMsg)
      setError(errorMsg)
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Performance optimization: limit records and disable geometry
      // Filter out empty/invalid field names
      const outFields = [
        fieldMapping.labelField,
        ...fieldMapping.valueFields
      ].filter(field => field && typeof field === 'string' && field.trim() !== '')

      // Add series field if it exists and is valid
      if (fieldMapping.seriesField &&
          typeof fieldMapping.seriesField === 'string' &&
          fieldMapping.seriesField.trim() !== '') {
        outFields.push(fieldMapping.seriesField)
      }

      // Get runtime data filters from connected widgets (List, Table, etc.)
      // This is how we achieve reactive filtering!
      const runtimeFilters = (dataSource as any)?.getCurrentQueryParams?.() ?? {}
      const { where, geometry, time, distance, units, gdbVersion } = runtimeFilters

      // Build query parameters with runtime filters applied
      const queryParams: any = {
        where: where || '1=1', // Use runtime where clause if available, otherwise default
        outFields: outFields,
        returnGeometry: false,
        resultRecordCount: 1000, // Limit records for performance
        orderByFields: outFields.length > 0 ? [outFields[0]] : undefined
      }

      // Apply spatial filter if provided
      if (geometry) {
        queryParams.geometry = geometry
        queryParams.returnGeometry = false // Still don't return geometry for performance
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

      console.log('[useRadarData] Querying with params:', {
        where: queryParams.where,
        hasGeometry: !!geometry,
        hasTime: !!time,
        queryVersion
      })

      const result = await (dataSource as any).query(queryParams)

      if (!result || !result.records || result.records.length === 0) {
        setError('No data returned from data source')
        setData(null)
        setLoading(false)
        return
      }

      // Transform records to chart data
      const chartData = transformFeaturesToRadarData(
        result.records,
        fieldMapping,
        colors,
        pointRadius,
        fillOpacity
      )

      setData(chartData)
      setLoading(false)
    } catch (err) {
      console.error('Error fetching radar data:', err)
      setError(err.message || 'Failed to fetch data')
      setData(null)
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataSource, fieldMappingStr, colorsStr, pointRadius, fillOpacity, queryVersion])

  React.useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error }
}
