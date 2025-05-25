import * as vscode from 'vscode'

import { getSnapshotList } from '@/apis/snapshot'

import { retrieveNotionDatabases } from '../../apis/notion'
import { getCurrentUser } from '../../apis/user'
import { Configuration } from '../../configuration'
import { getDraftData, setDraftData } from '../../configuration/draftData'
import { PostService } from '../../services/postService'
import { SettingService } from '../../services/settingService'
import { SnapshotService } from '../../services/snapshotService'
import { TemplateService } from '../../services/templateService'
import { ViewService } from '../../services/viewService'
import { AIAPIKey } from '../../types/ai'
import { DraftDataType } from '../../types/configuration'
import { CreateDatabase, Database, UpdateDatabase } from '../../types/database'
import { Post } from '../../types/post'
import {
  Prompt,
  SelectPrompt,
  SubmitCreatePrompt,
  SubmitUpdatePrompt,
  Template,
} from '../../types/template'
import { Message, MessageType, PageType } from '../../types/webview'

export class SideViewProvider implements vscode.WebviewViewProvider {
  private templateService: TemplateService
  private snapshotService: SnapshotService
  private postService: PostService
  private disposables: vscode.Disposable[] = []
  private currentTemplateId?: number
  private _view?: vscode.WebviewView
  private currentPage: PageType = PageType.TEMPLATE
  private settingService: SettingService

  constructor(private readonly context: vscode.ExtensionContext) {
    this.templateService = new TemplateService(context)
    this.snapshotService = new SnapshotService(context)
    this.postService = new PostService(context)
    this.settingService = new SettingService(context)
  }

  public navigateToPageIfExists(page: PageType): boolean {
    console.log('navigateToPageIfExists', page)
    if (this._view) {
      this.navigate(page)
      return true
    }
    return false
  }
  public async resolveWebviewView(webviewView?: vscode.WebviewView) {
    if (!webviewView) return
    this._view = webviewView
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [
        vscode.Uri.joinPath(this.context.extensionUri, 'dist', 'app'),
        vscode.Uri.joinPath(this.context.extensionUri, 'media'),
      ],
    }

