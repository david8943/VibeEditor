export const SnapshotType = {
  BLOCK: 'BLOCK',
  FILE: 'FILE',
  LOG: 'LOG',
  DIRECTORY: 'DIRECTORY',
}
export type SnapshotType = (typeof SnapshotType)[keyof typeof SnapshotType]
export interface Snapshot {
  snapshotId: number
  snapshotName: string
  snapshotType: SnapshotType
  snapshotContent: string // TODO : snapshotContent
  createdAt: string
  updatedAt: string
}

export interface UpdateSnapshotRequest {
  snapshotId: number
  snapshotName: string
}

export interface CreateSnapshotRequest {
  templateId: number
  snapshotName: string
  snapshotType: SnapshotType
  snapshotContent: string
}

export const TypeOrder = {
  [SnapshotType.FILE]: 1,
  [SnapshotType.DIRECTORY]: 2,
  [SnapshotType.LOG]: 3,
}
