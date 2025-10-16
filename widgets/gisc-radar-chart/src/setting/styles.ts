import { css, type IMThemeVariables, type SerializedStyles } from 'jimu-core'

/**
 * Get settings panel styles (following Experience Builder standard)
 */
export function getSettingStyle(theme: IMThemeVariables): SerializedStyles {
  return css`
    .widget-setting-gisc-radar-chart {
      overflow-y: auto;
      font-size: 13px;
      font-weight: lighter;
    }
  `
}

/**
 * Settings panel container styles
 */
export const settingContainerStyle = css`
  padding: 16px;

  .jimu-widget-setting--section {
    margin-bottom: 20px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .jimu-widget-setting--row {
    margin-bottom: 16px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .setting-row-label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
    font-size: 14px;
    color: #333;
  }

  label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
    font-size: 14px;
    color: #333;
    white-space: nowrap;
  }
`

/**
 * Field mapping list styles
 */
export const fieldMappingListStyle = css`
  .field-item {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
    padding: 8px;
    background-color: #f5f5f5;
    border-radius: 4px;

    &:hover {
      background-color: #e8e8e8;
    }
  }

  .field-select {
    flex: 1;
  }

  .remove-btn {
    color: #d32f2f;
    cursor: pointer;
    padding: 4px;

    &:hover {
      background-color: rgba(211, 47, 47, 0.1);
      border-radius: 4px;
    }
  }
`

/**
 * Color picker list styles
 */
export const colorPickerListStyle = css`
  .color-item {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
    padding: 8px;
    background-color: #f5f5f5;
    border-radius: 4px;
  }

  .color-preview {
    width: 32px;
    height: 32px;
    border-radius: 4px;
    border: 2px solid #ddd;
  }

  .color-label {
    flex: 1;
    font-size: 14px;
    color: #333;
  }
`

/**
 * Helper text styles
 */
export const helperTextStyle = css`
  font-size: 12px;
  color: #666;
  margin-top: 4px;
  font-style: italic;
`
