/** @jsx jsx */
import { React, jsx, css } from 'jimu-core'
import { SettingRow } from 'jimu-ui/advanced/setting-components'
import { Slider, Button } from 'jimu-ui'
import { ThemeColorPicker } from 'jimu-ui/basic/color-picker'
import { PlusOutlined } from 'jimu-icons/outlined/editor/plus'
import { CloseOutlined } from 'jimu-icons/outlined/editor/close'
import type { ChartOptions } from '../../config'
import { DEFAULT_COLORS } from '../../utils/chart-defaults'

interface ChartStylingConfigProps {
  colors?: string[]
  chartOptions: ChartOptions
  onChange: (key: string, value: any) => void
  onColorsChange: (colors: string[]) => void
  theme?: any
}

/**
 * Chart Styling Configuration Component
 */
const ChartStylingConfig: React.FC<ChartStylingConfigProps> = ({
  colors = [],
  chartOptions,
  onChange,
  onColorsChange,
  theme
}) => {
  const currentColors = colors.length > 0 ? colors : DEFAULT_COLORS

  const handleColorChange = (index: number, color: string) => {
    const newColors = [...currentColors]
    newColors[index] = color
    onColorsChange(newColors)
  }

  const handleAddColor = () => {
    const newColors = [...currentColors, '#3498db']
    onColorsChange(newColors)
  }

  const handleRemoveColor = (index: number) => {
    if (currentColors.length <= 1) return
    const newColors = [...currentColors]
    newColors.splice(index, 1)
    onColorsChange(newColors)
  }

  const handleResetColors = () => {
    onColorsChange(DEFAULT_COLORS)
  }

  return (
    <div>
      {/* Point Radius */}
      <SettingRow label="Point Size" flow="wrap">
        <div className="w-100 d-flex align-items-center">
          <div className="flex-grow-1">
            <Slider
              value={chartOptions.pointRadius ?? 3}
              onChange={(e) => { onChange('pointRadius', Number(e.target.value)) }}
              min={0}
              max={10}
              step={1}
              aria-label="Point size"
            />
          </div>
          <div css={css`
            font-size: 12px;
            color: #666;
            margin-left: 12px;
            min-width: 40px;
          `}>
            {chartOptions.pointRadius ?? 3}px
          </div>
        </div>
      </SettingRow>

      {/* Fill Opacity */}
      <SettingRow label="Fill Opacity" flow="wrap">
        <div className="w-100 d-flex align-items-center">
          <div className="flex-grow-1">
            <Slider
              value={Math.round((chartOptions.fillOpacity ?? 0.2) * 100)}
              onChange={(e) => { onChange('fillOpacity', Number(e.target.value) / 100) }}
              min={0}
              max={100}
              step={5}
              aria-label="Fill opacity"
            />
          </div>
          <div css={css`
            font-size: 12px;
            color: #666;
            margin-left: 12px;
            min-width: 40px;
          `}>
            {Math.round((chartOptions.fillOpacity ?? 0.2) * 100)}%
          </div>
        </div>
      </SettingRow>

      {/* Custom Colors */}
      <SettingRow label="Series Colors" flow="wrap">
        <div className="w-100">
          {currentColors.map((color, index) => (
            <div
              key={index}
              className="d-flex align-items-center mb-2"
              css={css`
                gap: 8px;
              `}
            >
              <ThemeColorPicker
                className="flex-grow-1"
                specificTheme={theme}
                value={color}
                onChange={(newColor) => { handleColorChange(index, newColor) }}
              />
              <span css={css`
                font-size: 12px;
                color: #666;
                min-width: 60px;
              `}>
                Series {index + 1}
              </span>
              {currentColors.length > 1 && (
                <Button
                  size="sm"
                  type="tertiary"
                  icon
                  onClick={() => { handleRemoveColor(index) }}
                  aria-label={`Remove series ${index + 1} color`}
                >
                  <CloseOutlined />
                </Button>
              )}
            </div>
          ))}

          <div className="d-flex mt-2" css={css`gap: 8px;`}>
            <Button size="sm" onClick={handleAddColor}>
              <PlusOutlined /> Add Color
            </Button>
            <Button size="sm" type="secondary" onClick={handleResetColors}>
              Reset to Default
            </Button>
          </div>
        </div>
      </SettingRow>
    </div>
  )
}

export default ChartStylingConfig
