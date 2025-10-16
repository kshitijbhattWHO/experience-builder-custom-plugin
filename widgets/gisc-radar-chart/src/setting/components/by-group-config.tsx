/** @jsx jsx */
import { React, jsx, Immutable, type UseDataSource, type ImmutableArray } from 'jimu-core'
import { SettingRow } from 'jimu-ui/advanced/setting-components'
import { Label } from 'jimu-ui'
import type { ByGroupConfig, RadarStatisticType } from '../../config'
import { CompactFieldSelector } from './field-selector-compact'
import { StatisticsSelector } from './statistics-selector'

interface ByGroupConfigProps {
  useDataSource: UseDataSource
  config?: ByGroupConfig
  onChange: (config: ByGroupConfig) => void
}

/**
 * By Group Configuration Component
 *
 * Provides UI for configuring ByGroup mode:
 * - Category field (each unique value becomes an axis)
 * - Numeric field (field to aggregate)
 * - Statistic type (sum, avg, min, max, count)
 * - Split-by field (creates multiple polygons)
 */
const ByGroupConfigComponent: React.FC<ByGroupConfigProps> = ({
  useDataSource,
  config,
  onChange
}) => {
  const useDataSources = React.useMemo(
    () => (useDataSource ? Immutable([useDataSource]) : Immutable([])),
    [useDataSource]
  )

  const handleCategoryFieldChange = (fields: ImmutableArray<string>) => {
    const fieldName = fields?.[0] ? (typeof fields[0] === 'string' ? fields[0] : (fields[0] as any)?.name) : ''
    onChange({
      ...config,
      categoryField: fieldName,
      numericField: config?.numericField || '',
      statisticType: config?.statisticType || 'sum'
    })
  }

  const handleNumericFieldChange = (fields: ImmutableArray<string>) => {
    const fieldName = fields?.[0] ? (typeof fields[0] === 'string' ? fields[0] : (fields[0] as any)?.name) : ''
    onChange({
      ...config,
      categoryField: config?.categoryField || '',
      numericField: fieldName,
      statisticType: config?.statisticType || 'sum'
    })
  }

  const handleStatisticTypeChange = (evt: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({
      ...config,
      categoryField: config?.categoryField || '',
      numericField: config?.numericField || '',
      statisticType: evt.target.value as RadarStatisticType
    })
  }

  const handleSplitByFieldChange = (fields: ImmutableArray<string>) => {
    const fieldName = fields?.[0] ? (typeof fields[0] === 'string' ? fields[0] : (fields[0] as any)?.name) : undefined
    onChange({
      ...config,
      categoryField: config?.categoryField || '',
      numericField: config?.numericField || '',
      statisticType: config?.statisticType || 'sum',
      splitByField: fieldName
    })
  }

  return (
    <React.Fragment>
      <SettingRow>
        <Label className="w-100 text-break" style={{ fontSize: '0.875rem', marginBottom: '8px' }}>
          Configure how to group and aggregate your data:
        </Label>
      </SettingRow>

      <SettingRow label="Category Field" flow="wrap">
        <CompactFieldSelector
          type="category"
          useDataSources={useDataSources}
          onChange={handleCategoryFieldChange}
          fields={config?.categoryField ? Immutable([config.categoryField]) : Immutable([])}
          isMultiple={false}
          className="w-100"
          aria-label="Category Field"
        />
      </SettingRow>

      <SettingRow label="Numeric Field" flow="wrap">
        <CompactFieldSelector
          type="numeric"
          useDataSources={useDataSources}
          onChange={handleNumericFieldChange}
          fields={config?.numericField ? Immutable([config.numericField]) : Immutable([])}
          isMultiple={false}
          className="w-100"
          aria-label="Numeric Field"
        />
      </SettingRow>

      <SettingRow label="Statistic Type" flow="wrap">
        <StatisticsSelector
          value={config?.statisticType || 'sum'}
          onChange={handleStatisticTypeChange}
          aria-label="Statistic Type"
        />
      </SettingRow>

      <SettingRow label="Split By (Optional)" flow="wrap">
        <CompactFieldSelector
          type="category"
          useDataSources={useDataSources}
          onChange={handleSplitByFieldChange}
          fields={config?.splitByField ? Immutable([config.splitByField]) : Immutable([])}
          isMultiple={false}
          className="w-100"
          aria-label="Split By Field"
        />
      </SettingRow>
    </React.Fragment>
  )
}

export default ByGroupConfigComponent
