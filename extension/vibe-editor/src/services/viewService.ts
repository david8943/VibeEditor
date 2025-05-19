import * as vscode from 'vscode'

import { ConfigType, Configuration } from '../configuration'
import { getDraftData, setDraftData } from '../configuration/draftData'
import { DraftDataType } from '../types/configuration'
import { PostDetail } from '../types/post'
import { Prompt, Template } from '../types/template'
import { MessageType, PageType } from '../types/webview'
import { getSideViewProvider } from '../views/webview/SideViewProvider'
import { getStartGuideViewProvider } from '../views/webview/StartGuideViewProvider'
import { PostService } from './postService'
import { SettingService } from './settingService'
import { TemplateService } from './templateService'

export class ViewService {
  private context: vscode.ExtensionContext

  constructor(context: vscode.ExtensionContext) {
    this.context = context
  }

  public async focusSideView(): Promise<void> {
    vscode.commands.executeCommand('vibeEditorSideView.focus')
  }
  public async focusStartGuide(): Promise<void> {
    vscode.commands.executeCommand('vibeEditorViewerPage.focus')
  }

  public async showSettingPage(): Promise<void> {
    setDraftData(DraftDataType.selectedPage, PageType.SETTING)
    await this.focusSideView()
    getSideViewProvider()?.navigateToPageIfExists(PageType.SETTING)
  }

  public async showTemplatePage(templateId: number): Promise<void> {
    setDraftData(DraftDataType.selectedPage, PageType.TEMPLATE)
    const oldTemplateId = getDraftData(DraftDataType.selectedTemplateId)
    if (templateId != oldTemplateId) {
      // resetPromptId
      setDraftData(DraftDataType.selectedPromptId, 0)
    }
    setDraftData(DraftDataType.selectedTemplateId, templateId)
    await this.focusSideView()
    getSideViewProvider()?.navigateToPageIfExists(PageType.TEMPLATE)
  }

  public async showDefaultTemplatePage(): Promise<void> {
    setDraftData(DraftDataType.selectedPage, PageType.TEMPLATE)
    const templateService = new TemplateService(this.context)
    const template = await templateService.getDefaultTemplate()
    if (template) {
      await templateService.updateTemplateDetail(template.templateId)
    }
    await this.focusSideView()
    getSideViewProvider()?.navigateToPageIfExists(PageType.TEMPLATE)
  }

  public async showPrompt(prompt: Prompt): Promise<void> {
    console.log('viewService showPrompt', prompt)
    setDraftData(DraftDataType.selectedPage, PageType.TEMPLATE)
    setDraftData(DraftDataType.selectedPromptId, prompt.promptId)
    await this.focusSideView()
    getSideViewProvider()?.navigateToPageIfExists(PageType.TEMPLATE)
  }

  public async showPostPage(postId: number): Promise<void> {
    setDraftData(DraftDataType.selectedPage, PageType.POST)
    if (postId) {
      setDraftData(DraftDataType.selectedPostId, postId)
    }
    await this.focusSideView()
    getSideViewProvider()?.navigateToPageIfExists(PageType.POST)
  }
  public async showDefaultPostPage(): Promise<void> {
    setDraftData(DraftDataType.selectedPage, PageType.POST)
    const postService = new PostService(this.context)
    const post = await postService.getCurrentPost()
    await this.focusSideView()
    getSideViewProvider()?.navigateToPageIfExists(PageType.POST)
  }
  public async closeStartGuide(): Promise<void> {
    Configuration.set(ConfigType.showStartGuide, false)
  }
  public async openStartGuide(): Promise<void> {
    Configuration.set(ConfigType.showStartGuide, true)
    await this.focusStartGuide()
  }
  public async resetStartGuide(): Promise<void> {
    await this.focusStartGuide()
    const isLogin = getDraftData(DraftDataType.loginStatus)
    if (!isLogin) {
      getStartGuideViewProvider()?.postMessageToWebview({
        type: MessageType.START_GUIDE_LOADED,
        payload: {
          isLogin: false,
          isNotionSecretKey: false,
          isNotionDatabase: false,
          isProject: false,
          isSnapshot: false,
          isPost: false,
          isNotionUpload: false,
        },
      })
      return
    }
    const postService = new PostService(this.context)
    const templateService = new TemplateService(this.context)
    const settingService = new SettingService(this.context)

    const templates = await templateService.getLocalTemplates()
    let isSnapshot = false
    if (templates) {
      const snapshot = templates.find((t: Template) =>
        t.snapshotList ? t.snapshotList.length > 0 : 0,
      )
      isSnapshot = !!snapshot
    }

    const posts = await postService.getLocalPosts()
    let isNotionUpload = false
    if (posts) {
      const successPost = posts.find(
        (p: PostDetail) => p.uploadStatus == 'SUCCESS',
      )
      isNotionUpload = !!successPost
    }
    const isNotionSecretKey = getDraftData(DraftDataType.notionStatus)
    const isNotionDatabase = settingService.getLocalDatabase().length > 0
    const isProject = templates.length > 0
    const isPost = posts.length > 0
    getStartGuideViewProvider()?.postMessageToWebview({
      type: MessageType.START_GUIDE_LOADED,
      payload: {
        isLogin,
        isNotionSecretKey,
        isNotionDatabase,
        isProject,
        isSnapshot,
        isPost,
        isNotionUpload,
      },
    })
  }
}
