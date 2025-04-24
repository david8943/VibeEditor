import * as vscode from 'vscode'

import { Configuration } from '../configuration'

export class NotionService {
  private context: vscode.ExtensionContext

  constructor(context: vscode.ExtensionContext) {
    this.context = context
  }
  public async setNotionApi(): Promise<void> {
    try {
      const notionToken = await vscode.window.showInputBox({
        prompt: 'Notion API 토큰을 입력해주세요.',
      })
      const notionStatus = notionToken !== ''

      if (!notionToken) {
        vscode.window.showErrorMessage('토큰을 입력해주세요.')
        return
      }
      vscode.window.showInformationMessage(notionToken)
      vscode.window.showInformationMessage(notionStatus.toString())
      await this.context.secrets.store('notionToken', notionToken)
      await vscode.commands.executeCommand(
        'setContext',
        'vibeEditor.notionStatus',
        notionStatus,
      )
      vscode.window.showInformationMessage('Notion 등록 성공' + notionStatus)
    } catch (error) {
      vscode.window.showErrorMessage('Notion 등록 실패')
    }
  }
}
