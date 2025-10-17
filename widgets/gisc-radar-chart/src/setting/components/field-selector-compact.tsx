/** @jsx jsx */
import { React, jsx, css, type ImmutableArray, hooks, Immutable, JimuFieldType, type IMUseDataSource } from 'jimu-core'
import { FieldSelector as JimuFieldSelector } from 'jimu-ui/advanced/data-source-selector'

export type FieldType = 'numeric' | 'category' | 'date' | 'all'

interface CompactFieldSelectorProps {
  className?: string
  style?: React.CSSProperties
  type?: FieldType
  useDataSources: IMUseDataSource[]
  isMultiple?: boolean
  fields?: ImmutableArray<string>
  disabled?: boolean
  'aria-label'?: string
  onChange: (fields: ImmutableArray<string>) => void
}

/**
 * Compact Field Selector Component
 *
 * Wraps JimuFieldSelector to provide Chart widget-style compact dropdown UI
 * Shows "X Selected" for multi-select instead of full field list
 */
export const CompactFieldSelector = (props: CompactFieldSelectorProps): React.ReactElement => {
  const {
    className,
    style,
    type = 'all',
    useDataSources,
    isMultiple = false,
    fields: propFields,
    disabled = false,
    'aria-label': ariaLabel,
    onChange
  } = props

  const [fields, setFields] = hooks.useControlled({
    controlled: propFields,
    default: Immutable([])
  })

  const handleChange = React.useCallback((selectedFields: ImmutableArray<string>) => {
    setFields(selectedFields)
    onChange?.(selectedFields)
  }, [onChange, setFields])

  // Determine field types based on type prop using JimuFieldType enum
  const supportedTypes = React.useMemo(() => {
    if (type === 'numeric') {
      return Immutable([
        JimuFieldType.Number,
        JimuFieldType.Integer,
        JimuFieldType.SmallInteger,
        JimuFieldType.Double,
        JimuFieldType.Single,
        JimuFieldType.Long
      ])
    } else if (type === 'category') {
      return Immutable([JimuFieldType.String])
    } else if (type === 'date') {
      return Immutable([JimuFieldType.Date])
    }
    return undefined // All types
  }, [type])

  // Dropdown props for compact UI
  const dropdownProps = React.useMemo(() => ({
    disabled,
    size: 'sm' as const
  }), [disabled])

  // CSS for proper alignment
  const compactStyle = css`
    .component-field-selector {
      .jimu-advanced-select {
        > .dropdown {
          > .dropdown-button {
            justify-content: flex-end;
          }
        }
      }
    }
  `

  // Support clearing selection for optional fields
  const noSelectionItem = React.useMemo(() => ({
    name: '(None)'
  }), [])

  return (
    <JimuFieldSelector
      css={compactStyle}
      className={className}
      style={style}
      aria-label={ariaLabel}
      types={supportedTypes}
      isMultiple={isMultiple}
      isDataSourceDropDownHidden={true}
      useMultiDropdownBottomTools={true}
      useDropdown={true}
      dropdownProps={dropdownProps}
      useDataSources={useDataSources}
      selectedFields={fields}
      onChange={handleChange}
      noSelectionItem={isMultiple ? undefined : noSelectionItem}
    />
  )
}

export default CompactFieldSelector
