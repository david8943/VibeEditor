export interface Database {
  notionDatabaseId: number
  notionDatabaseName: string
  notionDatabaseUid: string
  createdAt: string
  updatedAt: string
}

export interface CreateDatabase
  extends Pick<Database, 'notionDatabaseName' | 'notionDatabaseUid'> {}
