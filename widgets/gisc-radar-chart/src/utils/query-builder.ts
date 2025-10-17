import type { FeatureLayerQueryParams } from 'jimu-core'
import { CategoryType, type RadarStatisticType, type ByGroupConfig, type ByFieldConfig } from '../config'

/**
 * Generate the `outStatisticName` for query
 * Special symbols in field names are replaced to prevent service failures
 */
const getOutStatisticName = (numericField: string, statisticType: RadarStatisticType): string => {
  const SpecialSymbolRegexp = /\(|\)|\[|\]|\%/gm
  let fieldName = numericField

  if (fieldName?.match(SpecialSymbolRegexp)) {
    fieldName = fieldName.replace(SpecialSymbolRegexp, '__')
  }

  if (statisticType !== 'no_aggregation') {
    return `${statisticType === 'percentile-continuous' ? 'percentile_cont' : statisticType}_of_${fieldName}`
  } else {
    return fieldName
  }
}

/**
 * Create query for By Group category type
 * Used when grouping data by a category field and aggregating numeric values
 *
 * Example: Group hospitals by region (categoryField) and sum bed count (numericField)
 * Result: Each region becomes an axis on the spider chart
 *
 * @param config By Group configuration
 * @param pageSize Optional maximum number of categories to retrieve
 * @returns FeatureLayerQueryParams for By Group query
 */
export const createByGroupQuery = (
  config: ByGroupConfig,
  pageSize?: number
): FeatureLayerQueryParams => {
  const { categoryField, numericField, statisticType, splitByField, sortBy, sortOrder, maxCategories } = config

  const groupByFieldsForStatistics = [categoryField]
  let where = ''

  // If split-by field is provided, create placeholder for value substitution
  if (splitByField) {
    where = `${splitByField}={value}`
  }

  // Use maxCategories if specified, otherwise use default pageSize
  const resultPageSize = maxCategories || pageSize

  // Handle no-aggregation case (raw field values)
  if (statisticType === 'no_aggregation') {
    const outFields = numericField ? [numericField] : ['']
    const query: FeatureLayerQueryParams = {
      groupByFieldsForStatistics,
      outFields
    }

    if (resultPageSize) {
      query.pageSize = resultPageSize
    }
    if (where) {
      query.where = where
    }

    // Add sorting
    if (sortBy && categoryField) {
      const sortField = sortBy === 'category' ? categoryField : numericField
      const order = sortOrder === 'desc' ? 'DESC' : 'ASC'
      query.orderByFields = [`${sortField} ${order}`]
    }

    return query
  }

  // Handle aggregation case (sum, avg, min, max, count, percentile)
  const outStatisticFieldName = getOutStatisticName(numericField, statisticType)

  const outStatistic: any = {
    statisticType: statisticType === 'percentile-continuous' ? 'percentile_cont' : statisticType,
    onStatisticField: numericField,
    outStatisticFieldName
  }

  // Add percentile parameters for median calculation
  if (statisticType === 'percentile-continuous') {
    outStatistic.statisticParameters = {
      value: 0.5
    }
  }

  const query: FeatureLayerQueryParams = {
    groupByFieldsForStatistics,
    outStatistics: [outStatistic]
  }

  if (resultPageSize) {
    query.pageSize = resultPageSize
  }
  if (where) {
    query.where = where
  }

  // Add sorting
  if (sortBy && categoryField) {
    const sortField = sortBy === 'category' ? categoryField : outStatisticFieldName
    const order = sortOrder === 'desc' ? 'DESC' : 'ASC'
    query.orderByFields = [`${sortField} ${order}`]
  }

  return query
}

/**
 * Create query for By Field category type
 * Used when comparing statistics across multiple numeric fields
 *
 * Example: Compare average values of Price, Quality, Service fields
 * Result: Each field becomes an axis on the spider chart
 *
 * @param config By Field configuration
 * @returns FeatureLayerQueryParams for By Field query
 */
export const createByFieldQuery = (
  config: ByFieldConfig
): FeatureLayerQueryParams => {
  const { numericFields, statisticType } = config

  const outStatistics = numericFields.map((numericField) => {
    const statistic: any = {
      statisticType: statisticType === 'percentile-continuous' ? 'percentile_cont' : statisticType,
      onStatisticField: numericField,
      outStatisticFieldName: numericField // Use field name directly for By Field
    }

    // Add percentile parameters for median calculation
    if (statisticType === 'percentile-continuous') {
      statistic.statisticParameters = {
        value: 0.5
      }
    }

    return statistic
  })

  return { outStatistics }
}

/**
 * Create default query based on category type
 *
 * @param categoryType Type of categorization (ByGroup or ByField)
 * @returns Empty query structure for the specified category type
 */
export const createDefaultQuery = (categoryType: CategoryType = CategoryType.ByGroup): FeatureLayerQueryParams => {
  if (categoryType === CategoryType.ByGroup) {
    return {
      groupByFieldsForStatistics: [],
      outStatistics: []
    }
  } else if (categoryType === CategoryType.ByField) {
    return {
      outStatistics: []
    }
  }
}

/**
 * Get category type from query parameters
 *
 * @param query Feature layer query parameters
 * @returns CategoryType based on query structure
 */
export const getCategoryType = (query: FeatureLayerQueryParams): CategoryType => {
  if (query?.groupByFieldsForStatistics != null) {
    return CategoryType.ByGroup
  } else if (query?.outStatistics != null) {
    return CategoryType.ByField
  }

  // Default to ByGroup
  return CategoryType.ByGroup
}

/**
 * Get statistic type from query parameters
 *
 * @param query Feature layer query parameters
 * @returns RadarStatisticType extracted from query
 */
export const getStatisticType = (query: FeatureLayerQueryParams): RadarStatisticType => {
  if (query?.outFields?.length) {
    return 'no_aggregation'
  } else {
    const statType = query?.outStatistics?.[0]?.statisticType
    return statType === 'percentile_cont' ? 'percentile-continuous' : statType as RadarStatisticType
  }
}

/**
 * Get category field from query parameters
 *
 * @param query Feature layer query parameters
 * @returns Category field name
 */
export const getCategoryField = (query: FeatureLayerQueryParams): string => {
  return query?.groupByFieldsForStatistics?.[0]
}

/**
 * Get numeric fields from query parameters
 *
 * @param query Feature layer query parameters
 * @returns Array of numeric field names
 */
export const getNumericFields = (query: FeatureLayerQueryParams): string[] => {
  if (query?.outFields) {
    return query.outFields
  } else if (query?.outStatistics) {
    return query.outStatistics
      .map((outStatistic) => outStatistic?.onStatisticField)
      .filter((field) => !!field)
  }
  return []
}
