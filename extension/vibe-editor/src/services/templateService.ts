import * as vscode from 'vscode'

import {
  addTemplate,
  getTemplateDetail,
  getTemplateList,
  removeTemplate,
} from '../apis/template'
import { getDraftData, setDraftData } from '../configuration/draftData'
import { DraftDataType } from '../types/configuration'
import { PostDetail } from '../types/post'
import { CreatePrompt, Prompt, SubmitPrompt, Template } from '../types/template'
import { PageType } from '../types/webview'
import { SnapshotItem } from '../views/codeSnapshotView'
import { ViewLoader } from '../views/webview/ViewLoader'
import { refreshPostProvider } from './postService'

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

  async refreshTemplate(): Promise<void> {
    templateProviderInstance?.refresh()
  }

  async resetTemplate(): Promise<void> {
    await this.context.globalState.update('templates', [])
    this.refreshTemplate()
  }
  async deleteTemplate(templateId: number): Promise<void> {
    const prev = this.context.globalState.get<Template[]>('templates', [])
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
          const success = await removeTemplate(templateId)
          if (success) {
            await this.getTemplates()
            templateProviderInstance?.refresh()
            vscode.window.showInformationMessage('템플릿이 삭제되었습니다.')
          }
        }
      })
  }

  async renameTemplate(templateId: number): Promise<void> {
    const prev = this.context.globalState.get<Template[]>('templates', [])
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
    const prev = this.context.globalState.get<Template[]>('templates', [])

    const templateIndex = prev.findIndex(
      (template) => template.templateId === selectedTemplateId,
    )
    console.log('templateIndex', templateIndex)
    if (templateIndex === -1) {
      vscode.window.showInformationMessage('템플릿을 찾을 수 없습니다.')
      return
    }
    const promptList: Prompt[] = prev[templateIndex].promptList || []
    if (!promptList) {
      vscode.window.showInformationMessage('프롬프트를 찾을 수 없습니다.')
      return
    }
    const promptIndex = promptList.findIndex(
      (prompt) => prompt.promptId === selectedPromptId,
    )
    if (promptIndex === -1) {
      vscode.window.showInformationMessage('프롬프트를 찾을 수 없습니다.')
      return
    }
    const prompt = promptList[promptIndex]
    if (!prompt) {
      vscode.window.showInformationMessage('프롬프트를 찾을 수 없습니다.')
      return
    }

    const promptAttachList = prompt.promptAttachList
    if (!promptAttachList) {
      vscode.window.showInformationMessage('스냅샷을 찾을 수 없습니다.')
      return
    }
    promptAttachList.push({
      attachId: new Date().getTime(),
      snapshotId: snapshotItem.snapshot.snapshotId,
      description: '설명',
    })
    prompt.promptAttachList = promptAttachList
    prev[templateIndex].promptList = promptList
    await this.context.globalState.update('templates', prev)
    vscode.window.showInformationMessage(`프롬프트에 추가되었습니다`)
  }

  async createTemplate(): Promise<void> {
    let templateName = new Date().toISOString()
    const value = await vscode.window.showInputBox({
      value: templateName,
      prompt: '템플릿 이름을 입력하세요',
      placeHolder: templateName,
    })

    if (value) {
      templateName = value
      const success = await addTemplate(templateName)
      if (success) {
        const result = await getTemplateList()
        console.log('getTemplateList', result)
        if (result.success) {
          const templateList = result.data
          await this.context.globalState.update('templates', templateList)
          templateProviderInstance?.refresh()
        }
      }
    }

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
          const uniqueSuffix = Math.floor(Math.random() * 10000)
          const newPost: PostDetail = {
            postId: new Date().getTime(),
            postTitle: `포스트 제목 ${uniqueSuffix}`,
            postContent: `포스트 내용 ${uniqueSuffix}`,
            templateId: data.selectedTemplateId,
            promptId: data.prompt.promptId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            parentPostIdList: [],
          }
          const prev = this.context.globalState.get<PostDetail[]>('posts', [])
          prev.push(newPost)
          await this.context.globalState.update('posts', prev)
          refreshPostProvider()
          vscode.window.showInformationMessage(
            `포스트 수정페이지에서 확인해주세요: ${data.prompt.promptName}`,
          )

          if (data.navigate) {
            setDraftData(DraftDataType.selectedPostId, newPost.postId)
            await data.navigate(PageType.POST)
          }
        } else {
        }
      })
  }
  async updatePrompt(data: SubmitPrompt): Promise<void> {
    console.log('updatePrompt', data)
    const updatedPrompt: Prompt = data.prompt

    const prev = this.context.globalState.get<Template[]>('templates', [])
    const templateIndex = prev.findIndex(
      (template) => template.templateId === data.selectedTemplateId,
    )
    const promptIndex = prev[templateIndex].promptList?.findIndex(
      (prompt) => prompt.promptId === data.selectedPromptId,
    )
    if (templateIndex !== -1 && promptIndex !== -1) {
      prev[templateIndex].promptList = [
        updatedPrompt,
        ...(prev[templateIndex].promptList || []).filter(
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
    console.log('createPrompt', data)
    const promptId = new Date().getTime()
    const newPrompt: Prompt = {
      parentPrompt: null,
      templateId: data.selectedTemplateId,
      promptId: promptId,
      promptName: data.prompt.promptName,
      postType: data.prompt.postType,
      comment: data.prompt.comment,
      promptAttachList: data.prompt.promptAttachList,
      promptOptionList: data.prompt.promptOptionList,
      notionDatabaseId: data.prompt.notionDatabaseId,
    }

    const prev = this.context.globalState.get<Template[]>('templates', [])
    const templateIndex = prev.findIndex(
      (template) => template.templateId === data.selectedTemplateId,
    )

    if (templateIndex !== -1) {
      prev[templateIndex].promptList = [
        newPrompt,
        ...(prev[templateIndex].promptList || []),
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
    const prev = this.context.globalState.get<Template[]>('templates', [])
    const templateIndex = prev.findIndex(
      (template) => template.templateId === data.selectedTemplateId,
    )
    const promptIndex = prev[templateIndex].promptList?.findIndex(
      (prompt) => prompt.promptId === data.selectedPromptId,
    )

    if (templateIndex !== -1 && promptIndex !== -1) {
      prev[templateIndex].promptList = [
        ...(prev[templateIndex].promptList || []).filter(
          (_, index) => index !== promptIndex,
        ),
      ]
      prev[templateIndex].updatedAt = new Date().toISOString()
      await this.context.globalState.update('templates', prev)
      templateProviderInstance?.refresh()
    }
    vscode.window.showInformationMessage(`프롬프트가 삭제되었습니다:`)
  }

  async getLocalTemplates(): Promise<Template[]> {
    return this.context.globalState.get<Template[]>('templates', [])
  }

  async updateTemplateDetail(templateId: number): Promise<Template | null> {
    const result = await getTemplateDetail(templateId)
    console.log('updateTemplateDetail', result)
    if (result.success) {
      const prev = this.context.globalState.get<Template[]>('templates', [])
      const templateIndex = prev.findIndex(
        (template) => template.templateId === templateId,
      )
      const newTemplate = result.data
      newTemplate.templateId = templateId
      if (templateIndex !== -1) {
        prev[templateIndex] = newTemplate
        await this.context.globalState.update('templates', prev)
      }
      return result.data
    }
    return null
  }

  async getTemplates(): Promise<Template[]> {
    const result = await getTemplateList()
    if (result.success) {
      const templates = result.data
      const prev = this.context.globalState.get<Template[]>('templates', [])

      const newTemplate = templates.map((template) => {
        const prevTemplate = prev.find(
          (t) => t.templateId === template.templateId,
        )
        if (prevTemplate) {
          return {
            ...prevTemplate,
            templateName: template.templateName,
            updatedAt: template.updatedAt,
          }
        } else {
          return template
        }
      })

      this.context.globalState.update('templates', [...newTemplate])
    }
    const localTemplates: Template[] = await this.getLocalTemplates()
    return localTemplates
  }

  public async deletePromptSnapshot(
    attachId: number,
    selectedPromptId: number,
    selectedTemplateId: number,
  ): Promise<void> {
    const prev = this.context.globalState.get<Template[]>('templates', [])
    const templateIndex = prev.findIndex(
      (template) => template.templateId === selectedTemplateId,
    )
    const template = prev[templateIndex]
    const promptIndex = template.promptList?.findIndex(
      (prompt) => prompt.promptId === selectedPromptId,
    )
    if (promptIndex) {
      const prompt = template.promptList?.[promptIndex]
      if (prompt) {
        const snapshotIndex = prompt.promptAttachList?.findIndex(
          (snapshot) => snapshot.attachId === attachId,
        )
        if (snapshotIndex) {
          prompt.promptAttachList = [
            ...(prompt.promptAttachList || []).filter(
              (snapshot) => snapshot.attachId !== attachId,
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

  private templateService: TemplateService

  refresh(): void {
    this._onDidChangeTreeData.fire()
  }

  constructor(private context: vscode.ExtensionContext) {
    this.templateService = new TemplateService(context, PageType.TEMPLATE)
  }

  getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
    element.contextValue = 'vibeEditorTemplatePage'
    return element
  }

  async getChildren(): Promise<vscode.TreeItem[]> {
    const templates: Template[] = await this.templateService.getTemplates()
    return templates?.map((template) => new TemplateItem(template))
  }
}
