import { React, type DataSource, DataSourceComponent, type ImmutableObject, type UseDataSource, type DataSourceStatus } from 'jimu-core'
import { useRadarChartRuntimeDispatch, useRadarChartRuntimeState } from '../state'

interface OriginalDataSourceManagerProps {
  widgetId: string
  useDataSource: ImmutableObject<UseDataSource>
  onQueryRequired?: () => void
  onDataSourceStatusChange?: (status: DataSourceStatus, preStatus?: DataSourceStatus) => void
}

/**
 * OriginalDataSourceManager
 *
 * Manages the input data source for the radar chart widget.
 * Listens for query events from connected widgets (List, Table, etc.) and
 * increments queryVersion to trigger re-queries when filters change.
 *
 * This component is crucial for reactive data filtering:
 * - When a connected widget changes its selection/filter, the data source fires onQueryRequired
 * - This increments queryVersion in the state
 * - Components watching queryVersion will re-query with updated filters
 */
const OriginalDataSourceManager = (props: OriginalDataSourceManagerProps) => {
  const { widgetId, useDataSource, onQueryRequired, onDataSourceStatusChange } = props
  const { queryVersion } = useRadarChartRuntimeState()
  const dispatch = useRadarChartRuntimeDispatch()

  console.log('[OriginalDataSourceManager] Rendering with useDataSource:', useDataSource?.dataSourceId)

  /**
   * Called when the data source is created
   * Stores the data source instance in state for later use
   */
  const handleCreated = (dataSource: DataSource) => {
    console.log('[OriginalDataSourceManager] Data source created! ID:', dataSource?.id)
    dispatch({ type: 'SET_DATA_SOURCE', value: dataSource })
  }

  /**
   * Called when the data source requires a new query
   * This happens when:
   * - Connected widgets (List, Table) change their selection
   * - Filters are applied or removed
   * - Geometry filters change
   * - Time extent changes
   *
   * Incrementing queryVersion triggers re-queries in components that depend on it
   */
  const handleQueryRequired = () => {
    dispatch({ type: 'SET_QUERY_VERSION', value: queryVersion + 1 })
    onQueryRequired?.()
  }

  return (
    <DataSourceComponent
      widgetId={widgetId}
      useDataSource={useDataSource}
      onDataSourceCreated={handleCreated}
      onQueryRequired={handleQueryRequired}
      onDataSourceStatusChange={onDataSourceStatusChange}
    />
  )
}

export default OriginalDataSourceManager
