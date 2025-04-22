import * as vscode from 'vscode'

import { getSnapshotProvider } from '../services/snapshotService'
import { ICommand } from '../types'

// ✅ 변경된 import

interface CodeSnapshot {
  id: string
  filePath: string
  relativePath: string
  lineRange: string
  content: string
  createdAt: string
}

export class CaptureSnapshotCommand implements ICommand {
  public static readonly commandName = 'vibe-editor.captureSnapshot'

  constructor(private readonly context: vscode.ExtensionContext) {}

  public get commandName(): string {
    return CaptureSnapshotCommand.commandName
  }

  public async execute(): Promise<void> {
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

    const snapshot: CodeSnapshot = {
      id,
      filePath,
      relativePath,
      lineRange: `${startLine}-${endLine}`,
      content: selectedText,
      createdAt: timestamp,
    }

    const prev =
      this.context.workspaceState.get<CodeSnapshot[]>('codeSnapshots') || []
    await this.context.workspaceState.update('codeSnapshots', [
      snapshot,
      ...prev,
    ])

    vscode.window.showInformationMessage('📸 코드 스냅샷이 저장되었습니다!')
    vscode.commands.executeCommand('workbench.view.extension.codeSnapshotView')

    getSnapshotProvider()?.refresh() // ✅ 사이드바 새로고침
  }
}
