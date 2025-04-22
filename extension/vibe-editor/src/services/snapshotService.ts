import { CodeSnapshotProvider } from '../views/codeSnapshotView'

let providerInstance: CodeSnapshotProvider | undefined

export function setSnapshotProvider(provider: CodeSnapshotProvider) {
  providerInstance = provider
}

export function getSnapshotProvider(): CodeSnapshotProvider | undefined {
  return providerInstance
}
