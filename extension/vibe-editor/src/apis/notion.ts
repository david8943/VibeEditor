import { CreateDatabase, Database } from '../types/database'
import { deleteBooleanRequest, getRequest, postBooleanRequest } from './api'

//registerNotionSecretKey 노션 시크릿 키 등록
export const registerNotionSecretKey = async (notionSecretKey: string) =>
  await postBooleanRequest('/notion/secretkey', { notionSecretKey })

// 노션 데이터베이스 등록하기
export const addNotionDatabase = async (data: CreateDatabase) =>
  await postBooleanRequest('/notion/database', data)

export const retrieveNotionDatabases = async () =>
  await getRequest<Database[]>('/notion/databases')

export const removeNotionDatabase = async (notionDatabaseId: number) =>
  await deleteBooleanRequest(`/notion/database/${notionDatabaseId}`)
