import * as vscode from 'vscode'

import { setDraftData } from '../configuration/draftData'
import { DraftDataType, SecretType } from '../types/configuration'

export class NotionService {
  private context: vscode.ExtensionContext

  constructor(context: vscode.ExtensionContext) {
    this.context = context
  }
  public async setNotionApi(): Promise<void> {
    try {
      const notionSecretKey = await vscode.window.showInputBox({
        prompt: 'Notion API 토큰을 입력해주세요.',
      })
      const notionStatus = !!notionSecretKey

      if (!notionStatus) {
        vscode.window.showErrorMessage('토큰을 입력해주세요.')
        return
      }
      await this.context.secrets.store(
        SecretType.notionSecretKey,
        notionSecretKey,
      )
      setDraftData(DraftDataType.notionStatus, notionStatus)
      vscode.window.showInformationMessage('Notion 등록 성공')
    } catch (error) {
      vscode.window.showErrorMessage('Notion 등록 실패')
    }
  }
}
