/** @jsx jsx */
import { React, jsx, Immutable, type UseDataSource, type ImmutableArray } from 'jimu-core'
import { SettingRow } from 'jimu-ui/advanced/setting-components'
import { Label } from 'jimu-ui'
import type { ByFieldConfig, RadarStatisticType } from '../../config'
import { CompactFieldSelector } from './field-selector-compact'
import { StatisticsSelector } from './statistics-selector'

interface ByFieldConfigProps {
  useDataSource: UseDataSource
  config?: ByFieldConfig
  onChange: (config: ByFieldConfig) => void
}

/**
 * By Field Configuration Component
 *
 * Provides UI for configuring ByField mode:
 * - Multiple numeric fields (each field becomes an axis)
 * - Statistic type (sum, avg, min, max, count)
 */
const ByFieldConfigComponent: React.FC<ByFieldConfigProps> = ({
  useDataSource,
  config,
  onChange
}) => {
  const useDataSources = React.useMemo(
    () => (useDataSource ? Immutable([useDataSource]) : Immutable([])),
    [useDataSource]
  )

  const handleNumericFieldsChange = (fields: ImmutableArray<string>) => {
    const fieldArray = fields?.asMutable ? fields.asMutable() : (Array.isArray(fields) ? fields : [])
    const fieldNames = fieldArray.map((field: any) =>
      typeof field === 'string' ? field : field?.name || ''
    ).filter((name: string) => name !== '')

    onChange({
      ...config,
      numericFields: fieldNames,
      statisticType: config?.statisticType || 'sum'
    })
  }

  const handleStatisticTypeChange = (statisticType: RadarStatisticType) => {
    onChange({
      ...config,
      numericFields: config?.numericFields || [],
      statisticType
    })
  }

  return (
    <React.Fragment>
      <SettingRow label="Statistics" flow="wrap">
        <StatisticsSelector
          value={config?.statisticType || 'sum'}
          onChange={handleStatisticTypeChange}
          aria-label="Statistics"
        />
      </SettingRow>

      <SettingRow label="Number Fields" flow="wrap">
        <CompactFieldSelector
          type="numeric"
          useDataSources={useDataSources}
          onChange={handleNumericFieldsChange}
          fields={config?.numericFields ? Immutable(config.numericFields) : Immutable([])}
          isMultiple={true}
          className="w-100"
          aria-label="Number Fields"
        />
      </SettingRow>
    </React.Fragment>
  )
}

export default ByFieldConfigComponent
