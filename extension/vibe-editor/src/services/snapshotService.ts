import * as vscode from 'vscode'

import { Snapshot } from '../types/snapshot'
import { SnapshotProvider } from '../views/codeSnapshotView'
import { SnapshotItem } from '../views/codeSnapshotView'

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

  public async deleteSnapshot(snapshot: SnapshotItem): Promise<void> {
    const prevSnapshots =
      this.context.globalState.get<Snapshot[]>('snapshots') || []

    const updatedSnapshots = prevSnapshots.filter(
      (s) => s.snapshotId !== snapshot.snapshot.snapshotId,
    )

    await this.context.globalState.update('snapshots', updatedSnapshots)

    vscode.window.showInformationMessage(`스냅샷이 삭제되었습니다.`)

    refreshAllProviders()
  }

  async renameSnapshot(snapshotId: number): Promise<void> {
    const prev = this.context.globalState.get<Snapshot[]>('snapshots') || []
    const snapshotIndex = prev.findIndex(
      (snapshot) => snapshot.snapshotId === snapshotId,
    )
    if (snapshotIndex === -1) {
      vscode.window.showInformationMessage('스냅샷을 찾을 수 없습니다.')
      return
    }

    vscode.window
      .showInputBox({
        value: prev[snapshotIndex].snapshotName,
        prompt: '스냅샷 이름을 입력하세요',
        placeHolder: prev[snapshotIndex].snapshotName,
      })
      .then(async (value) => {
        if (value) {
          prev[snapshotIndex].snapshotName = value
          await this.context.globalState.update('snapshots', prev)
          refreshAllProviders()
        }
      })
  }

  public async copyCode(): Promise<void> {
    const text = await vscode.env.clipboard.readText()

    const title = await vscode.window.showInputBox({
      prompt: `${text} 로그의 제목을 입력해주세요.`,
      placeHolder: '로그 제목',
    })
    if (!title) {
      vscode.window.showWarningMessage('⚠️ 로그 제목을 입력해주세요.')
      return
    }

    const snapshot: Snapshot = {
      snapshotId: new Date().getTime(),
      snapshotName: title,
      snapshotType: 'log',
      content: text,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    const prev = this.context.globalState.get<Snapshot[]>('snapshots') || []
    await this.context.globalState.update('snapshots', [snapshot, ...prev])

    vscode.window.showInformationMessage('📸 코드 스냅샷이 저장되었습니다!')
    refreshAllProviders()
    // const selection = editor.selection
    // const text = editor.document.getText(selection)

    //   if (text.trim()) {
    //     await vscode.env.clipboard.writeText(text)
    //     vscode.window.showInformationMessage(
    //       '✅ 코드가 클립보드에 복사되었습니다!',
    //     )
    //   } else {
    //     vscode.window.showWarningMessage('⚠️ 복사할 코드가 없습니다.')
    //   }
  }
}
