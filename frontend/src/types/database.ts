export interface Database {
  notionDatabaseId: number
  notionDatabaseName: string
  notionDatabaseUid: string
  createdAt: string
  updatedAt: string
}

export interface CreateDatabase
  extends Pick<Database, 'notionDatabaseName' | 'notionDatabaseUid'> {}

export interface UpdateDatabase
  extends Pick<Database, 'notionDatabaseName' | 'notionDatabaseId'> {}
