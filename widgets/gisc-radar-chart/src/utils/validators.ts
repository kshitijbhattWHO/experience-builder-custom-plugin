import type { FieldMapping, ChartOptions } from '../config'

/**
 * Validation result type
 */
export interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}

/**
 * Validate field mapping configuration
 */
export const validateFieldMapping = (
  fieldMapping: FieldMapping
): ValidationResult => {
  const errors: string[] = []
  const warnings: string[] = []

  // Check label field - handle both string and non-string cases
  const labelField = fieldMapping?.labelField
  if (!labelField || (typeof labelField === 'string' && labelField.trim() === '')) {
    errors.push('Label field is required')
  }

  // Check value fields
  if (!fieldMapping?.valueFields || fieldMapping.valueFields.length === 0) {
    errors.push('At least one value field is required')
  }

  if (fieldMapping?.valueFields && fieldMapping.valueFields.length > 20) {
    warnings.push('Too many value fields may affect chart readability')
  }

  // Check for duplicates
  if (fieldMapping?.valueFields && fieldMapping.valueFields.length > 0) {
    const uniqueFields = new Set(fieldMapping.valueFields)
    if (uniqueFields.size !== fieldMapping.valueFields.length) {
      errors.push('Duplicate value fields are not allowed')
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  }
}

/**
 * Validate chart options
 */
export const validateChartOptions = (
  options: ChartOptions
): ValidationResult => {
  const errors: string[] = []
  const warnings: string[] = []

  // Validate scale
  if (options.scaleMin !== undefined && options.scaleMax !== undefined) {
    if (options.scaleMin >= options.scaleMax) {
      errors.push('Scale minimum must be less than maximum')
    }

    if (options.scaleMax - options.scaleMin < 10) {
      warnings.push('Scale range is very small, may affect visualization')
    }
  }

  // Validate point radius
  if (options.pointRadius !== undefined) {
    if (options.pointRadius < 0 || options.pointRadius > 20) {
      errors.push('Point radius must be between 0 and 20')
    }
  }

  // Validate fill opacity
  if (options.fillOpacity !== undefined) {
    if (options.fillOpacity < 0 || options.fillOpacity > 1) {
      errors.push('Fill opacity must be between 0 and 1')
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  }
}

/**
 * Validate entire widget configuration
 */
export const validateWidgetConfig = (
  config: any
): ValidationResult => {
  const errors: string[] = []
  const warnings: string[] = []

  if (!config) {
    return {
      valid: false,
      errors: ['Configuration is missing'],
      warnings: []
    }
  }

  if (!config.fieldMapping) {
    errors.push('Field mapping configuration is missing')
  } else {
    const fieldMappingResult = validateFieldMapping(config.fieldMapping)
    errors.push(...fieldMappingResult.errors)
    warnings.push(...fieldMappingResult.warnings)
  }

  if (!config.chartOptions) {
    errors.push('Chart options configuration is missing')
  } else {
    const chartOptionsResult = validateChartOptions(config.chartOptions)
    errors.push(...chartOptionsResult.errors)
    warnings.push(...chartOptionsResult.warnings)
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  }
}
