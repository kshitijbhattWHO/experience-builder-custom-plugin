/**
 * Update Chart Message Action Settings Component
 *
 * Provides UI for configuring how the radar chart responds to
 * DATA_RECORDS_SELECTION_CHANGE messages from other widgets.
 *
 * @version 1.0.0
 */

/** @jsx jsx */
import {
  React,
  css,
  jsx,
  type ActionSettingProps,
  type SerializedStyles,
  type ImmutableObject,
  Immutable,
  type UseDataSource,
  AllDataSourceTypes,
  type IMThemeVariables,
  polished
} from 'jimu-core'
import { Radio, Label } from 'jimu-ui'
import { SettingSection, SettingRow } from 'jimu-ui/advanced/setting-components'
import { DataSourceSelector } from 'jimu-ui/advanced/data-source-selector'
import { withTheme } from 'jimu-theme'

interface ExtraProps {
  theme?: IMThemeVariables
}

interface State {
  useAutomatic: boolean
}

export interface UpdateChartMessageActionConfig {
  useAnyTriggerData: boolean
  messageUseDataSource?: UseDataSource
  actionUseDataSource?: UseDataSource
}

export type IMConfig = ImmutableObject<UpdateChartMessageActionConfig>

const DSSelectorTypes = Immutable([
  AllDataSourceTypes.FeatureLayer,
  AllDataSourceTypes.SceneLayer,
  AllDataSourceTypes.BuildingComponentSubLayer,
  AllDataSourceTypes.ImageryLayer,
  AllDataSourceTypes.OrientedImageryLayer,
  AllDataSourceTypes.SubtypeGroupLayer,
  AllDataSourceTypes.SubtypeSublayer
])

class _UpdateChartActionSetting extends React.PureComponent<
  ActionSettingProps<IMConfig> & ExtraProps,
  State
