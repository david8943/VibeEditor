import * as vscode from 'vscode'

import { CodeSnapshot, Snapshot } from '../types/snapshot'
import { SnapshotProvider } from '../views/codeSnapshotView'

let codeProviderInstance: SnapshotProvider | undefined
let directoryProviderInstance: SnapshotProvider | undefined
let logProviderInstance: SnapshotProvider | undefined

export function setCodeSnapshotProvider(provider: SnapshotProvider) {
  codeProviderInstance = provider
}

export function setDirectorySnapshotProvider(provider: SnapshotProvider) {
  directoryProviderInstance = provider
}

export function setLogSnapshotProvider(provider: SnapshotProvider) {
  logProviderInstance = provider
}

export function refreshAllProviders() {
  codeProviderInstance?.refresh()
  directoryProviderInstance?.refresh()
  logProviderInstance?.refresh()
}

export class SnapshotService {
  private context: vscode.ExtensionContext

  constructor(context: vscode.ExtensionContext) {
    this.context = context
  }
  public async captureSnapshot(): Promise<void> {
    const editor = vscode.window.activeTextEditor
    if (!editor) return

    const document = editor.document
    const selection = editor.selection
    const selectedText = document.getText(selection).trim()

    if (!selectedText) {
      vscode.window.showWarningMessage('⚠️ 드래그한 코드가 없습니다.')
      return
    }

    const filePath = document.uri.fsPath
    const relativePath = vscode.workspace.asRelativePath(filePath)
    const startLine = selection.start.line + 1
    const endLine = selection.end.line + 1
    const timestamp = new Date()
      .toISOString()
      .replace(/[-:]/g, '')
      .split('.')[0]
    const id = `${relativePath}_${startLine}-${endLine}_${timestamp}`

    const snapshot: Snapshot = {
      snapshotId: new Date().getTime(),
      snapshotName: id,
      snapshotType: 'code',
      content: selectedText,
      createdAt: timestamp,
      updatedAt: timestamp,
    }

    const prev = this.context.globalState.get<Snapshot[]>('snapshots') || []
    await this.context.globalState.update('snapshots', [snapshot, ...prev])

    vscode.window.showInformationMessage('📸 코드 스냅샷이 저장되었습니다!')
    vscode.commands.executeCommand(
      'workbench.view.extension.vibeEditorCodeSnapshot',
    )

    refreshAllProviders()
  }

  async getSnapshots(): Promise<Snapshot[]> {
    return this.context.globalState.get<Snapshot[]>('snapshots') || []
  }
}
