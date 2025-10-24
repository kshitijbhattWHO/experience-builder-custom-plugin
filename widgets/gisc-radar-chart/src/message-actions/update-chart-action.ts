/**
 * Update Chart Message Action
 *
 * This action handles DATA_RECORDS_SELECTION_CHANGE messages and updates the radar chart
 * to highlight or filter data based on the selected records from other widgets.
 *
 * Uses framework's FilterDataRecordAction config interface for compatibility with
 * built-in message action UI (field mapping, SQL expressions, etc.)
 *
 * @version 2.0.0
 */

import {
  AbstractMessageAction,
  MessageType,
  type Message,
  type MessageDescription,
  MutableStoreManager,
  type DataRecordsSelectionChangeMessage,
  type UseDataSource,
  type ImmutableObject,
  getAppStore,
  MessageActionConnectionType
} from 'jimu-core'
import type { IMConfig as WidgetConfig } from '../config'

/**
 * Framework's standard message action configuration
 * This matches jimu-core's FilterDataRecordAction config interface
 */
export interface UpdateChartMessageActionConfig {
  messageUseDataSource: UseDataSource   // Trigger data source
  actionUseDataSource: UseDataSource    // Action data source
  sqlExprObj?: any                      // SQL expression for filtering
  enabledDataRelationShip?: boolean     // Use field relationship
  connectionType?: MessageActionConnectionType  // Connection mode
  enableQueryWithCurrentExtent?: boolean  // Query within extent
}

export type IMConfig = ImmutableObject<UpdateChartMessageActionConfig>

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
   * Returns framework-compatible config structure
   */
  getDefaultMessageActionConfig (message: Message): UpdateChartMessageActionConfig {
    return {
      messageUseDataSource: null,  // Will be set by framework UI
      actionUseDataSource: null,   // Will be set by framework UI
      sqlExprObj: null,
      enabledDataRelationShip: false,
      connectionType: MessageActionConnectionType.SetCustomFields,
      enableQueryWithCurrentExtent: false
    }
  }

  /**
   * Get settings component URI
   * Returns framework's built-in FilterDataRecordActionSetting component
   * This provides automatic UI for trigger/action data sources, field mapping, and SQL expressions
   */
  getSettingComponentUri (messageType: MessageType, messageWidgetId?: string): string {
    return 'jimu-for-builder/lib/message-actions/filter-data-record-action-setting'
  }

  /**
   * Execute the action when a message is received
   *
   * This method processes the incoming selection message and updates the chart
   * to highlight or filter the selected records based on field mapping from actionConfig
   *
   * NOTE: With framework's FilterDataRecordActionSetting, the field mapping is handled
   * via sqlExprObj and data source relationships. For now, we maintain backward compatibility
   * by also checking widget's fieldMapping config.
   */
  onExecute (message: Message, actionConfig?: UpdateChartMessageActionConfig): Promise<boolean> {
    try {
      // Only handle DATA_RECORDS_SELECTION_CHANGE messages
      if (message.type !== MessageType.DataRecordsSelectionChange) {
        console.log('[UpdateChartAction] Ignoring non-selection message:', message.type)
        return Promise.resolve(false)
      }

      const selectionMessage = message as DataRecordsSelectionChangeMessage
      const records = selectionMessage.records || []

      console.log('[UpdateChartAction] Received selection message:', {
        recordCount: records.length,
        sourceWidget: selectionMessage.sourceWidgetId,
        actionConfig: actionConfig ? {
          hasMessageDs: !!actionConfig.messageUseDataSource,
          hasActionDs: !!actionConfig.actionUseDataSource,
          connectionType: actionConfig.connectionType,
          hasSqlExpr: !!actionConfig.sqlExprObj
        } : 'no config'
      })

      // If no records selected, clear any existing highlighting
      if (records.length === 0) {
        console.log('[UpdateChartAction] No records selected, clearing filter')
        MutableStoreManager.getInstance().updateStateValue(this.widgetId, 'chartFilterValue', null)
        return Promise.resolve(true)
      }

      // Get widget configuration to determine label field for backward compatibility
      // In framework mode, field mapping comes from actionConfig.sqlExprObj
      const appState = getAppStore().getState()
      const allWidgets = appState.appConfig?.widgets
      const chartWidgetConfig = allWidgets?.[this.widgetId] as any
      const widgetProps = chartWidgetConfig?.config as WidgetConfig | undefined

      // Try to get label field from widget config (legacy mode)
      const labelField = widgetProps?.fieldMapping?.labelField

      if (!labelField) {
        console.warn('[UpdateChartAction] No label field configured in widget.')
        console.log('[UpdateChartAction] Framework field mapping (sqlExprObj) will be implemented in future phase.')
        console.log('[UpdateChartAction] For now, filtering all records as selected.')

        // Store all records as selected (no filtering)
        const chartFilterValue = {
          selectedLabels: [],
          selectedValues: [],
          recordCount: records.length,
          messageWidgetId: selectionMessage.sourceWidgetId,
          allRecordsMode: true  // Indicates no label-based filtering
        }

        MutableStoreManager.getInstance().updateStateValue(
          this.widgetId,
          'chartFilterValue',
          chartFilterValue
        )
        return Promise.resolve(true)
      }

      // Extract record labels based on the configured label field
      const selectedLabels = new Set<string>()
      const selectedValues = new Set<string | number>()

      // Iterate through selected records and extract the label field values
      for (const record of records) {
        const attributes = record.getData()

        if (attributes) {
          const labelValue = attributes[labelField]
          if (labelValue !== null && labelValue !== undefined) {
            selectedLabels.add(String(labelValue))
            selectedValues.add(labelValue)
            console.log(`[UpdateChartAction] Added label: "${labelValue}" from field "${labelField}"`)
          } else {
            console.warn(`[UpdateChartAction] Label field "${labelField}" not found in record:`, Object.keys(attributes))
          }
        }
      }

      // Create filter value object to pass to the widget
      const chartFilterValue = {
        selectedLabels: Array.from(selectedLabels),
        selectedValues: Array.from(selectedValues),
        recordCount: records.length,
        messageWidgetId: selectionMessage.sourceWidgetId,
        allRecordsMode: false
      }

      console.log('[UpdateChartAction] Storing filter value:', chartFilterValue)

      // Store the filter value using MutableStoreManager so widget can access it
      const storeManager = MutableStoreManager.getInstance()
      storeManager.updateStateValue(
        this.widgetId,
        'chartFilterValue',
        chartFilterValue
      )

      return Promise.resolve(true)
    } catch (error) {
      console.error('[UpdateChartAction] Error executing update chart action:', error)
      return Promise.resolve(false)
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
