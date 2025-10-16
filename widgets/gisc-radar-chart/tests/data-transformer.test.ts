import {
  transformFeaturesToRadarData,
  validateRadarData,
  convertToRGBA
} from '../src/utils/data-transformer'

describe('transformFeaturesToRadarData', () => {
  const mockRecords = [
    {
      feature: {
        attributes: {
          name: 'Item A',
          value1: 85,
          value2: 90,
          category: 'Group 1'
        }
      }
    },
    {
      feature: {
        attributes: {
          name: 'Item B',
          value1: 70,
          value2: 85,
          category: 'Group 1'
        }
      }
    }
  ]

  const fieldMapping = {
    labelField: 'name',
    valueFields: ['value1', 'value2'],
    seriesField: undefined
  }

  it('transforms records to chart data correctly', () => {
    const result = transformFeaturesToRadarData(mockRecords, fieldMapping)

    expect(result.labels).toEqual(['Item A', 'Item B'])
    expect(result.datasets.length).toBe(2)
    expect(result.datasets[0].label).toBe('value1')
  })

  it('handles series field correctly', () => {
    const mappingWithSeries = {
      ...fieldMapping,
      seriesField: 'category'
    }

    const result = transformFeaturesToRadarData(mockRecords, mappingWithSeries)

    expect(result.datasets.length).toBeGreaterThan(0)
    expect(result.datasets[0].label).toBe('Group 1')
  })

  it('handles empty records', () => {
    const result = transformFeaturesToRadarData([], fieldMapping)

    expect(result.labels).toEqual([])
    expect(result.datasets.length).toBe(0)
  })

  it('handles missing field values', () => {
    const incompleteRecords = [
      {
        feature: {
          attributes: {
            name: 'Item C'
            // Missing value fields
          }
        }
      }
    ]

    const result = transformFeaturesToRadarData(incompleteRecords, fieldMapping)
    expect(result.labels).toEqual(['Item C'])
  })
})

describe('validateRadarData', () => {
  it('validates correct data structure', () => {
    const validData = {
      labels: ['A', 'B', 'C'],
      datasets: [
        {
          label: 'Test',
          data: [1, 2, 3],
          backgroundColor: 'rgba(0,0,0,0.2)',
          borderColor: 'rgb(0,0,0)'
        }
      ]
    }

    const result = validateRadarData(validData as any)
    expect(result.valid).toBe(true)
  })

  it('rejects data with insufficient labels', () => {
    const invalidData = {
      labels: ['A', 'B'],
      datasets: [{ label: 'Test', data: [1, 2] }]
    }

    const result = validateRadarData(invalidData as any)
    expect(result.valid).toBe(false)
    expect(result.message).toContain('at least 3 data points')
  })

  it('rejects data without datasets', () => {
    const invalidData = {
      labels: ['A', 'B', 'C'],
      datasets: []
    }

    const result = validateRadarData(invalidData as any)
    expect(result.valid).toBe(false)
    expect(result.message).toContain('No datasets')
  })

  it('rejects data without labels', () => {
    const invalidData = {
      labels: [],
      datasets: [{ label: 'Test', data: [] }]
    }

    const result = validateRadarData(invalidData as any)
    expect(result.valid).toBe(false)
  })
})

describe('convertToRGBA', () => {
  it('converts hex color to RGBA', () => {
    const result = convertToRGBA('#FF0000', 0.5)
    expect(result).toBe('rgba(255, 0, 0, 0.5)')
  })

  it('converts short hex color to RGBA', () => {
    const result = convertToRGBA('#F00', 0.3)
    expect(result).toBe('rgba(255, 0, 0, 0.3)')
  })

  it('handles rgb color input', () => {
    const result = convertToRGBA('rgb(255, 0, 0)', 0.5)
    expect(result).toBe('rgba(255, 0, 0, 0.5)')
  })

  it('handles rgba color input', () => {
    const result = convertToRGBA('rgba(255, 0, 0, 0.8)', 0.5)
    expect(result).toBe('rgba(255, 0, 0, 0.5)')
  })

  it('returns default on invalid color', () => {
    const result = convertToRGBA('invalid-color', 0.5)
    expect(result).toContain('rgba')
  })
})
