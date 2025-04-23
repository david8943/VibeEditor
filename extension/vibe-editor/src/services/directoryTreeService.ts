import * as fs from 'fs'
import * as path from 'path'
import * as vscode from 'vscode'

import { Snapshot } from '../types/snapshot'
import { SnapshotProvider } from '../views/codeSnapshotView'

let providerInstance: SnapshotProvider | undefined

export function setSnapshotProvider(provider: SnapshotProvider) {
  providerInstance = provider
}

export function getSnapshotProvider(): SnapshotProvider | undefined {
  return providerInstance
}
export class DirectoryTreeService {
  private context: vscode.ExtensionContext

  constructor(context: vscode.ExtensionContext) {
    this.context = context
  }

  public async generateTree(dirPath: string, prefix = ''): Promise<string> {
    try {
      const entries = fs.readdirSync(dirPath, { withFileTypes: true })
      let result = ''

      for (const entry of entries) {
        const entryPath = path.join(dirPath, entry.name)
        result += `${prefix}${entry.name}\n`

        if (entry.isDirectory()) {
          result += await this.generateTree(entryPath, prefix + '  ')
        }
      }

      // 최상위 디렉토리에서만 스냅샷 생성
      if (prefix === '') {
        const timestamp = new Date()
          .toISOString()
          .replace(/[-:]/g, '')
          .split('.')[0]

        const snapshot: Snapshot = {
          snapshotId: new Date().getTime(),
          snapshotName: dirPath,
          snapshotType: 'directory',
          content: result,
          createdAt: timestamp,
          updatedAt: timestamp,
        }

        const prev = this.context.globalState.get<Snapshot[]>('snapshots') || []
        await this.context.globalState.update('snapshots', [snapshot, ...prev])

        vscode.window.showInformationMessage(
          '📸 디렉토리 트리 스냅샷이 저장되었습니다!',
        )
        vscode.commands.executeCommand(
          'workbench.view.extension.vibeEditorDirectoryTreeSnapshot',
        )
      }

      getSnapshotProvider()?.refresh()
      return result
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : '알 수 없는 오류가 발생했습니다.'
      vscode.window.showErrorMessage(
        `디렉토리 트리 생성 중 오류 발생: ${errorMessage}`,
      )
      return ''
    }
  }
}
