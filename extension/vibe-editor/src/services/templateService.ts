import * as vscode from 'vscode'

import {
  generateClaude,
  getOptionList,
  getPrompt,
  savePrompt,
  updatePrompt,
} from '../apis/prompt'
import { addSnapshot, getSnapshotDetail } from '../apis/snapshot'
import {
  addTemplate,
  getTemplateDetail,
  getTemplateList,
  removeTemplate,
  updateTemplate,
} from '../apis/template'
import { getDraftData, setDraftData } from '../configuration/draftData'
import { DraftDataType } from '../types/configuration'
import { Post, PostDetail } from '../types/post'
import { Snapshot } from '../types/snapshot'
import {
  CreatePrompt,
  Option,
  Prompt,
  SelectPrompt,
  SubmitCreatePrompt,
  SubmitPrompt,
  SubmitUpdatePrompt,
  Template,
  UpdatePrompt,
} from '../types/template'
import { MessageType, PageType } from '../types/webview'
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

  async getLocalPrompt(data: SelectPrompt): Promise<Prompt | null> {
    const prev = this.context.globalState.get<Template[]>('templates', [])
    const template = prev.find(
      (template) => template.templateId === data.templateId,
    )
    if (template) {
      return (
        template.promptList?.find(
          (prompt) => prompt.promptId === data.promptId,
        ) || null
      )
    }
    return null
  }

  async selectPrompt(data: SelectPrompt): Promise<Prompt | null> {
    const result = await getPrompt(data.promptId)
    if (result.success) {
      const prev = this.context.globalState.get<Template[]>('templates', [])
      const template = prev.find(
        (template) => template.templateId === data.templateId,
      )
      if (template?.promptList) {
        const prompt = template.promptList?.find(
          (prompt) => prompt.promptId === data.promptId,
        )
        if (prompt) {
          prompt.promptName = result.data.promptName
          prompt.postType = result.data.postType
          prompt.comment = result.data.comment
          prompt.promptAttachList = result.data.promptAttachList
          prompt.promptOptionList = result.data.promptOptionList
          prompt.notionDatabaseId = result.data.notionDatabaseId
        } else {
          return null
        }
        await this.context.globalState.update('templates', prev)
        return prompt
      }
    }
    return null
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

    const templateName = await vscode.window.showInputBox({
      value: prev[templateIndex].templateName,
      prompt: '템플릿 이름을 입력하세요',
      placeHolder: prev[templateIndex].templateName,
    })

    if (templateName) {
      prev[templateIndex].templateName = templateName
      await this.context.globalState.update('templates', prev)
      const success = await updateTemplate({ templateId, templateName })
      if (success) {
        templateProviderInstance?.refresh()
      }
    }
  }

  async getLocalPromppt(data: SelectPrompt): Promise<Prompt | null> {
    const prev = await this.getLocalTemplates()
    const template = prev.find(
      (template) => template.templateId === data.templateId,
    )
    return (
      template?.promptList?.find(
        (prompt) => prompt.promptId === data.promptId,
      ) || null
    )
  }

  async addAndSaveToPrompt(snapshot: Snapshot): Promise<void> {
    const selectedTemplateId = Number(
      getDraftData(DraftDataType.selectedTemplateId),
    )

    const selectedPromptId = Number(
      getDraftData(DraftDataType.selectedPromptId),
    )

    const prev = this.context.globalState.get<Template[]>('templates', [])
    const template = prev.find(
      (template) => template.templateId === selectedTemplateId,
    )
    if (!template) {
      vscode.window.showInformationMessage('템플릿을 찾을 수 없습니다.')
      return
    }
    const prompt =
      template.promptList?.find(
        (prompt) => prompt.promptId === selectedPromptId,
      ) || null

    if (!prompt) {
      vscode.window.showInformationMessage('프롬프트를 찾을 수 없습니다.')
      return
    }
    const promptAttachList = prompt.promptAttachList
    if (!promptAttachList) {
      const result = await getPrompt(prompt.promptId)
      if (result.success) {
        prompt.promptAttachList = result.data.promptAttachList
      }
    }
    promptAttachList.push({
      attachId: new Date().getTime(),
      snapshotId: snapshot.snapshotId,
      description: '설명',
    })
    await this.context.globalState.update('templates', prev)
    await updatePrompt({
      updatePrompt: prompt,
      promptId: selectedPromptId,
    })
  }
  async addToPrompt(snapshot: Snapshot): Promise<void> {
    if (ViewLoader.currentPanel) {
      const selectedPromptId = Number(
        getDraftData(DraftDataType.selectedPromptId),
      )
      const promptAttach = {
        attachId: new Date().getTime(),
        snapshotId: snapshot.snapshotId,
        description: '설명',
      }

      if (selectedPromptId !== 0) {
        const selectedTemplateId = Number(
          getDraftData(DraftDataType.selectedTemplateId),
        )
        const template = await this.getLocalTemplate(selectedTemplateId)

        ViewLoader.currentPanel?.webview.postMessage({
          type: MessageType.TEMPLATE_SELECTED,
          payload: {
            template: template,
          },
        })
      }
      ViewLoader.currentPanel?.webview.postMessage({
        type: MessageType.SNAPSHOT_SELECTED,
        payload: {
          snapshot: promptAttach,
        },
      })
    } else {
      this.addAndSaveToPrompt(snapshot)
    }

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

  async submitPrompt(prompt: Prompt): Promise<Post | null> {
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
            `프롬프트로 포스트를 생성하고 있습니다: ${prompt.promptName}`,
          )
          const loadingPost: PostDetail = {
            postId: new Date().getTime(),
            postTitle: `포스트 생성 중 : ${prompt.promptName}`,
            postContent: `포스트 생성 중입니다...`,
            templateId: prompt.templateId,
            promptId: prompt.promptId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            parentPostIdList: [],
          }
          const prev = this.context.globalState.get<PostDetail[]>('posts', [])
          prev.push(loadingPost)
          await this.context.globalState.update('posts', prev)
          refreshPostProvider()
          const result = await generateClaude({ promptId: prompt.promptId })
          console.log('result', result)
          if (result.success) {
            const createdPost: Post = result.data
            const newPost: PostDetail = {
              postId: createdPost.postId,
              postTitle: createdPost.postTitle,
              postContent: createdPost.postContent,
              templateId: prompt.templateId,
              promptId: prompt.promptId,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              parentPostIdList: [],
            }
            prev.push(newPost)
            setDraftData(DraftDataType.selectedPostId, createdPost.postId)
            ViewLoader.currentPanel?.webview.postMessage({
              type: MessageType.NAVIGATE,
              payload: {
                page: PageType.POST,
              },
            })
            refreshPostProvider()
            await this.context.globalState.update(
              'posts',
              prev.filter((post) => post.postId !== loadingPost.postId),
            )
            return createdPost
          } else {
            await this.context.globalState.update(
              'posts',
              prev.filter((post) => post.postId !== loadingPost.postId),
            )
            refreshPostProvider()
          }
        }
      })
    return null
  }
  async navigate(data: SubmitPrompt): Promise<void> {
    vscode.window.showInformationMessage(
      `포스트 수정페이지에서 확인해주세요: ${data.post.postTitle}`,
    )
    if (data.navigate) {
      setDraftData(DraftDataType.selectedPostId, data.post.postId)
      await data.navigate(PageType.POST)
    }
  }
  async upgradePrompt(data: SubmitUpdatePrompt): Promise<boolean> {
    console.log('updatePrompt', data)
    const updatedPrompt: UpdatePrompt = data.prompt
    const prev = await this.getLocalTemplates()
    const template = prev.find(
      (template) => template.templateId === data.selectedTemplateId,
    )
    if (!template?.promptList) {
      return false
    }
    const prompt = template.promptList?.find(
      (prompt) => prompt.promptId === data.selectedPromptId,
    )
    console.log('prompt', prompt)
    if (prompt) {
      const success = await updatePrompt({
        updatePrompt: updatedPrompt,
        promptId: data.selectedPromptId,
      })
      if (success) {
        const result = await getPrompt(data.selectedPromptId)
        if (result.success) {
          prompt.promptName = result.data.promptName
          prompt.postType = result.data.postType
          prompt.comment = result.data.comment
          prompt.promptAttachList = result.data.promptAttachList
          prompt.promptOptionList = result.data.promptOptionList
          prompt.notionDatabaseId = result.data.notionDatabaseId
        }
        await this.context.globalState.update('templates', prev)
        templateProviderInstance?.refresh()
        vscode.window.showInformationMessage(
          `프롬프트가 저장되었습니다: ${updatedPrompt.promptName}`,
        )
        return true
      }
    }
    return false
  }
  async createPrompt(data: SubmitCreatePrompt): Promise<SelectPrompt | null> {
    console.log('createPrompt', data)
    const newPrompt: CreatePrompt = {
      parentPromptId: null,
      templateId: data.selectedTemplateId,
      promptName: data.prompt.promptName,
      postType: data.prompt.postType,
      comment: data.prompt.comment,
      promptAttachList: data.prompt.promptAttachList,
      promptOptionList: data.prompt.promptOptionList,
      notionDatabaseId: data.prompt.notionDatabaseId,
    }

    const prev = await this.getLocalTemplates()
    console.log('prev', prev)
    console.log('data.selectedTemplateId', data.selectedTemplateId)
    const templateIndex = prev.findIndex(
      (template) => template.templateId === data.selectedTemplateId,
    )
    console.log('templateIndex', templateIndex)

    if (templateIndex !== -1) {
      const success = await savePrompt(newPrompt)
      console.log('savePrompt', success)
      if (success) {
        const template = await this.getTemplate(data.selectedTemplateId)
        if (template?.promptList) {
          const newPrompt = template.promptList[0]
          vscode.window.showInformationMessage(
            `프롬프트가 생성되었습니다: ${newPrompt.promptName}`,
          )
          return {
            promptId: newPrompt.promptId,
            templateId: data.selectedTemplateId,
          }
        }
      }
    }
    return null
  }
  async deletePrompt(data: SelectPrompt): Promise<void> {
    const prev = this.context.globalState.get<Template[]>('templates', [])
    const templateIndex = prev.findIndex(
      (template) => template.templateId === data.templateId,
    )
    const promptIndex = prev[templateIndex].promptList?.findIndex(
      (prompt) => prompt.promptId === data.promptId,
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
  async getLocalTemplate(templateId: number): Promise<Template | null> {
    const prev = this.context.globalState.get<Template[]>('templates', [])
    return prev.find((template) => template.templateId === templateId) || null
  }

  async getOptions(): Promise<Option[]> {
    const optionList: Option[] | undefined = await getDraftData(
      DraftDataType.optionList,
    )
    if (optionList && optionList.length > 0) {
      return optionList
    }
    const options = await getOptionList()
    if (options.success) {
      setDraftData(DraftDataType.optionList, options.data)
      return options.data
    }
    return []
  }

  async updateTemplateDetail(templateId: number): Promise<Template | null> {
    console.log('updateTemplateDetail', templateId)
    const result = await getTemplateDetail(templateId)
    if (result.success) {
      const prev = this.context.globalState.get<Template[]>('templates', [])
      const templateIndex = prev.findIndex(
        (template) => template.templateId === templateId,
      )
      const newTemplate: Template = result.data
      const { snapshotList, ...rest } = newTemplate
      newTemplate.templateId = templateId
      snapshotList?.map((snapshot) => {
        const oldSnapshot: Snapshot | undefined = prev[
          templateIndex
        ].snapshotList?.find((s) => s.snapshotId === snapshot.snapshotId)
        if (oldSnapshot?.snapshotContent) {
          snapshot.snapshotContent = oldSnapshot.snapshotContent
        }
      })
      if (templateIndex !== -1) {
        prev[templateIndex] = newTemplate
        await this.context.globalState.update('templates', prev)
      }
      return result.data
    }
    return null
  }

  async getTemplates(): Promise<Template[]> {
    console.log('getTemplates 호출')
    const result = await getTemplateList()
    if (result.success) {
      const templates = result.data
      const prev: Template[] = await this.getLocalTemplates()

      const newTemplate = templates.map((template) => {
        const prevTemplate = prev.find(
          (t) => t.templateId === template.templateId,
        )
        if (prevTemplate) {
          prevTemplate.templateName = template.templateName
          prevTemplate.updatedAt = template.updatedAt
          return prevTemplate
        } else {
          return template
        }
      })

      this.context.globalState.update('templates', [...newTemplate])
    }
    const localTemplates: Template[] = await this.getLocalTemplates()
    console.log('localTemplates', localTemplates)
    return localTemplates
  }

  async getTemplate(templateId: number): Promise<Template | null> {
    let prev: Template[] = await this.getLocalTemplates()
    let oldTemplate = prev.find((t) => t.templateId == templateId)
    if (!oldTemplate) {
      prev = await this.getTemplates()
      oldTemplate = prev.find((t) => t.templateId == templateId)
      if (!oldTemplate) {
        return null
      }
    }

    const result = await getTemplateDetail(templateId)
    if (result.success) {
      const { templateName, promptList, snapshotList, updatedAt, ...rest } =
        result.data
      if (oldTemplate) {
        oldTemplate.templateName = templateName
        oldTemplate.updatedAt = updatedAt

        oldTemplate.promptList = promptList?.map((prompt) => {
          const oldPrompt: Prompt | undefined = oldTemplate.promptList?.find(
            (p) => prompt.promptId == p.promptId,
          )
          if (oldPrompt) {
            oldPrompt.promptName = prompt.promptName
            return oldPrompt
          } else {
            return prompt
          }
        })
        oldTemplate.snapshotList = snapshotList?.map((snapshot) => {
          const oldSnapshot = oldTemplate.snapshotList?.find(
            (s) => snapshot.snapshotId == s.snapshotId,
          )
          if (oldSnapshot) {
            oldSnapshot.snapshotName = snapshot.snapshotName
            oldSnapshot.updatedAt = snapshot.snapshotName
            return oldSnapshot
          } else {
            return snapshot
          }
        })
        this.context.globalState.update('templates', prev)
      }
    }
    const localTemplate = await this.getLocalTemplate(templateId)
    return localTemplate
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
