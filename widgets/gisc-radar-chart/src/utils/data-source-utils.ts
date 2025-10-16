import { DataSourceStatus, type DataSource } from 'jimu-core'

/**
 * Check if a data source is valid and ready to use
 *
 * @param dataSource The data source to check
 * @returns true if data source exists and is not in NotReady status
 */
export const isDataSourceValid = (dataSource: DataSource): boolean => {
  return dataSource != null && dataSource.getStatus() !== DataSourceStatus.NotReady
}

/**
 * Check if a data source is ready for querying
 *
 * @param dataSource The data source to check
 * @returns true if data source is loaded or unloaded (ready for query)
 */
export const isDataSourceReady = (dataSource: DataSource): boolean => {
  if (!dataSource) return false
  const status = dataSource.getStatus()
  return status === DataSourceStatus.Loaded || status === DataSourceStatus.Unloaded
}
