import { css } from 'jimu-core'

/**
 * Widget container styles
 */
export const widgetContainerStyle = css`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
  border-radius: 4px;
  overflow: auto;
`

/**
 * Chart wrapper styles
 * Centered flex container that fills available space
 */
export const chartWrapperStyle = css`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  position: relative;
`

/**
 * Square chart container styles
 * Enforces 1:1 aspect ratio for responsive square rendering
 * Patterns from built-in Image and Button widgets
 */
export const squareChartContainerStyle = css`
  aspect-ratio: 1 / 1;
  max-width: 100%;
  max-height: 100%;
  width: 100%;
  height: auto;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: hidden;
`

/**
 * Empty state styles
 */
export const emptyStateStyle = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 40px;
  text-align: center;
  color: #666;

  h3 {
    margin-bottom: 10px;
    color: #333;
  }

  p {
    margin: 5px 0;
    font-size: 14px;
  }

  .icon {
    font-size: 48px;
    margin-bottom: 20px;
    opacity: 0.5;
  }
`

/**
 * Error state styles
 */
export const errorStateStyle = css`
  ${emptyStateStyle}
  color: #d32f2f;

  h3 {
    color: #d32f2f;
  }

  .icon {
    color: #d32f2f;
  }

  ul {
    text-align: left;
    margin: 10px 0;
    padding-left: 20px;
  }

  li {
    margin: 5px 0;
  }
`

/**
 * Loading state styles
 */
export const loadingStateStyle = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;

  .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #3498db;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  p {
    margin-top: 20px;
    color: #666;
  }
`

/**
 * Warning banner styles
 */
export const warningBannerStyle = css`
  padding: 10px;
  background-color: #fff3cd;
  border-top: 1px solid #ffc107;
  font-size: 12px;
  text-align: center;
  color: #856404;
`

/**
 * Screen reader only styles (accessibility)
 */
export const srOnlyStyle = css`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
`
