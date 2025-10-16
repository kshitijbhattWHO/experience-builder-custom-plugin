/** @jsx jsx */
import { React, jsx, MessageManager, type DataRecordsSelectionChangeMessage } from 'jimu-core'
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  type ChartData,
  type ChartOptions as ChartJSOptions
} from 'chart.js'
import { Radar } from 'react-chartjs-2'
import type { ChartOptions } from '../config'
import { squareChartContainerStyle } from './styles'

// Register Chart.js components
ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
)

/**
 * Props for RadarChartComponent
 */
interface RadarChartComponentProps {
  /** Chart data in Chart.js format */
  data: ChartData<'radar'>
  /** Chart configuration options */
  options: ChartOptions
  /** Widget ID for publishing messages */
  widgetId?: string
  /** Data source IDs for publishing selection messages */
  dataSourceIds?: string[]
}

/**
 * Radar Chart Component
 *
 * Wraps Chart.js radar chart with react-chartjs-2
 * Fully responsive - adapts to container size
 * Supports publishing DATA_RECORDS_SELECTION_CHANGE messages on dataset click
 *
 * @phase 2 - Chart.js Integration (Enhanced with message actions)
 */
export const RadarChartComponent: React.FC<RadarChartComponentProps> = ({
  data,
  options,
  widgetId,
  dataSourceIds
}) => {
  // Publish message when a dataset is clicked (legend click)
  const handleChartClick = (datasetLabel: string) => {
    if (!widgetId || !dataSourceIds || dataSourceIds.length === 0) {
      return
    }

    // Create a record-like object representing the selected dataset
    const selectedRecord = {
      label: datasetLabel,
      timestamp: new Date().toISOString()
    }

    // Publish DATA_RECORDS_SELECTION_CHANGE message
    const message = new (MessageManager.getInstance().getMessageClass('DataRecordsSelectionChange'))(
      widgetId,
      [selectedRecord],
      dataSourceIds
    ) as unknown as DataRecordsSelectionChangeMessage

    MessageManager.getInstance().publishMessage(message)
  }

  // Handle keyboard navigation
  const handleKeyDown = (evt: React.KeyboardEvent) => {
    if (evt.key === 'Enter' || evt.key === ' ') {
      console.log('Chart activated via keyboard')
      // Future: Could toggle legend or export data
    }
  }

  // Convert our config to Chart.js options
  const chartJSOptions: ChartJSOptions<'radar'> = {
    responsive: true,
    maintainAspectRatio: true,
    layout: {
      padding: {
        top: 20,
        right: 20,
        bottom: 20,
        left: 20
      }
    },

    plugins: {
      title: {
        display: !!options.title,
        text: options.title || '',
        font: {
          size: 16,
          weight: 'bold'
        },
        padding: {
          top: 10,
          bottom: 10
        }
      },
      legend: {
        display: options.showLegend,
        position: 'top' as const,
        labels: {
          boxWidth: 12,
          padding: 10,
          font: {
            size: 11
          },
          // Add click handler for legend items to publish selection message
          usePointStyle: true
        },
        onClick: (event: any, legendItem: any, legend: any) => {
          // Publish message when legend item is clicked
          if (legendItem.text) {
            handleChartClick(legendItem.text)
          }
          // Return false to prevent default legend toggle behavior
          return false
        }
      },
      tooltip: {
        enabled: true,
        mode: 'index' as const,
        intersect: false
      }
    },

    scales: {
      r: {
        display: options.showGrid,
        min: options.scaleMin ?? 0,
        max: options.scaleMax ?? 100,
        ticks: {
          stepSize: ((options.scaleMax ?? 100) - (options.scaleMin ?? 0)) / 5,
          backdropPadding: 2,
          font: {
            size: 10
          }
        },
        grid: {
          display: options.showGrid,
          color: 'rgba(0, 0, 0, 0.1)'
        },
        angleLines: {
          display: options.showGrid,
          color: 'rgba(0, 0, 0, 0.1)'
        },
        pointLabels: {
          font: {
            size: 11
          },
          padding: 5,
          centerPointLabels: false,
          callback: function(label: string) {
            // Wrap labels if they're too long
            if (typeof label === 'string' && label.length > 15) {
              const words = label.split(' ')
              const lines: string[] = []
              let currentLine = ''

              words.forEach(word => {
                if ((currentLine + ' ' + word).length <= 15) {
                  currentLine += (currentLine ? ' ' : '') + word
                } else {
                  if (currentLine) lines.push(currentLine)
                  currentLine = word
                }
              })
              if (currentLine) lines.push(currentLine)

              return lines
            }
            return label
          }
        }
      }
    },

    elements: {
      point: {
        radius: options.pointRadius ?? 3,
        hoverRadius: (options.pointRadius ?? 3) + 2
      },
      line: {
        borderWidth: 2
      }
    }
  }

  return (
    <div
      css={squareChartContainerStyle}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="img"
      aria-label="Interactive radar chart"
    >
      <Radar data={data} options={chartJSOptions} />
    </div>
  )
}

export default RadarChartComponent
