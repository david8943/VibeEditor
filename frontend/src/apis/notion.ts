import { CreateDatabase, Database } from '../types/database'
import { deleteBooleanRequest, getRequest, postBooleanRequest } from './api'

// 노션 시크릿 키 등록
export const registerNotionSecretKey = async (notionSecretKey: string) =>
  await postBooleanRequest('/notion/secretkey', { notionSecretKey })

// 노션 데이터베이스 등록하기
export const addNotionDatabase = async (data: CreateDatabase) =>
  await postBooleanRequest('/notion/database', data)

// 노션 Database 목록 조회
export const retrieveNotionDatabases = async () =>
  await getRequest<Database[]>('/notion/database')

// 노션 Database 삭제 작동 안 됨
export const removeNotionDatabase = async (notionDatabaseId: number) =>
  await deleteBooleanRequest(`/notion/database/${notionDatabaseId}`)
