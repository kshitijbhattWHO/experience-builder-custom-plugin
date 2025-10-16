/** @jsx jsx */
import {
  React,
  jsx,
  type AllWidgetProps,
  DataSourceComponent,
  MutableStoreManager,
  MessageManager,
  type DataRecordsSelectionChangeMessage,
  DataRecord,
  type DataSourceStatus
} from 'jimu-core'
import { type IMConfig } from '../config'
import RadarChartComponent from './chart-component'
import { useRadarData } from './hooks/use-radar-data'
import { useRadarQueryData } from './hooks/use-radar-query-data'
import { generateMockData, adjustColorAlpha } from '../utils/data-transformer'
import { validateWidgetConfig } from '../utils/validators'
import {
  widgetContainerStyle,
  chartWrapperStyle,
  emptyStateStyle,
  loadingStateStyle,
  errorStateStyle,
  warningBannerStyle,
  srOnlyStyle
} from './styles'
import { RadarChartRuntimeStateProvider, useRadarChartRuntimeState, useRadarChartRuntimeDispatch } from './state'
import { OriginalDataSourceManager, OutputDataSourceManager } from './data-source'
import { isDataSourceValid } from '../utils/data-source-utils'
import { createRecordsFromRadarChartData } from '../utils/record-utils'

/**
 * Inner component with data source managers
 * Manages input and output data sources for reactive filtering
 */
const WidgetWithDataSourceManagers = (props: AllWidgetProps<IMConfig>): JSX.Element => {
  const { config, useDataSources, id: widgetId } = props
  const { dataSource, outputDataSource, queryVersion } = useRadarChartRuntimeState()
  const dispatch = useRadarChartRuntimeDispatch()

  // Debug logging
  console.log('[WidgetWithDataSourceManagers] Rendering with config:', {
    hasFieldMapping: !!config?.fieldMapping,
    fieldMapping: config?.fieldMapping,
    hasRadarChartDataSource: !!config?.radarChartDataSource,
    categoryType: config?.radarChartDataSource?.categoryType,
    hasDataSource: !!dataSource,
    dataSourceId: dataSource?.id,
    hasUseDataSources: !!useDataSources,
    useDataSourcesLength: useDataSources?.length
  })

  // State for message action filtering
  const [filteredData, setFilteredData] = React.useState<any>(null)
  const storeKey = 'chartFilterValue'

  // Handle data source status changes
  const handleDataSourceStatusChange = React.useCallback((status: DataSourceStatus, preStatus?: DataSourceStatus) => {
    console.log('[WidgetWithDataSourceManagers] Data source status changed:', status, '(previous:', preStatus, ')')
  }, [])

  // Handle query required from connected widgets
  const handleQueryRequired = React.useCallback(() => {
    console.log('[WidgetWithDataSourceManagers] Query required - filters changed from connected widget')
  }, [])

  // Use query-based hook if radarChartDataSource is configured, otherwise use legacy hook
  const useQueryBased = !!config.radarChartDataSource?.categoryType

  // Query-based approach (NEW - Chart widget-style)
  const queryResult = useRadarQueryData(
    dataSource,
    config.radarChartDataSource,
    config.colors,
    config.chartOptions?.pointRadius,
    config.chartOptions?.fillOpacity,
    queryVersion
  )

  // Legacy approach (FALLBACK - for backward compatibility)
  const legacyResult = useRadarData(
    dataSource,
    config.fieldMapping,
    config.colors,
    config.chartOptions?.pointRadius,
    config.chartOptions?.fillOpacity,
    queryVersion
  )

  // Use query-based result if available, otherwise use legacy
  const { data, loading, error } = useQueryBased ? queryResult : legacyResult

  console.log('[WidgetWithDataSourceManagers] Using', useQueryBased ? 'QUERY-BASED' : 'LEGACY', 'data fetching')

  // Listen to message action updates via mutable store
  // Poll the store periodically since MutableStoreManager doesn't provide native listeners
  React.useEffect(() => {
    const checkInterval = setInterval(() => {
      const storeManager = MutableStoreManager.getInstance()
      const currentFilterValue = storeManager.readStateValue(widgetId, storeKey)

      if (currentFilterValue) {
        console.log('[WidgetWithDataSource] Updated filteredData from store:', currentFilterValue)
        setFilteredData(currentFilterValue)
      } else if (currentFilterValue === null && filteredData !== null) {
        // Clear filtering when store is cleared
        console.log('[WidgetWithDataSource] Cleared filteredData from store')
        setFilteredData(null)
      }
    }, 100) // Check every 100ms for store changes

    return () => {
      clearInterval(checkInterval)
    }
  }, [widgetId, storeKey, filteredData])

  // Create records from chart data for output data source
  React.useEffect(() => {
    if (!data || !isDataSourceValid(outputDataSource)) {
      // Clear records if no data or invalid output data source
      if (outputDataSource) {
        dispatch({ type: 'SET_RECORDS', value: undefined })
      }
      return
    }

    try {
      const records = createRecordsFromRadarChartData(data, outputDataSource)
      dispatch({ type: 'SET_RECORDS', value: records })
      dispatch({ type: 'SET_RENDER_STATE', value: 'success' })
      console.log('[WidgetWithDataSourceManagers] Created records for output data source:', records.length)
    } catch (err) {
      console.error('[WidgetWithDataSourceManagers] Error creating records:', err)
      dispatch({ type: 'SET_RENDER_STATE', value: 'error' })
    }
  }, [data, outputDataSource, dispatch])

  // Apply filter to the data based on message action selections
  const displayData = React.useMemo(() => {
    if (!data || !filteredData) {
      return data
    }

    // Filter datasets based on selected labels/values from message action
    if (filteredData.selectedLabels && filteredData.selectedLabels.length > 0) {
      const selectedLabelsSet = new Set(filteredData.selectedLabels.map(l => String(l)))

      return {
        ...data,
        datasets: data.datasets.map((dataset: any) => {
          const isSelected = selectedLabelsSet.has(String(dataset.label))

          // If selected, keep original styling
          if (isSelected) {
            return {
              ...dataset,
              borderWidth: (dataset.borderWidth ?? 2) + 1 // Add emphasis to selected
            }
          }

          // If not selected, reduce opacity and add visual de-emphasis
          return {
            ...dataset,
            backgroundColor: adjustColorAlpha(dataset.backgroundColor, 0.1),
            borderColor: adjustColorAlpha(dataset.borderColor, 0.4),
            borderWidth: 1,
            pointRadius: (dataset.pointRadius ?? 3) * 0.6,
            opacity: 0.5
          }
        })
      }
    }

    return data
  }, [data, filteredData])

  // Get output data source ID if configured
  const outputDataSourceId = useDataSources?.[0]?.dataSourceId
    ? `${useDataSources[0].dataSourceId}_output`
    : undefined

  // ALWAYS render data source managers first, regardless of loading/error state
  // This ensures data source is created and available
  return (
    <React.Fragment>
      {/* Original Data Source Manager - handles input filtering */}
      {/* MUST be rendered first to create data source! */}
      {useDataSources?.[0] && (
        <OriginalDataSourceManager
          widgetId={widgetId}
          useDataSource={useDataSources[0]}
          onQueryRequired={handleQueryRequired}
          onDataSourceStatusChange={handleDataSourceStatusChange}
        />
      )}

      {/* Output Data Source Manager - provides data to downstream widgets */}
      {outputDataSourceId && useDataSources?.[0]?.dataSourceId && (
        <OutputDataSourceManager
          widgetId={widgetId}
          originalDataSourceId={useDataSources[0].dataSourceId}
          dataSourceId={outputDataSourceId}
        />
      )}

      {/* Main Widget UI - Show appropriate state */}
      {loading && (
        <div className="jimu-widget widget-gisc-radar-chart" css={widgetContainerStyle}>
          <div css={loadingStateStyle}>
            <div className="spinner"></div>
            <p>Loading data...</p>
          </div>
        </div>
      )}

      {!loading && error && (
        <div className="jimu-widget widget-gisc-radar-chart" css={widgetContainerStyle}>
          <div css={errorStateStyle}>
            <div className="icon">❌</div>
            <h3>Error Loading Data</h3>
            <p>{error}</p>
          </div>
        </div>
      )}

      {!loading && !error && !displayData && (
        <div className="jimu-widget widget-gisc-radar-chart" css={widgetContainerStyle}>
          <div css={emptyStateStyle}>
            <div className="icon">📊</div>
            <h3>No Data Available</h3>
            <p>Configure the widget settings to display data</p>
          </div>
        </div>
      )}

      {!loading && !error && displayData && (
        <div
          className="jimu-widget widget-gisc-radar-chart"
          css={widgetContainerStyle}
          role="region"
          aria-label={config.chartOptions?.title || 'Radar Chart'}
          tabIndex={0}
        >
          <div css={chartWrapperStyle} role="img" aria-label="Radar chart visualization">
            <RadarChartComponent
              data={displayData}
              options={config.chartOptions}
              widgetId={widgetId}
              dataSourceIds={dataSource ? [dataSource.id] : undefined}
            />
          </div>
          {filteredData && (
            <div css={warningBannerStyle}>
              📌 Chart filtered: {filteredData.recordCount} record(s) selected
            </div>
          )}
          <div css={srOnlyStyle} aria-live="polite">
            {`Radar chart showing ${displayData?.datasets?.length || 0} datasets across ${displayData?.labels?.length || 0} dimensions${filteredData ? ` - filtered to ${filteredData.recordCount} selection(s)` : ''}`}
          </div>
        </div>
      )}
    </React.Fragment>
  )
}

