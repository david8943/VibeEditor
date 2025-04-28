import * as vscode from 'vscode'

import { Post } from '../types/post'
import { CreatePrompt, Prompt, SubmitPrompt, Template } from '../types/template'
import { SnapshotItem } from '../views/codeSnapshotView'
import { ViewLoader } from '../views/webview/ViewLoader'

class TemplateItem extends vscode.TreeItem {
  constructor(public readonly template: Template) {
    super(template.templateName, vscode.TreeItemCollapsibleState.None)
    this.tooltip = `${template.templateName}`
    this.command = {
      command: 'vibeEditor.showTemplatePage',
      title: 'View Template',
      arguments: [template],
    }
    this.iconPath = new vscode.ThemeIcon('symbol-snippet')
  }
}

export class TemplateService {
  private context: vscode.ExtensionContext
  private page: string
  constructor(context: vscode.ExtensionContext, page: string) {
    this.context = context
    this.page = page
  }

  async resetTemplate(): Promise<void> {
    await this.context.globalState.update('templates', [])
  }

  async addToPrompt(snapshotItem: SnapshotItem): Promise<void> {
    console.log('addToPrompt', snapshotItem)
    //getContext

    // const selectedTemplateId = await vscode.commands.executeCommand(
    //   'getContext',
    //   'vibeEditor.selectedTemplateId',
    // )
    // console.log('addToPrompt', selectedTemplateId),
    console.log('addToPrompt', snapshotItem)
    vscode.window.showInformationMessage(`프롬프트에 추가되었습니다`)
  }

  async createTemplate(): Promise<void> {
    const today = new Date().toISOString()
    const newPrompt: Prompt = {
      promptId: new Date().getTime(),
      promptName: today,
      postType: 'cs',
      comment: 'cs 개념 설명',
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      snapshots: [],
      options: [],
    }

    const newTemplate: Template = {
      templateId: new Date().getTime(),
      templateName: today,
      prompts: [newPrompt],
      snapshots: [],
      updatedAt: today,
      createdAt: today,
    }
    const prev = this.context.globalState.get<Template[]>('templates') || []
    await this.context.globalState.update('templates', [newTemplate, ...prev])
    templateProviderInstance?.refresh()
    ViewLoader.showWebview(this.context, this.page)
  }

  async submitPrompt(data: SubmitPrompt): Promise<void> {
    const ok = 'Ok'
    vscode.window
      .showInformationMessage(
        '프롬프트 기반으로 포스트를 생성하시겠습니까?',
        {
          detail: '생성 시 포스트 페이지로 이동합니다.',
          modal: true,
        },
        ok,
      )
      .then(async (selection) => {
        if (selection === ok) {
          vscode.window.showInformationMessage(
            `프롬프트로 포스트를 생성하고 있습니다: ${data.prompt.promptName}`,
          )
          const newPost: Post = {
            postId: new Date().getTime(),
            postName: '생성 중',
            postContent: '생성 중',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            promptId: data.prompt.promptId,
          }
          const prev = this.context.globalState.get<Post[]>('posts') || []
          prev.push(newPost)
          await this.context.globalState.update('posts', prev)
          templateProviderInstance?.refresh()

          vscode.window.showInformationMessage(
            `포스트 수정페이지에서 확인해주세요: ${data.prompt.promptName}`,
          )

          if (data.navigate) {
            await data.navigate('post')
          }
        } else {
        }
      })
  }
  async updatePrompt(data: SubmitPrompt): Promise<void> {
    const updatedPrompt: Prompt = {
      promptId: data.prompt.promptId,
      promptName: data.prompt.promptName,
      postType: data.prompt.postType,
      comment: data.prompt.comment,
      updatedAt: new Date().toISOString(),
      createdAt: data.prompt.createdAt,
      snapshots: data.prompt.snapshots,
      options: data.prompt.options,
    }

    const prev = this.context.globalState.get<Template[]>('templates') || []
    const templateIndex = prev.findIndex(
      (template) => template.templateId === data.selectedTemplateId,
    )
    const promptIndex = prev[templateIndex].prompts?.findIndex(
      (prompt) => prompt.promptId === data.selectedPromptId,
    )
    if (templateIndex !== -1 && promptIndex !== -1) {
      prev[templateIndex].prompts = [
        updatedPrompt,
        ...(prev[templateIndex].prompts || []).filter(
          (_, index) => index !== promptIndex,
        ),
      ]
      prev[templateIndex].updatedAt = new Date().toISOString()
      await this.context.globalState.update('templates', prev)
      templateProviderInstance?.refresh()
    }

    vscode.window.showInformationMessage(
      `프롬프트가 저장되었습니다: ${updatedPrompt.promptName}`,
    )
  }
  async createPrompt(data: SubmitPrompt): Promise<void> {
    const newPrompt: Prompt = {
      promptId: new Date().getTime(),
      promptName: data.prompt.promptName,
      postType: data.prompt.postType,
      comment: data.prompt.comment,
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      snapshots: data.prompt.snapshots,
      options: data.prompt.options,
    }

    const prev = this.context.globalState.get<Template[]>('templates') || []
    const templateIndex = prev.findIndex(
      (template) => template.templateId === data.selectedTemplateId,
    )

    if (templateIndex !== -1) {
      prev[templateIndex].prompts = [
        newPrompt,
        ...(prev[templateIndex].prompts || []),
      ]
      prev[templateIndex].updatedAt = new Date().toISOString()
      await this.context.globalState.update('templates', prev)
      templateProviderInstance?.refresh()
    }

    vscode.window.showInformationMessage(
      `프롬프트가 생성되었습니다: ${newPrompt.promptName}`,
    )
  }
  async deletePrompt(data: SubmitPrompt): Promise<void> {
    const prev = this.context.globalState.get<Template[]>('templates') || []
    const templateIndex = prev.findIndex(
      (template) => template.templateId === data.selectedTemplateId,
    )
    const promptIndex = prev[templateIndex].prompts?.findIndex(
      (prompt) => prompt.promptId === data.selectedPromptId,
    )

    if (templateIndex !== -1 && promptIndex !== -1) {
      prev[templateIndex].prompts = [
        ...(prev[templateIndex].prompts || []).filter(
          (_, index) => index !== promptIndex,
        ),
      ]
      prev[templateIndex].updatedAt = new Date().toISOString()
      await this.context.globalState.update('templates', prev)
      templateProviderInstance?.refresh()
    }
    vscode.window.showInformationMessage(`프롬프트가 삭제되었습니다:`)
  }

  async getTemplates(): Promise<Template[]> {
    const templates =
      this.context.globalState.get<Template[]>('templates') || []
    return templates
  }
}

let templateProviderInstance: TemplateProvider | undefined

export function setTemplateProvider(provider: TemplateProvider) {
  templateProviderInstance = provider
}
export class TemplateProvider
  implements vscode.TreeDataProvider<vscode.TreeItem>
{
  private _onDidChangeTreeData: vscode.EventEmitter<
    vscode.TreeItem | undefined | void
  > = new vscode.EventEmitter<vscode.TreeItem | undefined | void>()
  readonly onDidChangeTreeData: vscode.Event<
    vscode.TreeItem | undefined | void
  > = this._onDidChangeTreeData.event

  refresh(): void {
    this._onDidChangeTreeData.fire()
  }

  constructor(private context: vscode.ExtensionContext) {}

  getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
    return element
  }

  getChildren(): vscode.ProviderResult<vscode.TreeItem[]> {
    const templates =
      this.context.globalState.get<Template[]>('templates') || []

    return templates
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .map((template) => new TemplateItem(template))
  }
}
