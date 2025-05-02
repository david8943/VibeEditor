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
  content: string // TODO : snapshotContent
  createdAt: string
  updatedAt: string
}
