import * as path from 'path'
import * as vscode from 'vscode'

import { setDraftData } from '../../configuration/draftData'
import { DraftDataType } from '../../types/configuration'
import {
  addNotionDatabase,
  removeNotionDatabase,
  retrieveNotionDatabases,
} from '../../apis/notion'
import { getCurrentUser } from '../../apis/user'
import { getDraftData, setDraftData } from '../../configuration/draftData'
import { DraftDataType } from '../../types/configuration'
import { CreateDatabase } from '../../types/database'
import {
  CommonMessage,
  Message,
  MessageType,
  PageType,
} from '../../types/webview'

export class SettingViewLoader {
  public static currentPanel?: vscode.WebviewPanel
  private panel: vscode.WebviewPanel
  private context: vscode.ExtensionContext
  private disposables: vscode.Disposable[]
  private currentPage: PageType

  constructor(context: vscode.ExtensionContext, initialPage: PageType) {
    this.context = context
    this.disposables = []
    this.currentPage = initialPage

    this.panel = vscode.window.createWebviewPanel(
      'vibeEditor',
      this.getTitle(initialPage),
      vscode.ViewColumn.One,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [
          vscode.Uri.file(path.join(this.context.extensionPath, 'dist', 'app')),
        ],
      },
    )

    this.renderPage(this.currentPage)

    this.setupMessageListeners()
  }
  private async navigate(page: PageType) {
    this.currentPage = page
    this.panel.title = this.getTitle(page)
    this.panel.webview.postMessage({
      type: 'NAVIGATE',
      payload: { page },
    })
  }
  private async getLoginStatus() {
    const loginStatus = getDraftData(DraftDataType.loginStatus)
    this.panel.webview.postMessage({
      type: MessageType.LOGIN_STATUS_LOADED,
      payload: loginStatus,
    })
  }

  private async logout() {
    vscode.commands.executeCommand('vibeEditor.logout')
    this.panel.webview.postMessage({
      type: MessageType.LOGIN_STATUS_LOADED,
      payload: false,
    })
  }

  private async getUser() {
    const result = await getCurrentUser()
    console.log(result)
    if (result.success) {
      this.panel.webview.postMessage({
        type: MessageType.USER_LOADED,
        payload: result.data,
      })
    }
  }
  private async saveDatabase(data: CreateDatabase) {
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
        this.panel.webview.postMessage({
          type: MessageType.GET_DATABASE,
          payload: databases,
        })
      }
    }
  }

  private async getDatabase() {
    const dbs = this.context.globalState.get('notionDatabases', [])
    this.panel.webview.postMessage({
      type: MessageType.GET_DATABASE,
      payload: dbs,
    })
  }

  private async googleLogin() {
    vscode.commands.executeCommand('vibeEditor.googleLogin')
  }

  private async githubLogin() {
    vscode.commands.executeCommand('vibeEditor.githubLogin')
  }

  private async setNotionSecretKey() {
    vscode.commands.executeCommand('vibeEditor.setNotionApi')
  }
  private setupMessageListeners() {
    this.panel.webview.onDidReceiveMessage(
      async (message: Message) => {
        if (message.type === MessageType.NAVIGATE) {
          await this.navigate(message.payload?.page)
        } else if (message.type === MessageType.WEBVIEW_READY) {
          this.panel.webview.postMessage({
            type: MessageType.INITIAL_PAGE,
            payload: { page: this.currentPage },
          })
        } else if (message.type === MessageType.COMMON) {
          const text = (message as CommonMessage).payload
          vscode.window.showInformationMessage(
            `Received message from Webview: ${text}`,
          )
        } else if (message.type === MessageType.GET_LOGIN_STATUS) {
          await this.getLoginStatus()
        } else if (message.type === MessageType.GET_USER) {
          await this.getUser()
        } else if (message.type === MessageType.SAVE_DATABASE) {
          console.log('SAVE_DATABASE', message)
          await this.saveDatabase(message.payload)
        } else if (message.type === MessageType.GET_DATABASE) {
          console.log('GET_DATABASE', message)
          await this.getDatabase()
        } else if (message.type === MessageType.LOG_OUT) {
          console.log('LOG_OUT', message)
          await this.logout()
        } else if (message.type === MessageType.GOOGLE_LOGIN) {
          console.log('GOOGLE_LOGIN', message)
          await this.googleLogin()
        } else if (message.type === MessageType.GITHUB_LOGIN) {
          console.log('GITHUB_LOGIN', message)
          await this.githubLogin()
        } else if (message.type === MessageType.SET_NOTION_SECRET_KEY) {
          await this.setNotionSecretKey()
        }
      },
      null,
      this.disposables,
    )

    this.panel.onDidDispose(() => this.dispose(), null, this.disposables)
  }

  private renderPage(page: string) {
    const html = this.render()
    this.panel.webview.html = html
    // this.panel.webview.postMessage({
    //   type: 'INITIAL_PAGE',
    //   payload: { page },
    // })
  }

  static async showWebview(
    context: vscode.ExtensionContext,
    page: PageType,
    payload?: any, // 템플릿 or 포스트 등
  ) {
    const cls = this
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined

    if (cls.currentPanel) {
      cls.currentPanel.reveal(column)
      cls.currentPanel.webview.postMessage({
        type: MessageType.NAVIGATE,
        payload: { page },
      })

      if (page === PageType.POST_VIEWER && payload) {
        cls.currentPanel.webview.postMessage({
          type: MessageType.SHOW_POST_VIEWER,
          payload,
        })
      }
    } else {
      const loader = new cls(context, page)
      cls.currentPanel = loader.panel

      // 템플릿이 전달된 경우 (기존 로직 유지)
      if (page === PageType.TEMPLATE && payload) {
        setDraftData(DraftDataType.selectedTemplateId, payload.templateId)
        vscode.commands.executeCommand(
          'vibeEditor.refreshSnapshot',
          payload.templateId,
        )

        loader.panel.webview.postMessage({
          type: MessageType.TEMPLATE_SELECTED,
          payload: { template: payload },
        })
      }

      if (page === PageType.POST_VIEWER && payload) {
        loader.panel.webview.postMessage({
          type: MessageType.SHOW_POST_VIEWER,
          payload,
        })
      }
    }
  }

  static postMessageToWebview = (message: Message) => {
    if (window.vscode) {
      window.vscode.postMessage(message)
    }
  }

  public dispose() {
    SettingViewLoader.currentPanel = undefined

    this.panel.dispose()

    while (this.disposables.length) {
      const x = this.disposables.pop()
      if (x) {
        x.dispose()
      }
    }
  }

  render() {
    const bundleScriptPath = this.panel.webview.asWebviewUri(
      vscode.Uri.file(
        path.join(this.context.extensionPath, 'dist', 'app', 'bundle.js'),
      ),
    )

    return `
      <!DOCTYPE html>
      <html lang="ko">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>템플릿 생성</title>
          <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
          <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
        </head>
        <body>
          <div id="root"></div>
          <script>
            const vscode = acquireVsCodeApi();
            window.vscode = vscode;
          </script>
          <script src="${bundleScriptPath}"></script>
        </body>
      </html>
    `
  }

  private getTitle(page: string): string {
    switch (page) {
      case PageType.TEMPLATE:
        return '프롬프트 생성기'
      case PageType.POST:
        return '포스트 생성기'
      default:
        return 'Vibe Editor'
    }
  }
}
