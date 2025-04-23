export interface Snapshot {
  snapshotId: number
  snapshotName: string
  snapshotType: 'code' | 'directory' | 'log'
  content: string
  createdAt: string
  updatedAt: string
}
