export const SnapshotType = {
  CODE: 'code',
  DIRECTORY: 'directory',
  LOG: 'log',
}
export type SnapshotType = (typeof SnapshotType)[keyof typeof SnapshotType]
export interface Snapshot {
  snapshotId: number
  snapshotName: string
  snapshotType: 'code' | 'directory' | 'log'
  content: string
  createdAt: string
  updatedAt: string
}
