import * as vscode from 'vscode'

import { ICommand } from '../types/command'

export class CopyCodeCommand implements ICommand {
  public static readonly commandName = 'vibeEditor.copyCode'

  public get commandName(): string {
    return CopyCodeCommand.commandName
  }

  public async execute(): Promise<void> {
    const editor = vscode.window.activeTextEditor
    if (!editor) {
      return
    }

    const selection = editor.selection
    const text = editor.document.getText(selection)

    if (text.trim()) {
      await vscode.env.clipboard.writeText(text)
      vscode.window.showInformationMessage(
        '✅ 코드가 클립보드에 복사되었습니다!',
      )
    } else {
      vscode.window.showWarningMessage('⚠️ 복사할 코드가 없습니다.')
    }
  }
}
