/** @jsx jsx */
import {
  React,
  jsx,
  Immutable,
  type UseDataSource
} from 'jimu-core'
import type { AllWidgetSettingProps } from 'jimu-for-builder'
import {
  SettingSection,
  SettingRow
} from 'jimu-ui/advanced/setting-components'
import { DataSourceSelector } from 'jimu-ui/advanced/data-source-selector'
import { Switch, TextInput, NumericInput, Select, Option, Label } from 'jimu-ui'
import { type IMConfig, CategoryType, type ByGroupConfig, type ByFieldConfig } from '../config'
import ChartStylingConfig from './components/chart-styling-config'
import ByGroupConfigComponent from './components/by-group-config'
import ByFieldConfigComponent from './components/by-field-config'
import { getSettingStyle } from './styles'
import { createByGroupQuery, createByFieldQuery } from '../utils/query-builder'

/**
 * Settings panel for GISC Radar Chart Widget
 *
 * @phase 4 - Settings Panel
 */
export default class Setting extends React.PureComponent<
  AllWidgetSettingProps<IMConfig>
> {
  /**
   * Handle data source change
   */
  onDataSourceChange = (useDataSources: UseDataSource[]) => {
    this.props.onSettingChange({
      id: this.props.id,
      useDataSources: useDataSources
    })
  }

  /**
   * Update chart options
   */
  onChartOptionChange = (key: string, value: any) => {
    const newChartOptions = this.props.config.chartOptions.set(key, value)
    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.config.set('chartOptions', newChartOptions)
    })
  }

  /**
   * Update chart title
   */
  onTitleChange = (value: string) => {
    this.onChartOptionChange('title', value)
  }

  /**
   * Toggle legend visibility
   */
  onLegendToggle = (evt: React.ChangeEvent<HTMLInputElement>) => {
    this.onChartOptionChange('showLegend', evt.target.checked)
  }

  /**
   * Toggle grid visibility
   */
  onGridToggle = (evt: React.ChangeEvent<HTMLInputElement>) => {
    this.onChartOptionChange('showGrid', evt.target.checked)
  }

  /**
   * Update scale minimum
   */
  onScaleMinChange = (value: number) => {
    this.onChartOptionChange('scaleMin', value)
  }

  /**
   * Update scale maximum
   */
  onScaleMaxChange = (value: number) => {
    this.onChartOptionChange('scaleMax', value)
  }

  /**
   * Update no data message
   */
  onNoDataMessageChange = (value: string) => {
    this.onChartOptionChange('noDataMessage', value)
  }

  /**
   * Update custom colors
   */
  onColorsChange = (colors: string[]) => {
    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.config.set('colors', colors)
    })
  }

  /**
   * Handle category type change
   */
  onCategoryTypeChange = (evt: React.ChangeEvent<HTMLSelectElement>) => {
    const categoryType = evt.target.value as CategoryType

    // Initialize radarChartDataSource if it doesn't exist
    const existingDataSource = this.props.config.radarChartDataSource
    const newDataSource = existingDataSource
      ? existingDataSource.set('categoryType', categoryType)
      : Immutable({
        categoryType,
        query: {},
        byGroupConfig: categoryType === CategoryType.ByGroup ? {
          categoryField: '',
          numericField: '',
          statisticType: 'sum' as const
        } : undefined,
        byFieldConfig: categoryType === CategoryType.ByField ? {
          numericFields: [],
          statisticType: 'sum' as const
        } : undefined
      })

    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.config.set('radarChartDataSource', newDataSource)
    })
  }

  /**
   * Handle ByGroup configuration change
   */
  onByGroupConfigChange = (byGroupConfig: ByGroupConfig) => {
    console.log('[Setting] ByGroup config changed:', byGroupConfig)

    // Generate query from config
    const query = createByGroupQuery(byGroupConfig, 1000)

    const newDataSource = Immutable({
      categoryType: CategoryType.ByGroup,
      query,
      byGroupConfig
    })

    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.config.set('radarChartDataSource', newDataSource)
    })
  }

  /**
   * Handle ByField configuration change
   */
  onByFieldConfigChange = (byFieldConfig: ByFieldConfig) => {
    console.log('[Setting] ByField config changed:', byFieldConfig)

    // Generate query from config
    const query = createByFieldQuery(byFieldConfig)

    const newDataSource = Immutable({
      categoryType: CategoryType.ByField,
      query,
      byFieldConfig
    })

    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.config.set('radarChartDataSource', newDataSource)
    })
  }

  render() {
    const { config, useDataSources } = this.props

    // Get current category type (default to ByGroup for spider charts)
    const categoryType = config.radarChartDataSource?.categoryType || CategoryType.ByGroup

    return (
      <div css={getSettingStyle(this.props.theme)}>
        <div className="widget-setting-gisc-radar-chart jimu-widget-setting">
        {/* Data Source Section */}
        <SettingSection title="Data Source">
          <SettingRow>
            <DataSourceSelector
              types={Immutable(['FEATURE_LAYER', 'SCENE_LAYER'])}
              useDataSources={useDataSources}
              onChange={this.onDataSourceChange}
              widgetId={this.props.id}
              mustUseDataSource
            />
          </SettingRow>
        </SettingSection>

        {/* Category Type Section - NEW for Chart widget-style architecture */}
        {useDataSources && useDataSources.length > 0 && (
          <SettingSection title="Category Type">
            <SettingRow label="Data Aggregation" flow="wrap">
              <Label className="w-100 text-break" style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '8px' }}>
                Choose how to organize your data on the spider chart:
              </Label>
              <Select
                className="w-100"
                size="sm"
                value={categoryType}
                onChange={this.onCategoryTypeChange}
              >
                <Option value={CategoryType.ByGroup}>
                  By Group - Group data by category (Recommended for spider charts)
                </Option>
                <Option value={CategoryType.ByField}>
                  By Field - Compare multiple numeric fields
                </Option>
              </Select>
            </SettingRow>

            {categoryType === CategoryType.ByGroup && (
              <SettingRow>
                <Label className="w-100 text-break" style={{ fontSize: '0.75rem', color: '#6c757d', fontStyle: 'italic' }}>
                  <strong>By Group:</strong> Each unique value in the category field becomes an axis.
                  Perfect for comparing entities (hospitals, regions, products) across multiple metrics.
                </Label>
              </SettingRow>
            )}

            {categoryType === CategoryType.ByField && (
              <SettingRow>
                <Label className="w-100 text-break" style={{ fontSize: '0.75rem', color: '#6c757d', fontStyle: 'italic' }}>
                  <strong>By Field:</strong> Each selected numeric field becomes an axis.
                  Perfect for comparing different metrics side-by-side.
                </Label>
              </SettingRow>
            )}
          </SettingSection>
        )}

        {/* By Group Configuration - Chart widget-style */}
        {useDataSources && useDataSources.length > 0 && categoryType === CategoryType.ByGroup && (
          <SettingSection title="By Group Configuration">
            <ByGroupConfigComponent
              useDataSource={useDataSources[0]}
              config={config.radarChartDataSource?.byGroupConfig}
              onChange={this.onByGroupConfigChange}
            />
          </SettingSection>
        )}

        {/* By Field Configuration - Chart widget-style */}
        {useDataSources && useDataSources.length > 0 && categoryType === CategoryType.ByField && (
          <SettingSection title="By Field Configuration">
            <ByFieldConfigComponent
              useDataSource={useDataSources[0]}
              config={config.radarChartDataSource?.byFieldConfig}
              onChange={this.onByFieldConfigChange}
            />
          </SettingSection>
        )}

        {/* Chart Options Section */}
        <SettingSection title="Chart Options">
          <SettingRow level={2} label="Title" flow="wrap">
            <TextInput
              className="w-100"
              type="text"
              size="sm"
              value={config.chartOptions?.title || ''}
              onAcceptValue={this.onTitleChange}
              placeholder="Enter chart title"
              aria-label="Chart title"
            />
          </SettingRow>

          <SettingRow level={2} label="Show Legend">
            <Switch
              checked={config.chartOptions?.showLegend ?? true}
              onChange={this.onLegendToggle}
              aria-label="Show legend"
            />
          </SettingRow>

          <SettingRow level={2} label="Show Grid">
            <Switch
              checked={config.chartOptions?.showGrid ?? true}
              onChange={this.onGridToggle}
              aria-label="Show grid"
            />
          </SettingRow>

          <SettingRow level={2} label="Scale Minimum" flow="wrap">
            <NumericInput
              className="w-100"
              size="sm"
              value={config.chartOptions?.scaleMin ?? 0}
              onChange={this.onScaleMinChange}
              min={0}
              aria-label="Scale minimum"
            />
          </SettingRow>

          <SettingRow level={2} label="Scale Maximum" flow="wrap">
            <NumericInput
              className="w-100"
              size="sm"
              value={config.chartOptions?.scaleMax ?? 100}
              onChange={this.onScaleMaxChange}
              min={1}
              aria-label="Scale maximum"
            />
          </SettingRow>

          <SettingRow level={2} label="No Data Message" flow="wrap">
            <Label className="w-100 text-break" style={{ fontSize: '0.75rem', color: '#6c757d', marginBottom: '4px' }}>
              Custom message when no data is available
            </Label>
            <TextInput
              className="w-100"
              type="text"
              size="sm"
              value={config.chartOptions?.noDataMessage || ''}
              onAcceptValue={this.onNoDataMessageChange}
              placeholder="No data available"
              aria-label="No data message"
            />
          </SettingRow>
        </SettingSection>

        {/* Styling Section */}
        <SettingSection title="Styling">
          <ChartStylingConfig
            colors={config.colors}
            chartOptions={config.chartOptions}
            onChange={this.onChartOptionChange}
            onColorsChange={this.onColorsChange}
          />
        </SettingSection>
        </div>
        </div>
    )
  }
}