/**
 * GISC Radar Chart Widget
 *
 * A customizable radar/spider chart widget for visualizing multi-dimensional data.
 * Uses Chart.js for rendering and connects to ArcGIS data sources.
 *
 * Features Chart widget-style architecture:
 * - CategoryType system (ByGroup/ByField)
 * - Reactive data filtering from connected widgets
 * - Output data source for downstream widgets
 * - State management with React Context
 *
 * @version 2.0.0-alpha
 * @phase Phase 3 - Data Source Architecture Integration
 */
const Widget = (props: AllWidgetProps<IMConfig>): JSX.Element => {
  const { config, useDataSources } = props

  // If no data source configured, show mock data (validation not needed for mock data)
  if (!useDataSources || useDataSources.length === 0) {
    const mockData = generateMockData()

    return (
      <div className="jimu-widget widget-gisc-radar-chart" css={widgetContainerStyle}>
        <div css={chartWrapperStyle}>
          <RadarChartComponent
            data={mockData}
            options={config.chartOptions}
            widgetId={props.id}
            dataSourceIds={['mock-data-source']}
          />
        </div>
        <div css={warningBannerStyle}>
          ⚠️ No data source configured - showing sample data
        </div>
      </div>
    )
  }

  // No validation needed - widget will work with either configuration:
  // 1. Legacy fieldMapping (for backward compatibility)
  // 2. New radarChartDataSource (Chart widget-style)
  // If neither is configured, useRadarData will handle it gracefully

  // Wrap with state provider for data source architecture
  return (
    <RadarChartRuntimeStateProvider>
      <WidgetWithDataSourceManagers {...props} />
    </RadarChartRuntimeStateProvider>
  )
}

export default Widget
