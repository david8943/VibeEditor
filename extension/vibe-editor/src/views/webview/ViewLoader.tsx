import * as path from 'path'
import * as vscode from 'vscode'

import {
  addNotionDatabase,
  removeNotionDatabase,
  retrieveNotionDatabases,
} from '../../apis/notion'
import { getDraftData, setDraftData } from '../../configuration/draftData'
import { PostService } from '../../services/postService'
import { SnapshotService } from '../../services/snapshotService'
import { TemplateService } from '../../services/templateService'
import { DraftDataType } from '../../types/configuration'
import { CreateDatabase, Database } from '../../types/database'
import { PostDetail, UploadToNotionRequest } from '../../types/post'
import { SubmitPrompt } from '../../types/template'
import {
  CommonMessage,
  Message,
  MessageType,
  PageType,
} from '../../types/webview'

export class ViewLoader {
  public static currentPanel?: vscode.WebviewPanel
  private templateService: TemplateService
  private snapshotService: SnapshotService
  private postService: PostService
  private panel: vscode.WebviewPanel
  private context: vscode.ExtensionContext
  private disposables: vscode.Disposable[]
  private currentPage: string
  private currentTemplateId?: number
  private currentPostId?: number

  constructor(context: vscode.ExtensionContext, initialPage: PageType) {
    this.context = context
    this.disposables = []
    this.templateService = new TemplateService(context, initialPage)
    this.snapshotService = new SnapshotService(context)
    this.postService = new PostService(context)
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
  private async navigate(page: string) {
    this.currentPage = page
    this.panel.title = this.getTitle(page)
    this.panel.webview.postMessage({
      type: 'NAVIGATE',
      payload: { page },
    })
  }
  private async getTemplates() {
    const templates = await this.templateService.getTemplates()
    const selectedTemplateId = Number(
      getDraftData(DraftDataType.selectedTemplateId),
    )
    let selectedTemplate = templates.find(
      (template) => template.templateId === selectedTemplateId,
    )
    if (selectedTemplate) {
      this.currentTemplateId = selectedTemplate.templateId
    } else {
      this.currentTemplateId = templates[0]?.templateId
      selectedTemplate = templates[0]
    }
    this.panel.webview.postMessage({
      type: MessageType.TEMPLATE_SELECTED,
      payload: { template: selectedTemplate },
    })
  }

  private async getSnapshots() {
    const snapshots = await this.snapshotService.getSnapshots(
      this.currentTemplateId ?? 0,
    )
    this.panel.webview.postMessage({
      type: 'SNAPSHOTS_LOADED',
      payload: { snapshots },
    })
  }

  private async getCurrentPost() {
    const postId: undefined | number = getDraftData(
      DraftDataType.selectedPostId,
    )
    if (!postId) {
      return
    }
    const post = await this.postService.getPost(postId)
    this.panel.webview.postMessage({
      type: MessageType.CURRENT_POST_LOADED,
      payload: { post },
    })
  }
  private async submitPrompt(data: SubmitPrompt) {
    await this.templateService.submitPrompt({
      ...data,
      navigate: (page: PageType) => this.navigate(page),
    })
  }
  private async submitPost(data: UploadToNotionRequest) {
    await this.postService.submitToNotion(data)
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

  private setupMessageListeners() {
    this.panel.webview.onDidReceiveMessage(
      async (message: Message) => {
        if (message.type === MessageType.NAVIGATE) {
          await this.navigate(message.payload?.page)
        } else if (message.type === MessageType.RELOAD) {
          vscode.commands.executeCommand(
            'workbench.action.webview.reloadWebviewAction',
          )
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
        } else if (message.type === MessageType.SUBMIT_PROMPT) {
          await this.submitPrompt(message.payload)
        } else if (message.type === MessageType.CREATE_PROMPT) {
          await this.templateService.createPrompt(message.payload)
        } else if (message.type === MessageType.UPDATE_PROMPT) {
          await this.templateService.updatePrompt(message.payload)
        } else if (message.type === MessageType.DELETE_PROMPT) {
          await this.templateService.deletePrompt(message.payload)
        } else if (message.type === MessageType.GET_TEMPLATES) {
          await this.getTemplates()
        } else if (message.type === MessageType.GET_SNAPSHOTS) {
          await this.getSnapshots()
        } else if (message.type === MessageType.GET_CURRENT_POST) {
          await this.getCurrentPost()
        } else if (message.type === MessageType.PROMPT_SELECTED) {
          setDraftData(
            DraftDataType.selectedPromptId,
            message.payload?.selectedPromptId,
          )
        } else if (message.type === MessageType.DELETE_TEMPLATE) {
          if (this.currentTemplateId === message.payload.templateId) {
            this.panel.dispose()
          }
        } else if (message.type === MessageType.DELETE_SNAPSHOT) {
          await this.templateService.deletePromptSnapshot(
            message.payload.attachId,
            message.payload.selectedPromptId,
            message.payload.selectedTemplateId,
          )
        } else if (message.type === MessageType.SUBMIT_POST) {
          await this.submitPost(message.payload)
        } else if (message.type === MessageType.SAVE_DATABASE) {
          console.log('SAVE_DATABASE', message)
          await this.saveDatabase(message.payload)
        } else if (message.type === MessageType.GET_DATABASE) {
          console.log('GET_DATABASE', message)
          await this.getDatabase()
        } else if (message.type === MessageType.REQUEST_DELETE_DATABASE) {
          const { notionDatabaseId, notionDatabaseName } = message.payload

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
              (db) => db.notionDatabaseUid !== notionDatabaseId,
            )

            await this.context.globalState.update('notionDatabases', updated)
            const success = await removeNotionDatabase(notionDatabaseId)
            if (success) {
              const result = await retrieveNotionDatabases()
              if (result.success) {
                const notionDatabases = result.data
                await this.context.globalState.update(
                  'notionDatabases',
                  notionDatabases,
                )
                this.panel.webview.postMessage({
                  type: MessageType.DATABASE_DELETED,
                  payload: { notionDatabaseId },
                })
              }
            }
            vscode.window.showInformationMessage('삭제가 완료되었습니다.')
          }
        }
      },
      null,
      this.disposables,
    )

    // 패널 dispose 리스너
    this.panel.onDidDispose(() => this.dispose(), null, this.disposables)
  }

