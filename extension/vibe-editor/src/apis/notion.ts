import {
  deleteRequest,
  getRequest,
  patchRequest,
  postBooleanRequest,
  postRequest,
} from './api'

//registerNotionSecretKey 노션 시크릿 키 등록
export const registerNotionSecretKey = async (notionSecretKey: string) =>
  await postBooleanRequest('/notion/secretkey', { notionSecretKey })

// 노션 데이터베이스 등록하기
export const addNotionDatabase = async ({
  notionDatabaseName,
  notionDatabaseUid,
}: {
  notionDatabaseName: string
  notionDatabaseUid: string
}) =>
  await postBooleanRequest('/notion/database', {
    notionDatabaseName,
    notionDatabaseUid,
  })

// 노션 데이터베이스 삭제하기
export const deleteNotionDatabase = async (notionDatabaseId: number) =>
  await postBooleanRequest(`/notion/database/${notionDatabaseId}`)
