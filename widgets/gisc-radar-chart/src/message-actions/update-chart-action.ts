/**
 * Update Chart Message Action
 *
 * This action handles DATA_RECORDS_SELECTION_CHANGE messages and updates the radar chart
 * to highlight or filter data based on the selected records from other widgets.
 *
 * @version 1.0.0
 */

import {
  AbstractMessageAction,
  MessageType,
  type Message,
  type MessageDescription,
  DataSourceManager,
  MutableStoreManager,
  type DataRecordsSelectionChangeMessage,
  type DataSource,
  type ArcGISQueriableDataSource,
  getAppStore
} from 'jimu-core'
import type { UpdateChartMessageActionConfig } from './update-chart-action-setting'
import type { IMConfig } from '../config'

/**
 * Update Chart Action
 *
 * Processes DATA_RECORDS_SELECTION_CHANGE messages and updates the chart
 * by filtering or highlighting datasets based on selected records
 */
export default class UpdateChartAction extends AbstractMessageAction {
  name = 'updateChart'

  /**
   * Filter message descriptions to only handle DATA_RECORDS_SELECTION_CHANGE
   */
  filterMessageDescription (messageDescription: MessageDescription): boolean {
    return messageDescription.messageType === MessageType.DataRecordsSelectionChange
  }

  /**
   * Filter specific messages - accept all DATA_RECORDS_SELECTION_CHANGE messages
   */
  filterMessage (message: Message): boolean {
    return message.type === MessageType.DataRecordsSelectionChange
  }

  /**
   * Get default configuration for the message action
   */
  getDefaultMessageActionConfig (message: Message): UpdateChartMessageActionConfig {
    return {
      useAnyTriggerData: true,
      messageUseDataSource: null,
      actionUseDataSource: null
    }
  }

  /**
   * Get settings component URI
   */
  getSettingComponentUri (messageType: MessageType, messageWidgetId?: string): string {
    return 'message-actions/update-chart-action-setting'
  }

  /**
   * Execute the action when a message is received
   *
   * This method processes the incoming selection message and updates the chart
   * to highlight or filter the selected records based on the widget's configured label field
   */
  async onExecute (message: Message, actionConfig?: UpdateChartMessageActionConfig): Promise<boolean> {
    try {
      // Only handle DATA_RECORDS_SELECTION_CHANGE messages
      if (message.type !== MessageType.DataRecordsSelectionChange) {
        console.log('[UpdateChartAction] Ignoring non-selection message:', message.type)
        return false
      }

      const selectionMessage = message as DataRecordsSelectionChangeMessage
      const records = selectionMessage.records || []

      console.log('[UpdateChartAction] Received selection message with', records.length, 'records from', selectionMessage.sourceWidgetId)

      // If no records selected, clear any existing highlighting
      if (records.length === 0) {
        console.log('[UpdateChartAction] No records selected, clearing filter')
        MutableStoreManager.getInstance().updateStateValue(this.widgetId, 'chartFilterValue', null)
        return true
      }

      // Get widget configuration to know which field is the label field
      const appState = getAppStore().getState()
      const allWidgets = appState.appConfig?.widgets
      const chartWidgetConfig = allWidgets?.[this.widgetId] as any
      const widgetProps = chartWidgetConfig?.config as IMConfig | undefined

      console.log('[UpdateChartAction] Widget config:', { widgetProps, labelField: widgetProps?.fieldMapping?.labelField })

      // Extract the label field name from widget config
      const labelField = widgetProps?.fieldMapping?.labelField

      if (!labelField) {
        console.warn('[UpdateChartAction] No label field configured in widget, cannot filter')
        return false
      }

      // Extract record labels based on the configured label field
      const selectedLabels = new Set<string>()
      const selectedValues = new Set<string | number>()

      // Iterate through selected records and extract the label field values
      for (const record of records) {
        // Get the record's attributes
        const attributes = record.getData()

        if (attributes) {
          // Extract the value of the configured label field
          const labelValue = attributes[labelField]
          if (labelValue !== null && labelValue !== undefined) {
            selectedLabels.add(String(labelValue))
            selectedValues.add(labelValue)
            console.log(`[UpdateChartAction] Added label: "${labelValue}" from field "${labelField}"`)
          } else {
            console.warn(`[UpdateChartAction] Label field "${labelField}" not found in record attributes`)
          }
        }
      }

      // Create filter value object to pass to the widget
      const chartFilterValue = {
        selectedLabels: Array.from(selectedLabels),
        selectedValues: Array.from(selectedValues),
        recordCount: records.length,
        messageWidgetId: selectionMessage.sourceWidgetId
      }

      console.log('[UpdateChartAction] Storing filter value:', chartFilterValue)

      // Store the filter value using MutableStoreManager so widget can access it
      const storeManager = MutableStoreManager.getInstance()
      storeManager.updateStateValue(
        this.widgetId,
        'chartFilterValue',
        chartFilterValue
      )

      return true
    } catch (error) {
      console.error('[UpdateChartAction] Error executing update chart action:', error)
      return false
    }
  }

  /**
   * Called when this action is being removed
   * Clean up any listeners or state
   */
  onRemoveListen (): void {
    // Clear any stored filter values when action is removed
    MutableStoreManager.getInstance().updateStateValue(this.widgetId, 'chartFilterValue', null)
  }
}
