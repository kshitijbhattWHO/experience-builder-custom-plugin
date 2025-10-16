/** @jsx jsx */
import { React, jsx, css, Immutable, type ImmutableArray, type UseDataSource } from 'jimu-core'
import { SettingRow } from 'jimu-ui/advanced/setting-components'
import { FieldSelector } from 'jimu-ui/advanced/data-source-selector'
import { AlertPanel, Button } from 'jimu-ui'
import type { FieldMapping } from '../../config'

interface FieldMappingConfigProps {
  useDataSource: UseDataSource
  fieldMapping: FieldMapping
  onChange: (fieldMapping: FieldMapping) => void
}

/**
 * Field Mapping Configuration Component
 *
 * Uses built-in FieldSelector for robust field selection
 */
const FieldMappingConfig: React.FC<FieldMappingConfigProps> = ({
  useDataSource,
  fieldMapping,
  onChange
}) => {
  const useDataSources = React.useMemo(
    () => (useDataSource ? Immutable([useDataSource]) : Immutable([])),
    [useDataSource]
  )

  const handleLabelFieldChange = (fields: ImmutableArray<string>) => {
    console.log('Label field changed:', fields, 'Current fieldMapping:', fieldMapping)
    // Convert immutable to mutable for spreading
    const currentMapping = fieldMapping?.asMutable ? fieldMapping.asMutable({ deep: true }) : fieldMapping

    // Extract field name - FieldSelector might return field objects or strings
    const firstField = fields?.[0]
    const fieldName = typeof firstField === 'string' ? firstField : (firstField as any)?.name || ''

    const newFieldMapping = {
      ...(currentMapping || {}),
      labelField: fieldName
    }
    console.log('New field mapping:', newFieldMapping)
    onChange(newFieldMapping)
  }

  const handleValueFieldsChange = (fields: ImmutableArray<string>) => {
    console.log('Value fields changed:', fields, 'Current fieldMapping:', fieldMapping)
    // Convert immutable to mutable for spreading
    const currentMapping = fieldMapping?.asMutable ? fieldMapping.asMutable({ deep: true }) : fieldMapping

    // Extract field names - FieldSelector might return field objects or strings
    // Handle empty/cleared selection
    if (!fields || fields.length === 0) {
      const newFieldMapping = {
        ...(currentMapping || {}),
        valueFields: []
      }
      console.log('Cleared value fields:', newFieldMapping)
      onChange(newFieldMapping)
      return
    }

    const fieldArray = fields?.asMutable ? fields.asMutable() : (Array.isArray(fields) ? fields : [])
    const fieldNames = fieldArray.map((field: any) =>
      typeof field === 'string' ? field : field?.name || ''
    ).filter((name: string) => name !== '')

    const newFieldMapping = {
      ...(currentMapping || {}),
      valueFields: fieldNames
    }
    console.log('New field mapping:', newFieldMapping)
    onChange(newFieldMapping)
  }

  const handleSeriesFieldChange = (fields: ImmutableArray<string>) => {
    console.log('Series field changed:', fields, 'Current fieldMapping:', fieldMapping)
    // Convert immutable to mutable for spreading
    const currentMapping = fieldMapping?.asMutable ? fieldMapping.asMutable({ deep: true }) : fieldMapping

    // Handle empty/cleared selection
    if (!fields || fields.length === 0) {
      const newFieldMapping = {
        ...(currentMapping || {}),
        seriesField: undefined
      }
      console.log('Cleared series field:', newFieldMapping)
      onChange(newFieldMapping)
      return
    }

    // Extract field name - FieldSelector might return field objects or strings
    const firstField = fields?.[0]
    const fieldName = typeof firstField === 'string' ? firstField : (firstField as any)?.name || undefined

    const newFieldMapping = {
      ...(currentMapping || {}),
      seriesField: fieldName
    }
    console.log('New field mapping:', newFieldMapping)
    onChange(newFieldMapping)
  }

  // Clear handlers for manual clear buttons
  const handleClearValueFields = () => {
    const currentMapping = fieldMapping?.asMutable ? fieldMapping.asMutable({ deep: true }) : fieldMapping
    onChange({
      ...(currentMapping || {}),
      valueFields: []
    })
  }

  const handleClearSeriesField = () => {
    const currentMapping = fieldMapping?.asMutable ? fieldMapping.asMutable({ deep: true }) : fieldMapping
    onChange({
      ...(currentMapping || {}),
      seriesField: undefined
    })
  }

  return (
    <div>
      {/* Label Field */}
      <SettingRow label="Label Field" flow="wrap">
        <FieldSelector
          useDataSources={useDataSources}
          onChange={handleLabelFieldChange}
          selectedFields={Immutable(fieldMapping.labelField ? [fieldMapping.labelField] : [])}
          isMultiple={false}
          types={Immutable(['STRING', 'NUMBER', 'DATE'])}
          isDataSourceDropDownHidden
          useDropdown
        />
      </SettingRow>

      {/* Value Fields */}
      <SettingRow label="Value Fields (Numeric only)" flow="wrap">
        <div css={css`width: 100%;`}>
          <FieldSelector
            useDataSources={useDataSources}
            onChange={handleValueFieldsChange}
            selectedFields={Immutable(fieldMapping.valueFields || [])}
            isMultiple={true}
            types={Immutable(['NUMBER', 'INTEGER', 'SMALL_INTEGER', 'DOUBLE', 'SINGLE', 'LONG'])}
            isDataSourceDropDownHidden
            useDropdown
            useMultiDropdownBottomTools
          />
          <div css={css`display: flex; justify-content: space-between; align-items: center; margin-top: 8px;`}>
            <AlertPanel
              form="basic"
              type="info"
              text="Select numeric fields to plot on the radar chart axes. At least one is required."
              css={css`flex: 1; margin: 0;`}
            />
            {fieldMapping.valueFields && fieldMapping.valueFields.length > 0 && (
              <Button
                size="sm"
                type="tertiary"
                onClick={handleClearValueFields}
                css={css`margin-left: 8px;`}
                title="Clear all value fields"
              >
                Clear All
              </Button>
            )}
          </div>
        </div>
      </SettingRow>

      {/* Series Field (Optional) */}
      <SettingRow label="Series Field (optional)" flow="wrap">
        <div css={css`width: 100%;`}>
          <FieldSelector
            useDataSources={useDataSources}
            onChange={handleSeriesFieldChange}
            selectedFields={Immutable(fieldMapping.seriesField ? [fieldMapping.seriesField] : [])}
            isMultiple={false}
            types={Immutable(['STRING', 'NUMBER', 'DATE'])}
            placeholder="None"
            isDataSourceDropDownHidden
            useDropdown
          />
          <div css={css`display: flex; justify-content: space-between; align-items: center; margin-top: 8px;`}>
            <AlertPanel
              form="basic"
              type="info"
              text="Group data by this field to create multiple series"
              css={css`flex: 1; margin: 0;`}
            />
            {fieldMapping.seriesField && (
              <Button
                size="sm"
                type="tertiary"
                onClick={handleClearSeriesField}
                css={css`margin-left: 8px;`}
                title="Clear series field"
              >
                Clear
              </Button>
            )}
          </div>
        </div>
      </SettingRow>
    </div>
  )
}

export default FieldMappingConfig
