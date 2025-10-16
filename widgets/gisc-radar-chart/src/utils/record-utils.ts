import type { DataSource, DataRecord } from 'jimu-core'
import type { ChartData } from 'chart.js'

/**
 * Create DataRecord objects from radar chart data for output data source
 *
 * This allows downstream widgets (List, Table, etc.) to consume radar chart data
 * Each dataset in the radar chart becomes a record with label and values
 *
 * @param chartData Chart.js radar chart data
 * @param dataSource Output data source instance
 * @returns Array of DataRecord objects
 */
export const createRecordsFromRadarChartData = (
  chartData: ChartData<'radar'>,
  dataSource: DataSource
): DataRecord[] => {
  if (!chartData || !dataSource || !chartData.datasets) {
    return []
  }

  const idField = dataSource.getIdField()
  const labels = chartData.labels || []

  // Each dataset becomes a record
  const records = chartData.datasets.map((dataset, i) => {
    const feature = { attributes: null }

    // Create data object with label and values
    const data: any = {
      label: dataset.label || `Series ${i + 1}`,
      // Add individual axis values if needed for filtering
      ...labels.reduce((acc, label, idx) => {
        const value = Array.isArray(dataset.data) ? dataset.data[idx] : null
        acc[`${label}`] = value
        return acc
      }, {})
    }

    // Add unique ID for this record
    data[idField] = i

    // Add metadata
    data.backgroundColor = dataset.backgroundColor
    data.borderColor = dataset.borderColor
    data.pointRadius = dataset.pointRadius
    data.datasetIndex = i

    feature.attributes = data
    return dataSource.buildRecord(feature)
  })

  return records
}

/**
 * Extract data items from Chart.js radar data
 * Similar to Chart widget's getDataItemsFromChartPayloadData
 *
 * @param chartData Chart.js radar chart data
 * @returns Array of data items for record creation
 */
export const getDataItemsFromRadarData = (chartData: ChartData<'radar'>): any[] => {
  if (!chartData || !chartData.datasets) {
    return []
  }

  const labels = chartData.labels || []

  // Convert each dataset to a data item
  return chartData.datasets.map((dataset, i) => {
    const item: any = {
      label: dataset.label || `Series ${i + 1}`,
      values: dataset.data,
      datasetIndex: i
    }

    // Add each axis value as a separate field
    labels.forEach((label, idx) => {
      const value = Array.isArray(dataset.data) ? dataset.data[idx] : null
      item[String(label)] = value
    })

    return item
  })
}

/**
 * Create a simplified record structure for radar chart
 * Used when output data source schema needs to match chart structure
 *
 * @param label Series label
 * @param values Array of values for each axis
 * @param index Record index
 * @param dataSource Output data source
 * @returns DataRecord
 */
export const createRadarRecord = (
  label: string,
  values: number[],
  index: number,
  dataSource: DataSource
): DataRecord => {
  const idField = dataSource.getIdField()
  const feature = {
    attributes: {
      [idField]: index,
      label,
      values: JSON.stringify(values), // Store as JSON string
      valueCount: values.length,
      average: values.reduce((a, b) => a + b, 0) / values.length,
      min: Math.min(...values),
      max: Math.max(...values)
    }
  }

  return dataSource.buildRecord(feature)
}
