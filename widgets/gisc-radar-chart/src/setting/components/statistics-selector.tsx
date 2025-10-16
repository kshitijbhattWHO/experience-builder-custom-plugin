/** @jsx jsx */
import { React, jsx } from 'jimu-core'
import { Select } from 'jimu-ui'
import type { RadarStatisticType } from '../../config'

interface StatisticsSelectorProps {
  value: RadarStatisticType
  disabled?: boolean
  hideCount?: boolean
  hidePercentile?: boolean
  hideNoAggregation?: boolean
  'aria-label'?: string
  onChange: (statisticType: RadarStatisticType) => void
}

/**
 * Statistics Selector Component
 *
 * Compact dropdown for selecting statistic type
 * Matches Chart widget's statistics selector UI
 */
export const StatisticsSelector = (props: StatisticsSelectorProps): React.ReactElement => {
  const {
    value,
    disabled = false,
    hideCount = false,
    hidePercentile = false,
    hideNoAggregation = false,
    'aria-label': ariaLabel,
    onChange
  } = props

  const handleChange = React.useCallback((evt: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(evt.target.value as RadarStatisticType)
  }, [onChange])

  // Filter statistics based on props
  const availableStatistics = React.useMemo(() => {
    const stats: Array<{ value: RadarStatisticType; label: string }> = [
      { value: 'sum', label: 'Sum' },
      { value: 'avg', label: 'Average' },
      { value: 'min', label: 'Minimum' },
      { value: 'max', label: 'Maximum' }
    ]

    if (!hideCount) {
      stats.push({ value: 'count', label: 'Count' })
    }

    if (!hidePercentile) {
      stats.push({ value: 'percentile-continuous', label: 'Median' })
    }

    if (!hideNoAggregation) {
      stats.push({ value: 'no_aggregation', label: 'No Aggregation' })
    }

    return stats
  }, [hideCount, hidePercentile, hideNoAggregation])

  return (
    <Select
      size="sm"
      disabled={disabled}
      value={value}
      aria-label={ariaLabel || 'Statistics Type'}
      onChange={handleChange}
    >
      {availableStatistics.map((stat) => (
        <option key={stat.value} value={stat.value} className="text-truncate">
          {stat.label}
        </option>
      ))}
    </Select>
  )
}

export default StatisticsSelector
