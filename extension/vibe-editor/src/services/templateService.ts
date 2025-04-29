import * as vscode from 'vscode'

import { getDraftData } from '../configuration/tempData'
import { DraftDataType } from '../types/configuration'
import { Post } from '../types/post'
import { CreatePrompt, Prompt, SubmitPrompt, Template } from '../types/template'
import { PageType } from '../types/webview'
import { SnapshotItem } from '../views/codeSnapshotView'
import { ViewLoader } from '../views/webview/ViewLoader'

export class TemplateItem extends vscode.TreeItem {
  constructor(public readonly template: Template) {
    super(template.templateName, vscode.TreeItemCollapsibleState.None)
    this.tooltip = `${template.templateName}`
    this.command = {
      command: 'vibeEditor.showTemplatePage',
      title: 'View Template',
      arguments: [template],
    }
    this.iconPath = new vscode.ThemeIcon('notebook')
    this.contextValue = 'vibeEditorTemplatePage'
  }
}

export class TemplateService {
  private context: vscode.ExtensionContext
  private page: PageType
  constructor(context: vscode.ExtensionContext, page: PageType) {
    this.context = context
    this.page = page
  }

  async resetTemplate(): Promise<void> {
    await this.context.globalState.update('templates', [])
  }
  async deleteTemplate(templateId: number): Promise<void> {
    const prev = this.context.globalState.get<Template[]>('templates') || []
    const templateIndex = prev.findIndex(
      (template) => template.templateId === templateId,
    )
    if (templateIndex === -1) {
      vscode.window.showInformationMessage('템플릿을 찾을 수 없습니다.')
      return
    }
    prev.splice(templateIndex, 1)
    vscode.window
      .showWarningMessage('템플릿을 삭제하시겠습니까?', { modal: true }, 'Ok')
      .then(async (selection) => {
        if (selection === 'Ok') {
          await ViewLoader.deleteTemplateIfActive(templateId)
          await this.context.globalState.update('templates', prev)
          templateProviderInstance?.refresh()
          vscode.window.showInformationMessage('템플릿이 삭제되었습니다.')
        }
      })
  }

  async renameTemplate(templateId: number): Promise<void> {
    const prev = this.context.globalState.get<Template[]>('templates') || []
    const templateIndex = prev.findIndex(
      (template) => template.templateId === templateId,
    )
    if (templateIndex === -1) {
      vscode.window.showInformationMessage('템플릿을 찾을 수 없습니다.')
      return
    }

    vscode.window
      .showInputBox({
        value: prev[templateIndex].templateName,
        prompt: '템플릿 이름을 입력하세요',
        placeHolder: prev[templateIndex].templateName,
      })
      .then(async (value) => {
        if (value) {
          prev[templateIndex].templateName = value
          await this.context.globalState.update('templates', prev)
          templateProviderInstance?.refresh()
        }
      })
  }

  async addToPrompt(snapshotItem: SnapshotItem): Promise<void> {
    console.log('addToPrompt', snapshotItem)
    const selectedTemplateId = getDraftData(DraftDataType.selectedTemplateId)
    const selectedPromptId = Number(
      getDraftData(DraftDataType.selectedPromptId),
    )
    const prev = this.context.globalState.get<Template[]>('templates') || []
    const templateIndex = prev.findIndex(
      (template) => template.templateId === selectedTemplateId,
    )
    console.log('templateIndex', templateIndex)
    if (templateIndex === -1) {
      vscode.window.showInformationMessage('템플릿을 찾을 수 없습니다.')
      return
    }
    const prompts: Prompt[] = prev[templateIndex].prompts || []
    if (!prompts) {
      vscode.window.showInformationMessage('프롬프트를 찾을 수 없습니다.')
      return
    }
    const promptIndex = prompts.findIndex(
      (prompt) => prompt.promptId === selectedPromptId,
    )
    if (promptIndex === -1) {
      vscode.window.showInformationMessage('프롬프트를 찾을 수 없습니다.')
      return
    }
    const prompt = prompts[promptIndex]
    if (!prompt) {
      vscode.window.showInformationMessage('프롬프트를 찾을 수 없습니다.')
      return
    }

    const snapshots = prompt.snapshots
    if (!snapshots) {
      vscode.window.showInformationMessage('스냅샷을 찾을 수 없습니다.')
      return
    }
    snapshots.push({
      attachId: new Date().getTime(),
      promptId: selectedPromptId,
      snapshotId: snapshotItem.snapshot.snapshotId,
      description: '설명',
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    })
    prompt.snapshots = snapshots
    prev[templateIndex].prompts = prompts
    await this.context.globalState.update('templates', prev)
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
            await data.navigate(PageType.POST)
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

  public async deletePromptSnapshot(
    snapshotId: number,
    selectedPromptId: number,
    selectedTemplateId: number,
  ): Promise<void> {
    const prev = this.context.globalState.get<Template[]>('templates') || []
    const templateIndex = prev.findIndex(
      (template) => template.templateId === selectedTemplateId,
    )
    const template = prev[templateIndex]
    const promptIndex = template.prompts?.findIndex(
      (prompt) => prompt.promptId === selectedPromptId,
    )
    if (promptIndex) {
      const prompt = template.prompts?.[promptIndex]
      if (prompt) {
        const snapshotIndex = prompt.snapshots?.findIndex(
          (snapshot) => snapshot.snapshotId === snapshotId,
        )
        if (snapshotIndex) {
          prompt.snapshots = [
            ...(prompt.snapshots || []).filter(
              (snapshot) => snapshot.snapshotId !== snapshotId,
            ),
          ]
          await this.context.globalState.update('templates', prev)
          vscode.window.showInformationMessage(
            `스냅샷이 프롬프트에서 삭제되었습니다.`,
          )
        }
      }
    }
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
