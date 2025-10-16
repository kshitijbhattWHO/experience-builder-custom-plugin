import type { ChartOptions } from '../config'

/**
 * Default chart configuration values
 */
export const DEFAULT_CHART_OPTIONS: ChartOptions = {
  title: 'Radar Chart',
  showLegend: true,
  showGrid: true,
  scaleMin: 0,
  scaleMax: 100,
  pointRadius: 3,
  fillOpacity: 0.2,
  backgroundColor: 'rgba(54, 162, 235, 0.2)',
  borderColor: 'rgb(54, 162, 235)'
}

/**
 * Default color palette for series
 */
export const DEFAULT_COLORS = [
  'rgb(54, 162, 235)',   // Blue
  'rgb(255, 99, 132)',   // Red
  'rgb(255, 205, 86)',   // Yellow
  'rgb(75, 192, 192)',   // Green
  'rgb(153, 102, 255)',  // Purple
  'rgb(255, 159, 64)'    // Orange
]
