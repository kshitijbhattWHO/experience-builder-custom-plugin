import {
  type DataSourceJson,
  type DataSourceSchema,
  type UseDataSource,
  DataSourceTypes,
  type IMDataSourceSchema,
  JimuFieldType,
  type FieldSchema,
  EsriFieldType,
  DataSourceManager
} from 'jimu-core'

const ObjectIdField = '__OBJECTID'

const ObjectIdSchema: FieldSchema = {
  jimuName: ObjectIdField,
  alias: 'OBJECTID',
  type: JimuFieldType.Number,
  esriType: EsriFieldType.OID,
  name: ObjectIdField
}

/**
 * Get field schema from original data source
 * @param fieldName - Field name in the original data source
 * @param dataSourceId - Original data source ID
 */
const getFieldSchemaFromDataSource = (
  fieldName: string,
  dataSourceId: string
): FieldSchema | null => {
  try {
    const dataSource = DataSourceManager.getInstance().getDataSource(dataSourceId)
    if (!dataSource) return null

    const schema = dataSource.getSchema()
    if (!schema?.fields) return null

    const fieldSchema = schema.fields[fieldName]
    if (!fieldSchema) return null

    return fieldSchema as FieldSchema
  } catch (error) {
    console.error(`Error getting field schema for ${fieldName}:`, error)
    return null
  }
}

/**
 * Get the initial data source schema with only OBJECTID field.
 * This is used when no configuration is available yet.
 * @param label
 */
const getInitSchema = (label: string = ''): DataSourceSchema => {
  return {
    label,
    idField: ObjectIdSchema.jimuName,
    fields: {
      [ObjectIdSchema.jimuName]: ObjectIdSchema
    }
  } as DataSourceSchema
}

/**
 * Build schema for radar chart output data source
 * Includes fields from the original data source based on chart configuration
 *
 * @param label - Schema label
 * @param useDataSource - Original data source configuration
 * @param categoryField - Category field name (e.g., "Indicator")
 * @param valueFields - Value field names (e.g., ["Value"])
 * @param splitByField - Optional split-by field name
 */
export const buildRadarChartSchema = (
  label: string,
  useDataSource: UseDataSource,
  categoryField?: string,
  valueFields?: string[],
  splitByField?: string
): DataSourceSchema => {
  const fields: { [jimuName: string]: FieldSchema } = {
    [ObjectIdSchema.jimuName]: ObjectIdSchema
  }

  if (!useDataSource?.dataSourceId) {
    return { label, idField: ObjectIdSchema.jimuName, fields } as DataSourceSchema
  }

  const dataSourceId = useDataSource.dataSourceId

  // Add category field to schema
  if (categoryField) {
    const categorySchema = getFieldSchemaFromDataSource(categoryField, dataSourceId)
    if (categorySchema) {
      fields[categoryField] = {
        ...categorySchema,
        jimuName: categoryField,
        name: categoryField,
        originFields: [categoryField]
      }
    }
  }

  // Add value fields to schema
  if (valueFields && valueFields.length > 0) {
    valueFields.forEach(valueField => {
      const valueSchema = getFieldSchemaFromDataSource(valueField, dataSourceId)
      if (valueSchema) {
        fields[valueField] = {
          ...valueSchema,
          jimuName: valueField,
          name: valueField,
          originFields: [valueField]
        }
      }
    })
  }

  // Add split-by field to schema
  if (splitByField) {
    const splitSchema = getFieldSchemaFromDataSource(splitByField, dataSourceId)
    if (splitSchema) {
      fields[splitByField] = {
        ...splitSchema,
        jimuName: splitByField,
        name: splitByField,
        originFields: [splitByField]
      }
    }
  }

  return {
    label,
    idField: ObjectIdSchema.jimuName,
    fields
  } as DataSourceSchema
}

/**
 * Get original fields from output ds schema (without objectid field)
 * @param schema
 */
export const getSchemaOriginFields = (schema: IMDataSourceSchema): string[] => {
  if (!schema?.fields) return []
  const fields = []
  Object.entries(schema.fields)?.forEach(([fieldName, fieldSchema]) => {
    // The objectid field is required in the schema, but it may not be used
    if (fieldName === ObjectIdSchema.jimuName && fieldSchema.jimuName === ObjectIdSchema.jimuName) {
      return null
    }
    const originFields = fieldSchema.originFields ?? []
    originFields.forEach((field) => {
      if (field) {
        fields.push(field)
      }
    })
  })
  return Array.from(new Set(fields))
}

/**
 * Create the initial output data source for the radar chart widget.
 * This data source exposes processed chart data to other widgets.
 *
 * @param id - Output data source ID
 * @param label - Human-readable label for the output data source
 * @param useDataSource - Original data source configuration
 * @param categoryField - Category field name from chart config
 * @param valueFields - Value field names from chart config
 * @param splitByField - Split-by field name from chart config
 */
export const createInitOutputDataSource = (
  id: string,
  label: string,
  useDataSource: UseDataSource,
  categoryField?: string,
  valueFields?: string[],
  splitByField?: string
): DataSourceJson => {
  // Build schema with actual fields from chart configuration
  const schema = buildRadarChartSchema(
    label,
    useDataSource,
    categoryField,
    valueFields,
    splitByField
  )

  const outputDsJson: DataSourceJson = {
    id,
    type: DataSourceTypes.FeatureLayer,
    label,
    originDataSources: [useDataSource],
    isOutputFromWidget: true,
    isDataInDataSourceInstance: true,
    schema
  }

  console.log('[createInitOutputDataSource] Created output data source with schema:', {
    id,
    fields: Object.keys(schema.fields),
    categoryField,
    valueFields,
    splitByField
  })

  return outputDsJson
}
