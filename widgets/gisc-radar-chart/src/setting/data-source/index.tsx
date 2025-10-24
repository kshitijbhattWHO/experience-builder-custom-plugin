import {
  type DataSource,
  DataSourceComponent,
  Immutable,
  type ImmutableObject,
  React,
  type UseDataSource,
  type FeatureLayerDataSource,
  type SceneLayerDataSource,
  getAppStore,
  hooks,
  type DataSourceJson,
  type IMDataSourceSchema
} from 'jimu-core'
import { defaultMessages as jimuUiMessages } from 'jimu-ui'
import { createInitOutputDataSource, getSchemaOriginFields } from './utils'

interface OutputSourceManagerProps {
  widgetId: string
  dataSourceId: string
  originalUseDataSource: ImmutableObject<UseDataSource>
  categoryField?: string
  valueFields?: string[]
  splitByField?: string
  onCreate?: (dataSourceJson: DataSourceJson) => void
  onFieldsChange?: (fields: string[]) => void
}

/**
 * Output Source Manager for Settings Panel
 *
 * This component manages the output data source registration in builder mode.
 * When the widget is configured in the builder, this component:
 * 1. Creates the output data source configuration
 * 2. Registers it with Experience Builder's data source system
 * 3. Makes it available for other widgets to consume
 *
 * This is CRITICAL for message actions to work - without this,
 * the output data source won't appear in the "Select data" panel
 * when configuring triggers/actions.
 */
const OutputSourceManager = (props: OutputSourceManagerProps) => {
  const {
    widgetId,
    dataSourceId,
    originalUseDataSource,
    categoryField,
    valueFields,
    splitByField,
    onCreate: propOnCreate,
    onFieldsChange
  } = props

  const translate = hooks.useTranslation(jimuUiMessages)

  const [dataSource, setDataSource] = React.useState<DataSource>(null)

  const onCreate = hooks.useLatest(propOnCreate)

  // Create output data source when component mounts (if not already created)
  React.useEffect(() => {
    if (!dataSourceId) {
      const outputId = widgetId + '_output'
      const widgetLabel = getAppStore().getState().appStateInBuilder.appConfig.widgets[widgetId].label
      const label = translate('outputStatistics', { name: widgetLabel })

      // Create the output data source configuration with schema including chart fields
      const outputDataSource = createInitOutputDataSource(
        outputId,
        label,
        originalUseDataSource?.asMutable({ deep: true }),
        categoryField,
        valueFields,
        splitByField
      )

      console.log('[OutputSourceManager] Creating output data source:', outputId, 'with fields:', Object.keys(outputDataSource.schema?.fields || {}))
      onCreate.current?.(outputDataSource)
    }
  }, [dataSourceId, onCreate, originalUseDataSource, categoryField, valueFields, splitByField, translate, widgetId])

  // Create UseDataSource object for DataSourceComponent
  const useDataSource: ImmutableObject<UseDataSource> = React.useMemo(() => {
    if (dataSourceId) {
      return Immutable({
        dataSourceId: dataSourceId,
        mainDataSourceId: dataSourceId
      })
    }
  }, [dataSourceId])

  // Handle schema changes to update field list
  const handleSchemaChange = (schema: IMDataSourceSchema) => {
    if (!dataSource) return
    const fields = getSchemaOriginFields(schema)
    onFieldsChange?.(fields)
  }

  // Handle data source creation
  const handleCreated = (dataSource: FeatureLayerDataSource | SceneLayerDataSource) => {
    console.log('[OutputSourceManager] Output data source created:', dataSource.id)
    setDataSource(dataSource)
  }

  return (
    <DataSourceComponent
      widgetId={widgetId}
      useDataSource={useDataSource}
      onDataSourceCreated={handleCreated}
      onDataSourceSchemaChange={handleSchemaChange}
    />
  )
}

export default OutputSourceManager
