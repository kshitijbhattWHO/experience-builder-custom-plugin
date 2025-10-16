import {
  React,
  DataSourceComponent,
  Immutable,
  type ImmutableObject,
  type UseDataSource,
  DataSourceStatus,
  type FeatureLayerDataSource,
  type SceneLayerDataSource,
  DataSourceManager,
  dataSourceUtils,
  getAppStore,
  type IMDataSourceSchema,
  type DataSource
} from 'jimu-core'
import { useRadarChartRuntimeDispatch, useRadarChartRuntimeState } from '../state'
import { isDataSourceValid } from '../../utils/data-source-utils'

interface OutputDataSourceManagerProps {
  widgetId: string
  originalDataSourceId: string
  dataSourceId: string
  onCreated?: (dataSource: DataSource) => void
  onSchemaChange?: (schema: IMDataSourceSchema) => void
}

/**
 * OutputDataSourceManager
 *
 * Manages the output data source for the radar chart widget.
 * This data source provides processed chart data to downstream widgets (List, Table, etc.).
 *
 * Key responsibilities:
 * - Creates and manages the output data source
 * - Updates source records when chart data changes
 * - Synchronizes layer definition from original data source
 * - Handles schema changes for dynamic field updates
 * - Manages data source status for proper rendering
 *
 * The output data source enables:
 * - Other widgets to consume radar chart data
 * - Selection synchronization across widgets
 * - Data filtering chains (List -> Radar Chart -> Table)
 */
const OutputDataSourceManager = (props: OutputDataSourceManagerProps) => {
  const {
    widgetId,
    dataSourceId,
    onCreated,
    onSchemaChange
  } = props

  const { current: isInBuilder } = React.useRef(getAppStore().getState().appContext.isInBuilder)
  const { outputDataSource, records } = useRadarChartRuntimeState()

  const dispatch = useRadarChartRuntimeDispatch()

  /**
   * Update output data source with processed records
   * Sets records and resets status to trigger downstream updates
   */
  React.useEffect(() => {
    if (!isDataSourceValid(outputDataSource) || !records) return

    outputDataSource.setSourceRecords(records)

    // Reset status to Unloaded to indicate data is ready but not yet consumed
    if (outputDataSource.getStatus() !== DataSourceStatus.Unloaded) {
      outputDataSource.setStatus(DataSourceStatus.Unloaded)
      outputDataSource.setCountStatus(DataSourceStatus.Unloaded)
    }
  }, [outputDataSource, records])

  /**
   * Create UseDataSource configuration for output data source
   */
  const useDataSource: ImmutableObject<UseDataSource> = React.useMemo(() => {
    if (dataSourceId) {
      return Immutable({
        dataSourceId: dataSourceId,
        mainDataSourceId: dataSourceId
      })
    }
  }, [dataSourceId])

  /**
   * Called when output data source is created
   * Syncs layer definition from original data source and stores in state
   */
  const handleCreated = (outputDataSource: FeatureLayerDataSource | SceneLayerDataSource) => {
    syncOriginDsInfo(outputDataSource)
    dispatch({ type: 'SET_OUTPUT_DATA_SOURCE', value: outputDataSource })
    onCreated?.(outputDataSource)
  }

  /**
   * Called when output data source schema changes
   * This happens when:
   * - Category type changes (ByGroup <-> ByField)
   * - Selected fields change
   * - Split-by configuration changes
   */
  const handleSchemaChange = (schema: IMDataSourceSchema) => {
    if (!outputDataSource) return

    onSchemaChange?.(schema)
    syncOriginDsInfo(outputDataSource as FeatureLayerDataSource)

    // In builder mode, mark output data source as not ready when schema changes
    // This prevents downstream widgets from using stale data
    if (!isInBuilder) return

    if (outputDataSource.getStatus() !== DataSourceStatus.NotReady) {
      outputDataSource.setStatus(DataSourceStatus.NotReady)
      outputDataSource.setCountStatus(DataSourceStatus.NotReady)
    }
  }

  /**
   * Synchronize layer definition from original data source to output data source
   * This ensures output data source inherits spatial reference, extent, etc.
   * Note: timeInfo is set to null as radar chart aggregates temporal data
   */
  const syncOriginDsInfo = (outputDataSource: FeatureLayerDataSource | SceneLayerDataSource) => {
    const originDs = DataSourceManager.getInstance().getDataSource(
      outputDataSource?.getDataSourceJson()?.originDataSources?.[0]?.dataSourceId
    ) as FeatureLayerDataSource | SceneLayerDataSource

    if (!outputDataSource || !originDs) {
      console.error('Failed to sync origin data source info to radar chart output data source.')
      return
    }

    // Merge layer definitions, but remove timeInfo since chart data is aggregated
    outputDataSource.setLayerDefinition({
      ...dataSourceUtils.getLayerDefinitionIntersection(
        originDs.getLayerDefinition(),
        outputDataSource
      ),
      timeInfo: null
    })
  }

  return (
    <DataSourceComponent
      widgetId={widgetId}
      useDataSource={useDataSource}
      onDataSourceCreated={handleCreated}
      onDataSourceSchemaChange={handleSchemaChange}
    />
  )
}

export default OutputDataSourceManager