  private renderPage(page: string) {
    const html = this.render()
    this.panel.webview.html = html
    // this.panel.webview.postMessage({
    //   type: MessageType.INITIAL_PAGE,
    //   payload: { page },
    // })
  }

  static async showWebview(
    context: vscode.ExtensionContext,
    page: PageType,
    payload?: any, // postId 또는 template
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

      setDraftData(DraftDataType.selectedPostId, payload)
      if (page == PageType.POST) {
        cls.currentPanel.webview.postMessage({
          type: MessageType.GET_CURRENT_POST,
          payload: { payload },
        })
      }

      if (page === PageType.POST && typeof payload === 'number') {
        const posts = context.globalState.get<PostDetail[]>('posts') || []
        const target = posts.find((p) => p.postId === payload)

        if (target) {
          cls.currentPanel.webview.postMessage({
            type: MessageType.SHOW_POST_VIEWER,
            payload: target,
          })
        }
      }

      if (page === PageType.TEMPLATE && payload?.templateId) {
        setDraftData(DraftDataType.selectedTemplateId, payload.templateId)
        vscode.commands.executeCommand(
          'vibeEditor.refreshSnapshot',
          payload.templateId,
        )
        cls.currentPanel.webview.postMessage({
          type: MessageType.TEMPLATE_SELECTED,
          payload: { template: payload },
        })
      }
    } else {
      const loader = new cls(context, page)
      cls.currentPanel = loader.panel
      if (page == PageType.POST) {
        setDraftData(DraftDataType.selectedPostId, payload)
      }

      if (page === PageType.TEMPLATE && payload?.templateId) {
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
    }
  }

  static postMessageToWebview = (message: Message) => {
    if (window.vscode) {
      window.vscode.postMessage(message)
    }
  }

  public dispose() {
    ViewLoader.currentPanel = undefined

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

  public static async deleteTemplateIfActive(templateId: number) {
    if (this.currentPanel && this.currentPanel.visible) {
      this.currentPanel.webview.postMessage({
        type: MessageType.DELETE_TEMPLATE,
        payload: { templateId },
      })
    }
  }
}
