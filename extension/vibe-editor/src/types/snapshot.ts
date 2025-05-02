export const SnapshotType = {
  CODE: 'code',
  DIRECTORY: 'directory',
  LOG: 'log',
} //   TDOO : ('BLOCK' | ‘FILE’ | ‘LOG’ | 'DIRECTORY’),
// TODO: 대문자로 변경 필요
export type SnapshotType = (typeof SnapshotType)[keyof typeof SnapshotType]
export interface Snapshot {
  snapshotId: number
  snapshotName: string
  snapshotType: 'code' | 'directory' | 'log' // TODO: block file  log diectory 로 수정 해야 함
  content: string // TODO : snapshotContent
  createdAt: string
  updatedAt: string
}
