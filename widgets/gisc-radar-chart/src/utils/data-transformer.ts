import type { ChartData } from 'chart.js'
import { DEFAULT_COLORS } from './chart-defaults'
import type { FieldMapping } from '../config'

/**
 * Generate mock radar chart data for testing
 *
 * @phase 2 - Mock data (fallback when no data source)
 */
export const generateMockData = (): ChartData<'radar'> => {
  return {
    labels: [
      'Performance',
      'Reliability',
      'Scalability',
      'Security',
      'Usability',
      'Cost'
    ],
    datasets: [
      {
        label: 'Product A',
        data: [85, 90, 75, 88, 92, 70],
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgb(54, 162, 235)',
        borderWidth: 2,
        pointBackgroundColor: 'rgb(54, 162, 235)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgb(54, 162, 235)',
        pointRadius: 3,
        pointHoverRadius: 5
      },
      {
        label: 'Product B',
        data: [70, 85, 90, 75, 80, 85],
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgb(255, 99, 132)',
        borderWidth: 2,
        pointBackgroundColor: 'rgb(255, 99, 132)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgb(255, 99, 132)',
        pointRadius: 3,
        pointHoverRadius: 5
      }
    ]
  }
}

/**
 * Transform ArcGIS records to Chart.js radar format
 *
 * @param records - ArcGIS feature records
 * @param fieldMapping - Field mapping configuration
 * @param colors - Custom color palette
 * @returns Chart.js radar data
 */
export const transformFeaturesToRadarData = (
  records: any[],
  fieldMapping: FieldMapping,
  colors?: string[],
  pointRadius?: number,
  fillOpacity?: number
): ChartData<'radar'> => {
  const { labelField, valueFields, seriesField } = fieldMapping
  const colorPalette = colors && colors.length > 0 ? colors : DEFAULT_COLORS
  const radius = pointRadius ?? 3
  const opacity = fillOpacity ?? 0.2

  // Handle empty records
  if (!records || records.length === 0) {
    return { labels: [], datasets: [] }
  }

  // If no series field, create single dataset
  if (!seriesField) {
    // Extract unique labels
    const labels = [...new Set(records.map(r => r.feature?.attributes?.[labelField] || 'Unknown'))]

    // Calculate average values for each label across value fields
    const datasets = valueFields.map((field, index) => {
      const dataPoints = labels.map(label => {
        const matchingRecords = records.filter(
          r => r.feature?.attributes?.[labelField] === label
        )

        if (matchingRecords.length === 0) return 0

        // Average the values
        const sum = matchingRecords.reduce(
          (acc, r) => acc + (Number(r.feature?.attributes?.[field]) || 0),
          0
        )
        return sum / matchingRecords.length
      })

      const color = colorPalette[index % colorPalette.length]

      return {
        label: field,
        data: dataPoints,
        backgroundColor: convertToRGBA(color, opacity),
        borderColor: color,
        borderWidth: 2,
        pointBackgroundColor: color,
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: color,
        pointRadius: radius,
        pointHoverRadius: radius + 2
      }
    })

    return { labels, datasets }
  }

  // If series field exists, split by series
  const seriesValues = [...new Set(records.map(r => r.feature?.attributes?.[seriesField]))]
  const labels = [...new Set(records.map(r => r.feature?.attributes?.[labelField]))]

  const datasets = seriesValues.map((seriesValue, index) => {
    const seriesRecords = records.filter(
      r => r.feature?.attributes?.[seriesField] === seriesValue
    )

    const dataPoints = labels.map(label => {
      const matchingRecords = seriesRecords.filter(
        r => r.feature?.attributes?.[labelField] === label
      )

      if (matchingRecords.length === 0) return 0

      // Sum values from all value fields
      const sum = matchingRecords.reduce((acc, r) => {
        return acc + valueFields.reduce((fieldSum, field) => {
          return fieldSum + (Number(r.feature?.attributes?.[field]) || 0)
        }, 0)
      }, 0)

      return sum / matchingRecords.length
    })

    const color = colorPalette[index % colorPalette.length]

    return {
      label: String(seriesValue),
      data: dataPoints,
      backgroundColor: convertToRGBA(color, opacity),
      borderColor: color,
      borderWidth: 2,
      pointBackgroundColor: color,
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: color,
      pointRadius: radius,
      pointHoverRadius: radius + 2
    }
  })

  return { labels, datasets }
}

/**
 * Convert RGB color to RGBA with opacity
 */
