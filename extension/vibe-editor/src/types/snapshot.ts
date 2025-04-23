export interface CodeSnapshot {
  id: string
  filePath: string
  relativePath: string
  lineRange: string
  content: string
  createdAt: string
}
export interface Snapshot {
  snapshotId: number
  snapshotName: string
  snapshotType: 'code' | 'directory' | 'log'
  content: string
  createdAt: string
  updatedAt: string
}
