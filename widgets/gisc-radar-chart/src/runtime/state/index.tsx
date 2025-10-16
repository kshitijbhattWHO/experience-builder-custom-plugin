import { React, type DataSource, type DataRecord } from 'jimu-core'

/**
 * Render status for the radar chart widget
 */
export type RenderStatus = 'none' | 'error' | 'warning' | 'success'

/**
 * Runtime state for the radar chart widget
 * Manages data sources, query versioning, and render status
 */
export interface RadarChartRuntimeState {
  /** The Chart.js radar chart instance */
  chart?: any
  /** The input data source instance from useDataSource */
  dataSource?: DataSource
  /** The output data source instance for downstream widgets */
  outputDataSource?: DataSource
  /** The fetched and processed records */
  records?: DataRecord[]
  /** Version number that increments when query needs to be re-executed */
  queryVersion?: number
  /** Current render status of the chart */
  renderStatus?: RenderStatus
}

const initialState: RadarChartRuntimeState = {
  chart: null,
  dataSource: null,
  outputDataSource: null,
  records: null,
  queryVersion: 0,
  renderStatus: 'none'
}

/**
 * Reducer for managing radar chart runtime state
 */
const reducer = (state: RadarChartRuntimeState, action: any) => {
  switch (action.type) {
    case 'SET_CHART':
      return { ...state, chart: action.value }
    case 'SET_DATA_SOURCE':
      return { ...state, dataSource: action.value }
    case 'SET_OUTPUT_DATA_SOURCE':
      return { ...state, outputDataSource: action.value }
    case 'SET_RECORDS':
      return { ...state, records: action.value }
    case 'SET_QUERY_VERSION':
      return { ...state, queryVersion: action.value }
    case 'SET_RENDER_STATE':
      return { ...state, renderStatus: action.value }
    default:
      return state
  }
}

const RadarChartRuntimeStateContext = React.createContext<RadarChartRuntimeState>(undefined)
const RadarChartRuntimeDispatchContext = React.createContext<React.Dispatch<any>>(undefined)

interface RadarChartRuntimeStateProviderProps {
  defaultState?: RadarChartRuntimeState
  children: React.ReactNode
}

/**
 * Provider component for radar chart runtime state
 * Wraps the widget components and provides state/dispatch via context
 */
export const RadarChartRuntimeStateProvider = (props: RadarChartRuntimeStateProviderProps) => {
  const { defaultState, children } = props

  const [state, dispatch] = React.useReducer<typeof reducer>(reducer, defaultState || initialState)

  return (
    <RadarChartRuntimeStateContext.Provider value={state}>
      <RadarChartRuntimeDispatchContext.Provider value={dispatch}>
        {children}
      </RadarChartRuntimeDispatchContext.Provider>
    </RadarChartRuntimeStateContext.Provider>
  )
}

/**
 * Hook to access radar chart runtime state
 */
export const useRadarChartRuntimeState = () => {
  return React.useContext(RadarChartRuntimeStateContext)
}

/**
 * Hook to access radar chart runtime dispatch
 */
export const useRadarChartRuntimeDispatch = () => {
  return React.useContext(RadarChartRuntimeDispatchContext)
}