    webviewView.webview.html = this.getWebviewContent(webviewView.webview)
    this.setupMessageListeners(webviewView.webview)
    webviewView.webview.postMessage({
      type: MessageType.INITIAL_PAGE,
      payload: { page: this.currentPage },
    })
    // this.getTemplates(webviewView.webview)
  }

  private async navigate(page: PageType) {
    setDraftData(DraftDataType.selectedPage, page)
    this.currentPage = page
    this.postMessageToWebview({
      type: MessageType.NAVIGATE,
      payload: { page },
    })
  }
  private async navigateToSelectedPage() {
    const page = getDraftData<PageType>(DraftDataType.selectedPage)
    if (!page) return
    this.currentPage = page
    this.postMessageToWebview({
      type: MessageType.NAVIGATE,
      payload: { page },
    })
  }

  private startLoading() {
    this.postMessageToWebview({ type: MessageType.START_LOADING })
  }

  private stopLoading() {
    this.postMessageToWebview({ type: MessageType.STOP_LOADING })
  }

  private async generatePost(prompt: Prompt) {
    this.startLoading()
    if (prompt) {
      const newPost = await this.templateService.generatePost(prompt)
      if (newPost) {
        vscode.window.withProgress(
          {
            location: vscode.ProgressLocation.Notification,
            title: `포스트 미리보기에서 확인해주세요: ${newPost.postTitle}`,
            cancellable: false,
          },
          async () => {
            await new Promise((resolve) => setTimeout(resolve, 2000))
          },
        )

        setDraftData(DraftDataType.selectedPostId, newPost.postId)
        const post = await this.postService.getPost(newPost.postId)
        this.postMessageToWebview({
          type: MessageType.CURRENT_POST_LOADED,
          payload: { post },
        })
      }
    }
    this.stopLoading()
  }

  private async uploadPost(data: { post: Post; shouldSave: boolean }) {
    this.startLoading()
    const result = data.shouldSave
      ? await this.postService.updatePost(data.post)
      : true
    if (result) {
      const postUrl = await this.postService.submitToNotion({
        postId: data.post.postId,
      })
      if (postUrl) {
        this.postService.moveToNotion(postUrl)
      }
    }

    this.stopLoading()
  }
  private async submitPost(data: Post) {
    this.startLoading()
    await this.postService.updatePost(data)
    this.stopLoading()
  }

  public async postMessageToWebview(message: Message) {
    if (!this._view) return
    this._view.webview.postMessage(message)
  }

  private async saveDatabase(data: CreateDatabase) {
    const databases = await this.settingService.saveDatabase(data)
    if (databases.length > 0) {
      this.postMessageToWebview({
        type: MessageType.GET_DATABASE,
        payload: databases,
      })
    }
  }

  private async deleteDatabase(database: UpdateDatabase) {
    const notionDatabaseId = await this.settingService.deleteDatabase(database)
    if (notionDatabaseId) {
      this.postMessageToWebview({
        type: MessageType.DATABASE_DELETED,
        payload: { notionDatabaseId },
      })
      vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: '삭제가 완료되었습니다.',
          cancellable: false,
        },
        async () => {
          await new Promise((resolve) => setTimeout(resolve, 2000))
        },
      )
    }
  }

  private async selectPrompt(data: SelectPrompt) {
    console.log('SideView select Prompt', data)
    setDraftData(DraftDataType.selectedPromptId, data.promptId)
    const prompt = await this.templateService.selectPrompt(data)
    if (!prompt) {
      return
    }
    const shouldUpdateTemplate =
      await this.templateService.updatePromptSnapshot(prompt)

    if (shouldUpdateTemplate) {
      this.postMessageToWebview({
        type: MessageType.TEMPLATE_SELECTED,
        payload: { template: shouldUpdateTemplate },
      })
    }

    this.postMessageToWebview({
      type: MessageType.PROMPT_SELECTED,
      payload: { prompt },
    })
  }

  private async submitPrompt(data: SubmitUpdatePrompt) {
    const success = await this.templateService.submitPrompt(data)

    if (success) {
      const template = await this.templateService.getLocalTemplate(
        data.selectedTemplateId,
      )
      this.postMessageToWebview({
        type: MessageType.TEMPLATE_SELECTED,
        payload: { template },
      })
    }
  }

  private async addPrompt(data: SubmitCreatePrompt) {
    const selectPrompt: SelectPrompt | null =
      await this.templateService.createPrompt(data)
    if (selectPrompt) {
      const template = await this.templateService.getLocalTemplate(
        selectPrompt.templateId,
      )
      this.postMessageToWebview({
        type: MessageType.TEMPLATE_SELECTED,
        payload: { template },
      })

      setDraftData(DraftDataType.selectedPromptId, selectPrompt.promptId)
      const prompt = await this.templateService.selectPrompt(selectPrompt)
      this.postMessageToWebview({
        type: MessageType.PROMPT_SELECTED,
        payload: { prompt },
      })
    }
  }

  private async getCurrentPost() {
    const post = await this.postService.getCurrentPost()
    if (post) {
      this.postMessageToWebview({
        type: MessageType.CURRENT_POST_LOADED,
        payload: { post },
      })
    }
  }

  private async getCurrentPrompt() {
    const templateId = await this.templateService.getSelectedTemplateId()
    const promptId = await this.templateService.getSelectedPromptId()
    if (!templateId) return
    if (promptId == 0) {
      this.postMessageToWebview({
        type: MessageType.RESET_CREATE_PROMPT,
      })
    } else {
      await this.selectPrompt({
        templateId,
        promptId,
      })
    }
  }

  private async getLoginStatus() {
    const loginStatus = getDraftData(DraftDataType.loginStatus)
    this.postMessageToWebview({
      type: MessageType.LOGIN_STATUS_LOADED,
      payload: loginStatus,
    })
  }

  private async logout() {
    await vscode.commands.executeCommand('vibeEditor.logout')
    this.postMessageToWebview({
      type: MessageType.LOGIN_STATUS_LOADED,
      payload: false,
    })
  }

  private async getUser() {
    const result = await getCurrentUser()
    if (result.success) {
      this.postMessageToWebview({
        type: MessageType.USER_LOADED,
        payload: result.data,
      })
    }
  }

  private async googleLogin() {
    vscode.commands.executeCommand('vibeEditor.googleLogin')
  }

  private async githubLogin() {
    vscode.commands.executeCommand('vibeEditor.githubLogin')
  }

  private async ssafyLogin() {
    vscode.commands.executeCommand('vibeEditor.ssafyLogin')
  }

  private async setNotionSecretKey() {
    vscode.commands.executeCommand('vibeEditor.setNotionApi')
  }

  private async getTemplate() {
    const selectedTemplateId =
      await this.templateService.getSelectedTemplateId()
    const template = await this.templateService.getTemplate(selectedTemplateId)
    if (template) {
      this.currentTemplateId = template.templateId
      this.postMessageToWebview({
        type: MessageType.TEMPLATE_SELECTED,
        payload: { template: template },
      })
    } else {
      // const templates = await this.templateService.getTemplates()
      // let selectedTemplate = templates.find(
      //   (template) => template.templateId === selectedTemplateId,
      // )
      // this.currentTemplateId = templates[0]?.templateId
      // selectedTemplate = templates[0]
    }
  }
  private setupMessageListeners(webview: vscode.Webview) {
    webview.onDidReceiveMessage(async (message: Message) => {
      console.log('Received message:', message)
      switch (message.type) {
        case MessageType.NAVIGATE:
          await this.navigate(message.payload?.page)
          break
        case MessageType.GET_TEMPLATE:
          await this.getTemplate()
          break
        case MessageType.GET_SNAPSHOTS:
          await this.getSnapshots(webview)
          break
        case MessageType.GET_DATABASE:
          await this.getDatabase(webview)
          break
        case MessageType.GET_OPTIONS:
          await this.getOptions(webview)
          break
        case MessageType.GENERATE_POST:
          await this.generatePost(message.payload)
          break
        case MessageType.CREATE_PROMPT:
          await this.addPrompt(message.payload)
          break
        case MessageType.SUBMIT_PROMPT:
          await this.submitPrompt(message.payload)
          break
        case MessageType.DELETE_PROMPT:
          await this.templateService.deletePrompt(message.payload)
          break
        case MessageType.GET_CURRENT_POST:
          await this.getCurrentPost()
          break
        case MessageType.PROMPT_SELECTED:
          await this.selectPrompt(message.payload)
          break
        case MessageType.DELETE_SNAPSHOT:
          await this.templateService.deletePromptSnapshot(
            message.payload.attachId,
            message.payload.selectedPromptId,
            message.payload.selectedTemplateId,
          )
          break
        case MessageType.SUBMIT_POST:
          await this.submitPost(message.payload)
          break
        case MessageType.SAVE_DATABASE:
          await this.saveDatabase(message.payload)
          break
        case MessageType.REQUEST_DELETE_DATABASE:
          await this.deleteDatabase(message.payload)
          break
        case MessageType.WEBVIEW_READY:
          await this.navigateToSelectedPage()
          break
        case MessageType.GET_LOGIN_STATUS:
          await this.getLoginStatus()
          break
        case MessageType.GET_USER:
          await this.getUser()
          break
        case MessageType.LOG_OUT:
          await this.logout()
          break
        case MessageType.GOOGLE_LOGIN:
          await this.googleLogin()
          break
        case MessageType.GITHUB_LOGIN:
          await this.githubLogin()
          break
        case MessageType.SSAFY_LOGIN:
          await this.ssafyLogin()
          break
        case MessageType.SET_NOTION_SECRET_KEY:
          await this.setNotionSecretKey()
          break
        case MessageType.SHOW_README:
          await vscode.commands.executeCommand('vibeEditor.showReadme')
          break
        case MessageType.SHOW_POST_VIEWER:
          this.postMessageToWebview({
            type: MessageType.SHOW_POST_VIEWER,
            payload: message.payload,
          })
          break
        case MessageType.GET_PROMPT:
          await this.getCurrentPrompt()
          break
        case MessageType.SET_CONFIG_VALUE:
          await this.setConfigValue(message)
          break
        case MessageType.GET_CONFIG:
          await this.getConfig()
          break
        case MessageType.UPLOAD_POST:
          await this.uploadPost(message.payload)
          break
        case MessageType.GET_AI_PROVIDERS:
          await this.getAIProviders()
          break
        case MessageType.SAVE_AI_PROVIDER:
          await this.saveAIProvider(message.payload)
          break
        case MessageType.CREATE_TEMPLATE:
          await this.createTemplate()
          break
        case MessageType.START_GUIDE:
          await this.toggleStartGuide(message.payload)
          break
      }
    }, this.disposables)
  }

  private async toggleStartGuide(showStartGuide: boolean) {
    if (showStartGuide) {
      vscode.commands.executeCommand('vibeEditor.closeStartGuide')
    } else {
      vscode.commands.executeCommand('vibeEditor.openStartGuide')
    }
  }

  private async createTemplate() {
    vscode.commands.executeCommand('vibeEditor.createTemplate')
  }

  private async setConfigValue(message: Message) {
    const { key, value } = message.payload
    await Configuration.set(key, value)
  }
  private async getConfig() {
    this.postMessageToWebview({
      type: MessageType.CONFIG_LOADED,
      payload: Configuration.getAll(),
    })
  }
  private async getAIProviders() {
    const aiProviderList = await this.settingService.getAIProviders()
    if (aiProviderList.length > 0) {
      await this.postMessageToWebview({
        type: MessageType.AI_PROVIDERS_LOADED,
        payload: aiProviderList,
      })
    }
  }
  private async saveAIProvider(aiProvider: AIAPIKey) {
    await this.settingService.saveAIProvider(aiProvider)
  }
  private async getTemplates(webview: vscode.Webview) {
    try {
      const templates = await this.templateService.getTemplates()
      const selectedTemplateId = Number(
        getDraftData(DraftDataType.selectedTemplateId),
      )

      let selectedTemplate = templates.find(
        (template) => template.templateId === selectedTemplateId,
      )
      if (selectedTemplate) {
        this.currentTemplateId = selectedTemplate.templateId
      } else if (templates.length > 0) {
        this.currentTemplateId = templates[0]?.templateId
        selectedTemplate = templates[0]
      }
      webview.postMessage({
        type: MessageType.TEMPLATE_SELECTED,
        payload: { template: selectedTemplate },
      })
    } catch (error) {
      console.error('Error getting templates:', error)
    }
  }

  private async getSnapshots(webview: vscode.Webview) {
    const snapshots = await this.snapshotService.getSnapshots(
      this.currentTemplateId ?? 0,
    )
    if (snapshots) {
      webview.postMessage({
        type: MessageType.SNAPSHOTS_LOADED,
        payload: { snapshots },
      })
    }
  }

  private async getDatabase(webview: vscode.Webview) {
    try {
      const result = await retrieveNotionDatabases()
      if (result.success) {
        await this.context.globalState.update('notionDatabases', result.data)
      }
      const dbs = this.context.globalState.get<Database[]>(
        'notionDatabases',
        [],
      )
      webview.postMessage({
        type: MessageType.GET_DATABASE,
        payload: dbs,
      })
    } catch (error) {
      console.error('Error getting database:', error)
    }
  }

  private async getOptions(webview: vscode.Webview) {
    try {
      const options = await this.templateService.getOptions()
      webview.postMessage({
        type: MessageType.OPTIONS_LOADED,
        payload: options,
      })
    } catch (error) {
      console.error('Error getting options:', error)
    }
  }

  private getWebviewContent(webview: vscode.Webview) {
    const bundlePath = vscode.Uri.joinPath(
      this.context.extensionUri,
      'dist',
      'app',
      'bundle.js',
    )
    const bundleUri = webview.asWebviewUri(bundlePath)

    return `
      <!DOCTYPE html>
      <html lang="ko">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta http-equiv="Content-Security-Policy" content="default-src 'self' vscode-webview: vscode-resource: https: 'unsafe-inline' 'unsafe-eval'; style-src ${webview.cspSource} 'unsafe-inline'; script-src ${webview.cspSource} https://unpkg.com 'unsafe-inline' 'unsafe-eval'; img-src ${webview.cspSource} https: data:;">
          <title>Vibe Editor</title>
          <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
          <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
        </head>
        <body>
          <div id="root"></div>
          <script>
            const vscode = acquireVsCodeApi();
            window.vscode = vscode;
          </script>
          <script src="${bundleUri}"></script>
        </body>
      </html>
    `
  }
}

let sideViewProviderInstance: SideViewProvider | null = null
export function getSideViewProvider(): SideViewProvider | null {
  return sideViewProviderInstance
}
export function setSideViewProvider(provider: SideViewProvider) {
  sideViewProviderInstance = provider
}
