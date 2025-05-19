import path from 'path'
import * as vscode from 'vscode'

import { getAiProviderList, registerUserAPIKey } from '../apis/ai'
import {
  addNotionDatabase,
  removeNotionDatabase,
  retrieveNotionDatabases,
} from '../apis/notion'
import { getCurrentUser } from '../apis/user'
import { Configuration } from '../configuration'
import { getDraftData, setDraftData } from '../configuration/draftData'
import { PostService } from '../services/postService'
import { SnapshotService } from '../services/snapshotService'
import { TemplateService } from '../services/templateService'
import { ViewService } from '../services/viewService'
import { AIAPIKey, AIProvider } from '../types/ai'
import { DraftDataType } from '../types/configuration'
import { CreateDatabase, Database, UpdateDatabase } from '../types/database'
import { Post, UploadToNotionRequestPost } from '../types/post'
import {
  SelectPrompt,
  SubmitCreatePrompt,
  SubmitUpdatePrompt,
} from '../types/template'
import { Message, MessageType, PageType } from '../types/webview'

export class SettingService {
  private context: vscode.ExtensionContext
  constructor(context: vscode.ExtensionContext) {
    this.context = context
  }
  public async showReadme() {
    const readmePath = path.join(this.context.extensionPath, 'README.md')
    console.log('README path:', readmePath)
    try {
      const uri = vscode.Uri.file(readmePath)
      await vscode.commands.executeCommand('markdown.showPreview', uri)
    } catch (error) {
      console.error('README 열기 실패:', error)
    }
  }

  public async saveDatabase(data: CreateDatabase): Promise<Database[]> {
    const success = await addNotionDatabase({
      notionDatabaseName: data.notionDatabaseName,
      notionDatabaseUid: data.notionDatabaseUid,
    })

    if (success) {
      const result = await retrieveNotionDatabases()
      if (result.success) {
        const databases = result.data
        await this.context.globalState.update('notionDatabases', databases)
        vscode.window.showInformationMessage('DB 저장 완료')
        return databases
      }
    }
    return []
  }
  public getLocalDatabase() {
    return this.context.globalState.get<Database[]>('notionDatabases', [])
  }

  public async deleteDatabase(
    database: UpdateDatabase,
  ): Promise<number | null> {
    const { notionDatabaseId, notionDatabaseName } = database
    const confirm = await vscode.window.showInformationMessage(
      `'${notionDatabaseName}' 데이터베이스를 삭제하시겠습니까?`,
      { modal: true },
      '삭제',
    )
    if (confirm === '삭제') {
      const existing = this.context.globalState.get<Database[]>(
        'notionDatabases',
        [],
      )
      const updated = existing.filter(
        (db) => db.notionDatabaseId !== notionDatabaseId,
      )

      await this.context.globalState.update('notionDatabases', updated)
      const success = await removeNotionDatabase(notionDatabaseId)

      if (success) {
        const result = await retrieveNotionDatabases()
        if (result.success) {
          const databases = result.data
          await this.context.globalState.update('notionDatabases', databases)
          return notionDatabaseId
        }
      }
      vscode.window.showInformationMessage('삭제가 완료되었습니다.')
    }
    return null
  }

  public async getAIProviders(): Promise<AIProvider[]> {
    const result = await getAiProviderList()
    if (result.success) {
      return result.data
    }
    return []
  }

  public async saveAIProvider(aiProvider: AIAPIKey): Promise<void> {
    const success = await registerUserAPIKey(aiProvider)
    if (success) {
      vscode.window.showInformationMessage('AI 공급자 저장 완료')
    } else {
      vscode.window.showInformationMessage('AI 공급자 저장 실패')
    }
  }
  public async fetchUser(): Promise<void> {
    const result = await getCurrentUser()
    if (result.success) {
      setDraftData(DraftDataType.notionStatus, result.data.notionActive)
      if (!result.data.notionActive) {
        vscode.window.showInformationMessage('Notion 정보 등록이 필요합니다.')
      }
    }
  }
}
