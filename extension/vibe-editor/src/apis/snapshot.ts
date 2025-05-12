import {
  CreateSnapshotRequest,
  Snapshot,
  UpdateSnapshotRequest,
} from '../types/snapshot'
import {
  deleteRequest,
  getRequest,
  postBooleanRequest,
  postRequest,
  putBooleanRequest,
} from './api'

export const getSnapshotDetail = async (snapshotId: number) =>
  await getRequest<Snapshot>(`/snapshot/${snapshotId}`)

export const updateSnapshot = async ({
  snapshotId,
  snapshotName,
}: UpdateSnapshotRequest) =>
  await putBooleanRequest<Snapshot[]>(`/snapshot/${snapshotId}`, {
    snapshotName,
  })

export const removeSnapshot = async (templateId: number) =>
  await deleteRequest<Snapshot[]>(`/snapshot/${templateId}`)

export const getSnapshotList = async (snapshotIdList: number[]) =>
  await postRequest<Snapshot[]>(`/snapshot/list`, {
    snapshotIdList,
  })

export const addSnapshot = async (data: CreateSnapshotRequest) =>
  await postBooleanRequest(`/snapshot`, data)
