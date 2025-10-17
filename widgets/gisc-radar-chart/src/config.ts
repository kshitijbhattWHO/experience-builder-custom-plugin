import type { ImmutableObject, UseDataSource, FeatureLayerQueryParams } from 'jimu-core'

/**
 * Category types for data aggregation and visualization
 * Mirrors the Chart widget's CategoryType system
 */
export enum CategoryType {
  /** Groups data by a category field and aggregates numeric values (PRIMARY for spider charts) */
  ByGroup = 'BYGROUP',
  /** Compares statistics across multiple numeric fields (SECONDARY for spider charts) */
  ByField = 'BYFIELD'
}

/**
 * Statistic types for data aggregation
 */
export type RadarStatisticType = 'sum' | 'avg' | 'min' | 'max' | 'count' | 'percentile-continuous' | 'no_aggregation'

/**
 * Field mapping configuration for radar chart
 * LEGACY: Used for existing configurations, will be converted to query-based approach
 */
export interface FieldMapping {
  /** Field to use for axis labels (e.g., categories, dimensions) */
  labelField: string
  /** Fields to plot as data points on the radar */
  valueFields: string[]
  /** Optional field to split data into multiple series */
  seriesField?: string
}

/**
 * By Group configuration - for category-based aggregation
 * Each unique value in categoryField becomes an axis on the radar
 * Multiple series can be created via splitByField
 */
export interface ByGroupConfig {
  /** Field to use for spider chart axes (categories) */
  categoryField: string
  /** Single numeric field to aggregate */
  numericField: string
  /** Type of aggregation to perform */
  statisticType: RadarStatisticType
  /** Optional field to create multiple polygons for comparison */
  splitByField?: string
}

/**
 * By Field configuration - for field comparison
 * Each numeric field becomes an axis on the radar
 * Creates a single aggregated value per field
 */
export interface ByFieldConfig {
  /** Multiple numeric fields to compare */
  numericFields: string[]
  /** Type of aggregation to perform */
  statisticType: RadarStatisticType
}

/**
 * Query-based data source configuration
 */
export interface RadarChartDataSource {
  /** Category type determines query structure */
  categoryType: CategoryType
  /** Query parameters for data fetching */
  query: FeatureLayerQueryParams
  /** By Group configuration (when categoryType === ByGroup) */
  byGroupConfig?: ByGroupConfig
  /** By Field configuration (when categoryType === ByField) */
  byFieldConfig?: ByFieldConfig
}

/**
 * Chart styling and behavior options
 */
export interface ChartOptions {
  /** Chart title displayed at top */
  title?: string
  /** Show/hide legend */
  showLegend: boolean
  /** Show/hide grid lines */
  showGrid: boolean
  /** Minimum scale value */
  scaleMin?: number
  /** Maximum scale value */
  scaleMax?: number
  /** Background color for chart area */
  backgroundColor?: string
  /** Border color for data lines */
  borderColor?: string
  /** Point radius size */
  pointRadius?: number
  /** Fill opacity (0-1) */
  fillOpacity?: number
}

/**
 * Main widget configuration interface
 */
export interface Config {
  /** ArcGIS data source configuration */
  useDataSource?: UseDataSource

  /**
   * Query-based data source configuration (NEW APPROACH)
   * Takes precedence over legacy fieldMapping if present
   */
  radarChartDataSource?: RadarChartDataSource

  /**
   * Field mapping configuration (LEGACY)
   * Maintained for backward compatibility
   * Will be converted to radarChartDataSource format
   */
  fieldMapping?: FieldMapping

  /** Chart options and styling */
  chartOptions: ChartOptions
  /** Custom color palette for series */
  colors?: string[]
}

/**
 * Immutable config type for widget props
 */
export type IMConfig = ImmutableObject<Config>