export const convertToRGBA = (color: string, opacity: number): string => {
  if (color.startsWith('rgba')) {
    // Replace existing alpha with new opacity
    return color.replace(/rgba?\(([^)]+)\)/, (match, inner) => {
      const parts = inner.split(',').map((s: string) => s.trim())
      return `rgba(${parts[0]}, ${parts[1]}, ${parts[2]}, ${opacity})`
    })
  }

  if (color.startsWith('rgb')) {
    return color.replace('rgb', 'rgba').replace(')', `, ${opacity})`)
  }

  // Handle hex colors
  if (color.startsWith('#')) {
    let hex = color.slice(1)

    // Convert short hex (#F00) to full hex (#FF0000)
    if (hex.length === 3) {
      hex = hex.split('').map(c => c + c).join('')
    }

    const r = parseInt(hex.slice(0, 2), 16)
    const g = parseInt(hex.slice(2, 4), 16)
    const b = parseInt(hex.slice(4, 6), 16)
    return `rgba(${r}, ${g}, ${b}, ${opacity})`
  }

  // Fallback for invalid colors
  return `rgba(128, 128, 128, ${opacity})`
}

/**
 * Adjust alpha channel in RGBA color
 * Extracts RGB components and applies new alpha value
 *
 * @param color - Color string (rgb, rgba, or hex)
 * @param newAlpha - New alpha value (0-1)
 * @returns RGBA color with adjusted alpha
 */
export const adjustColorAlpha = (color: string, newAlpha: number): string => {
  // Clamp alpha between 0 and 1
  const alpha = Math.max(0, Math.min(1, newAlpha))

  if (color.startsWith('rgba')) {
    // Extract RGB and replace alpha
    const match = color.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*[\d.]+\)/)
    if (match) {
      return `rgba(${match[1]}, ${match[2]}, ${match[3]}, ${alpha})`
    }
  }

  if (color.startsWith('rgb')) {
    // Convert rgb to rgba with new alpha
    return color.replace('rgb', 'rgba').replace(')', `, ${alpha})`)
  }

  // Handle hex colors
  if (color.startsWith('#')) {
    let hex = color.slice(1)

    // Convert short hex (#F00) to full hex (#FF0000)
    if (hex.length === 3) {
      hex = hex.split('').map(c => c + c).join('')
    }

    const r = parseInt(hex.slice(0, 2), 16)
    const g = parseInt(hex.slice(2, 4), 16)
    const b = parseInt(hex.slice(4, 6), 16)
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }

  // Fallback: try to parse as rgb without prefix
  try {
    const rgbMatch = color.match(/(\d+),\s*(\d+),\s*(\d+)/)
    if (rgbMatch) {
      return `rgba(${rgbMatch[1]}, ${rgbMatch[2]}, ${rgbMatch[3]}, ${alpha})`
    }
  } catch (e) {
    // Continue to fallback
  }

  // Final fallback
  return `rgba(128, 128, 128, ${alpha})`
}

/**
 * Aggregate data by label field
 *
 * Useful for summarizing multiple records with same label
 */
export const aggregateByLabel = (
  records: any[],
  labelField: string,
  valueField: string,
  aggregationType: 'sum' | 'avg' | 'min' | 'max' = 'avg'
): Map<string, number> => {
  const aggregated = new Map<string, number[]>()

  records.forEach(record => {
    const label = record.feature?.attributes?.[labelField]
    const value = Number(record.feature?.attributes?.[valueField]) || 0

    if (!aggregated.has(label)) {
      aggregated.set(label, [])
    }
    aggregated.get(label)!.push(value)
  })

  const result = new Map<string, number>()

  aggregated.forEach((values, label) => {
    let aggregatedValue: number

    switch (aggregationType) {
      case 'sum':
        aggregatedValue = values.reduce((a, b) => a + b, 0)
        break
      case 'avg':
        aggregatedValue = values.reduce((a, b) => a + b, 0) / values.length
        break
      case 'min':
        aggregatedValue = Math.min(...values)
        break
      case 'max':
        aggregatedValue = Math.max(...values)
        break
      default:
        aggregatedValue = values.reduce((a, b) => a + b, 0) / values.length
    }

    result.set(label, aggregatedValue)
  })

  return result
}

/**
 * Validate if data is suitable for radar chart
 */
export const validateRadarData = (
  data: ChartData<'radar'>
): { valid: boolean; message?: string } => {
  if (!data.labels || data.labels.length === 0) {
    return { valid: false, message: 'No labels provided' }
  }

  if (!data.datasets || data.datasets.length === 0) {
    return { valid: false, message: 'No datasets provided' }
  }

  if (data.labels.length < 3) {
    return { valid: false, message: 'Radar chart needs at least 3 data points' }
  }

  return { valid: true }
}

/**
 * Apply custom colors to datasets
 */
export const applyCustomColors = (
  data: ChartData<'radar'>,
  colors: string[]
): ChartData<'radar'> => {
  const colorPalette = colors.length > 0 ? colors : DEFAULT_COLORS

  return {
    ...data,
    datasets: data.datasets.map((dataset, index) => {
      const color = colorPalette[index % colorPalette.length]
      return {
        ...dataset,
        backgroundColor: color.replace('rgb', 'rgba').replace(')', ', 0.2)'),
        borderColor: color,
        pointBackgroundColor: color,
        pointHoverBorderColor: color
      }
    })
  }
}