> {
  constructor (props) {
    super(props)

    this.state = {
      useAutomatic: true
    }
  }

  static defaultProps = {
    config: Immutable({
      useAnyTriggerData: true,
      messageUseDataSource: null,
      actionUseDataSource: null
    })
  }

  getStyle (theme: IMThemeVariables): SerializedStyles {
    return css`
      .jimu-widget-setting--section {
        border-bottom: none;
      }

      .label-line-height {
        line-height: 20px;
      }

      .setting-header {
        padding: ${polished.rem(10)} ${polished.rem(16)} ${polished.rem(0)}
          ${polished.rem(16)};
      }

      .info-text {
        font-size: 12px;
        color: ${theme?.ref?.palette?.neutral?.[600]};
        margin-top: 8px;
        line-height: 1.4;
      }
    `
  }

  updateMessageActionConfig (config: IMConfig) {
    this.props.onSettingChange({
      actionId: this.props.actionId,
      config,
      useDataSources: config.messageUseDataSource ? [config.messageUseDataSource] : []
    })
  }

  handleAutomaticModeChange = () => {
    const config = this.props.config.set('useAnyTriggerData', true)
    this.setState({ useAutomatic: true })
    this.updateMessageActionConfig(config)
  }

  handleCustomizeModeChange = () => {
    const config = this.props.config.set('useAnyTriggerData', false)
    this.setState({ useAutomatic: false })
    this.updateMessageActionConfig(config)
  }

  handleMessageDataSourceChange = (useDataSources: UseDataSource[]) => {
    if (useDataSources && useDataSources.length > 0) {
      const config = this.props.config.set('messageUseDataSource', useDataSources[0])
      this.updateMessageActionConfig(config)
    } else {
      const config = this.props.config.set('messageUseDataSource', null)
      this.updateMessageActionConfig(config)
    }
  }

  handleActionDataSourceChange = (useDataSources: UseDataSource[]) => {
    if (useDataSources && useDataSources.length > 0) {
      const config = this.props.config.set('actionUseDataSource', useDataSources[0])
      this.updateMessageActionConfig(config)
    } else {
      const config = this.props.config.set('actionUseDataSource', null)
      this.updateMessageActionConfig(config)
    }
  }

  render () {
    const { config, theme } = this.props
    const useAutomatic = config.useAnyTriggerData

    const connectionModeLabel = 'Connection Mode'
    const automaticLabel = 'Automatic'
    const automaticDescription =
      'Use data from any widget that sends selection changes. No additional configuration needed.'

    const customizeLabel = 'Customize'
    const customizeDescription =
      'Specify which data source triggers the chart update and configure field mapping.'

    const triggerLayerLabel = 'Trigger Data Source'
    const actionLayerLabel = 'Action Data Source'

    return (
      <div css={this.getStyle(theme)}>
        {/* Connection Mode Section */}
        <SettingSection title={connectionModeLabel} className="pb-0">
          {/* Automatic Mode */}
          <SettingRow>
            <Label className="d-flex align-items-center label-line-height">
              <Radio
                className="mr-2"
                checked={useAutomatic}
                onChange={this.handleAutomaticModeChange}
              />
              {automaticLabel}
            </Label>
          </SettingRow>
          <SettingRow>
            <div className="info-text ml-4">{automaticDescription}</div>
          </SettingRow>

          {/* Customize Mode */}
          <SettingRow>
            <Label className="d-flex align-items-center label-line-height mt-3">
              <Radio
                className="mr-2"
                checked={!useAutomatic}
                onChange={this.handleCustomizeModeChange}
              />
              {customizeLabel}
            </Label>
          </SettingRow>
          <SettingRow>
            <div className="info-text ml-4">{customizeDescription}</div>
          </SettingRow>
        </SettingSection>

        {/* Customize Mode: Select Data Sources */}
        {!useAutomatic && (
          <>
            {/* Trigger Data Source */}
            <SettingSection title={triggerLayerLabel} className="pt-3 pb-0">
              <DataSourceSelector
                className="mt-2"
                types={DSSelectorTypes}
                useDataSources={
                  config.messageUseDataSource ? [config.messageUseDataSource] : []
                }
                closeDataSourceListOnChange
                hideAddDataButton
                hideTypeDropdown
                onChange={this.handleMessageDataSourceChange}
                widgetId={this.props.messageWidgetId}
                isMultiple={false}
                hideDataView={true}
                isMultipleDataView={false}
                disableDataView={true}
              />
            </SettingSection>

            {/* Action Data Source */}
            <SettingSection title={actionLayerLabel} className="pt-3 pb-0">
              <DataSourceSelector
                className="mt-2"
                types={DSSelectorTypes}
                useDataSources={
                  config.actionUseDataSource ? [config.actionUseDataSource] : []
                }
                closeDataSourceListOnChange
                hideAddDataButton
                hideTypeDropdown
                onChange={this.handleActionDataSourceChange}
                widgetId={this.props.widgetId}
                isMultiple={false}
                hideDataView={true}
                isMultipleDataView={false}
                disableDataView={true}
              />
            </SettingSection>

            {/* Info about field mapping */}
            <SettingSection className="pt-3">
              <SettingRow>
                <div className="info-text">
                  The radar chart will highlight datasets that match the selected records
                  based on common field values. Ensure both data sources have compatible
                  fields for accurate filtering.
                </div>
              </SettingRow>
            </SettingSection>
          </>
        )}

        {/* Automatic Mode: Info */}
        {useAutomatic && (
          <SettingSection className="pt-3">
            <SettingRow>
              <div className="info-text">
                The radar chart will automatically respond to data selections from other
                widgets. When records are selected in a List, Table, or Select widget,
                matching datasets in the radar chart will be highlighted or filtered.
              </div>
            </SettingRow>
          </SettingSection>
        )}
      </div>
    )
  }
}

export default withTheme(_UpdateChartActionSetting)
