import * as vscode from 'vscode'

import { getDraftData, setDraftData } from '../configuration/draftData'
import { DraftDataType } from '../types/configuration'
import { Prompt, Template } from '../types/template'
import { PageType } from '../types/webview'
import { getSideViewProvider } from '../views/webview/SideViewProvider'
import { PostService } from './postService'
import { TemplateService } from './templateService'

export class ViewService {
  private context: vscode.ExtensionContext

  constructor(context: vscode.ExtensionContext) {
    this.context = context
  }

  public async focusSideView(): Promise<void> {
    vscode.commands.executeCommand('vibeEditorSideView.focus')
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
}
