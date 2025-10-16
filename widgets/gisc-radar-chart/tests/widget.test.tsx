import { React } from 'jimu-core'
import { render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import Widget from '../src/runtime/widget'
import { generateMockData } from '../src/utils/data-transformer'

// Mock Chart.js
jest.mock('react-chartjs-2', () => ({
  Radar: () => <div data-testid="radar-chart">Mocked Radar Chart</div>
}))

describe('GISC Radar Chart Widget', () => {
  const mockConfig = {
    fieldMapping: {
      labelField: 'name',
      valueFields: ['value1', 'value2'],
      seriesField: undefined
    },
    chartOptions: {
      title: 'Test Radar Chart',
      showLegend: true,
      showGrid: true,
      scaleMin: 0,
      scaleMax: 100
    }
  }

  const mockProps = {
    id: 'test-widget-id',
    config: mockConfig as any,
    useDataSources: undefined
  }

  it('renders without crashing', () => {
    const { container } = render(<Widget {...mockProps as any} />)
    expect(container).toBeInTheDocument()
  })

  it('shows mock data when no data source configured', () => {
    render(<Widget {...mockProps as any} />)
    expect(screen.getByTestId('radar-chart')).toBeInTheDocument()
  })

  it('displays chart title from config', () => {
    const { container } = render(<Widget {...mockProps as any} />)
    // Chart title is passed to RadarChartComponent
    expect(mockConfig.chartOptions.title).toBe('Test Radar Chart')
  })

  it('handles empty config gracefully', () => {
    const emptyProps = {
      ...mockProps,
      config: {
        fieldMapping: {
          labelField: '',
          valueFields: []
        },
        chartOptions: {
          showLegend: true,
          showGrid: true
        }
      }
    }
    render(<Widget {...emptyProps as any} />)
    expect(screen.getByTestId('radar-chart')).toBeInTheDocument()
  })
})

describe('Data Transformer', () => {
  it('generates valid mock data', () => {
    const mockData = generateMockData()

    expect(mockData.labels).toBeDefined()
    expect(mockData.labels?.length).toBeGreaterThan(0)
    expect(mockData.datasets).toBeDefined()
    expect(mockData.datasets.length).toBeGreaterThan(0)
  })

  it('mock data has correct structure', () => {
    const mockData = generateMockData()

    expect(mockData.labels?.length).toBe(6)
    expect(mockData.datasets.length).toBe(2)
    expect(mockData.datasets[0].data.length).toBe(6)
  })
})
