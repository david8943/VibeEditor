import * as vscode from 'vscode'

import {
  generateAIPost,
  getOptionList,
  getPrompt,
  savePrompt,
  submitPrompt,
} from '../apis/prompt'
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
} from '../types/template'
import { MessageType } from '../types/webview'
import { refreshPostProvider } from '../views/tree/postTreeView'
import { refreshTemplateProvider } from '../views/tree/templateTreeView'
import { getSideViewProvider } from '../views/webview/SideViewProvider'

export class TemplateService {
  private context: vscode.ExtensionContext
  constructor(context: vscode.ExtensionContext) {
    this.context = context
  }

  async getLocalPrompt(
    data: SelectPrompt,
    prev?: Template[],
  ): Promise<Prompt | null> {
    const template = await this.getLocalTemplate(data.templateId, prev)
    return (
      template?.promptList?.find(
        (prompt) => prompt.promptId === data.promptId,
      ) || null
    )
  }

  async getSelectedTemplateId(): Promise<number> {
    let selectedTemplateId = getDraftData<number>(
      DraftDataType.selectedTemplateId,
    )
    if (selectedTemplateId) {
      return selectedTemplateId
    } else {
      const templates = await this.getTemplates()
      if (templates.length > 0) {
        selectedTemplateId = templates[0].templateId
        setDraftData(DraftDataType.selectedTemplateId, templates[0].templateId)
        return templates[0].templateId
      }
    }
    return 0
  }

  async getSelectedPromptId(): Promise<number> {
    let selectdPromptId = getDraftData<number>(DraftDataType.selectedPromptId)
    if (selectdPromptId) {
      return selectdPromptId
    }
    const selectedTemplateId = await this.getSelectedTemplateId()
    if (!selectedTemplateId) {
      return 0
    }

    const template: Template | null = await this.getTemplate(selectedTemplateId)
    if (template?.promptList && template?.promptList.length > 0) {
      selectdPromptId = template?.promptList[0].promptId
      setDraftData(DraftDataType.selectedPromptId, selectdPromptId)
      return selectdPromptId
    }
    return 0
  }

  async selectPrompt(data: SelectPrompt): Promise<Prompt | null> {
    const result = await getPrompt(data.promptId)
    if (result.success) {
      const prev = await this.getLocalTemplates()
      const prompt = await this.getLocalPrompt(data, prev)
      if (prompt) {
        prompt.promptName = result.data.promptName
        prompt.postType = result.data.postType
        prompt.comment = result.data.comment
        prompt.promptAttachList = result.data.promptAttachList
        prompt.promptOptionList = result.data.promptOptionList
        prompt.notionDatabaseId = result.data.notionDatabaseId
        prompt.userAIProviderId = result.data.userAIProviderId
      } else {
        return null
      }
      await this.updateTemplateToExtension(prev)
      return prompt
    }
    return null
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
          await this.context.globalState.update('templates', prev)
          const success = await removeTemplate(templateId)
          if (success) {
            const templates = await this.getTemplates()
            let selectedTemplateId = getDraftData(
              DraftDataType.selectedTemplateId,
            )
            if (templates.length > 0 && selectedTemplateId === templateId) {
              setDraftData(
                DraftDataType.selectedTemplateId,
                templates[0].templateId,
              )
              const sideViewProvider = getSideViewProvider()
              if (sideViewProvider) {
                sideViewProvider.postMessageToWebview({
                  type: MessageType.TEMPLATE_SELECTED,
                  payload: { template: templates[0] },
                })
              }
            } else if (templates.length === 0) {
              setDraftData(DraftDataType.selectedTemplateId, 0)
            }
            refreshTemplateProvider()
            vscode.window.showInformationMessage('템플릿이 삭제되었습니다.')
          }
        }
      })
  }

  async renameTemplate(templateId: number): Promise<void> {
    const prev = await this.getLocalTemplates()
    const template = await this.getLocalTemplate(templateId, prev)
    if (!template) {
      vscode.window.showInformationMessage('템플릿을 찾을 수 없습니다.')
      return
    }

    const templateName = await vscode.window.showInputBox({
      value: template.templateName,
      prompt: '템플릿 이름을 입력하세요',
      placeHolder: template.templateName,
    })

    if (templateName) {
      template.templateName = templateName
      await this.updateTemplateToExtension(prev)
      const success = await updateTemplate({ templateId, templateName })
      if (success) {
        await vscode.window.showInformationMessage(
          `템플릿 이름을 <${templateName}>로 변경했습니다.`,
        )
      }
    }
  }

  async addAndSaveToPrompt(snapshot: Snapshot): Promise<void> {
    const selectedTemplateId = await this.getSelectedTemplateId()
    const selectedPromptId = await this.getSelectedPromptId()
    const prev = await this.getLocalTemplates()
    const prompt = await this.getLocalPrompt(
      {
        promptId: selectedPromptId,
        templateId: selectedTemplateId,
      },
      prev,
    )
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
    await this.updateTemplateToExtension(prev)
    const { promptId, parentPrompt, templateId, ...submitPromptData } = prompt
    const success = await submitPrompt({
      submitPrompt: submitPromptData as SubmitPrompt,
      promptId: selectedPromptId,
    })
    if (success) {
      vscode.window.showInformationMessage(`프롬프트에 추가되었습니다`)
    }
  }

  async addToPrompt(snapshot: Snapshot): Promise<void> {
    const sideViewProvider = getSideViewProvider()
    if (sideViewProvider) {
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
        sideViewProvider.postMessageToWebview({
          type: MessageType.TEMPLATE_SELECTED,
          payload: {
            template: template,
          },
        })
      }
      sideViewProvider.postMessageToWebview({
        type: MessageType.SNAPSHOT_SELECTED,
        payload: {
          snapshot: promptAttach,
        },
      })
      vscode.window.showInformationMessage(`프롬프트에 추가되었습니다`)
    } else {
      this.addAndSaveToPrompt(snapshot)
    }
  }

  async createTemplate(): Promise<number> {
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
        if (result.success) {
          const templateList = result.data
          await this.context.globalState.update('templates', templateList)
          refreshTemplateProvider()
          return templateList[0].templateId
        }
      }
    }
    return 0
  }

  async generatePost(prompt: Prompt): Promise<Post | null> {
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
          const result = await generateAIPost({ promptId: prompt.promptId })
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
            vscode.window.showInformationMessage(
              `포스트 미리보기에서 확인해주세요: ${newPost.postTitle}`,
            )

            setDraftData(DraftDataType.selectedPostId, createdPost.postId)
            const sideViewProvider = getSideViewProvider()
            if (sideViewProvider) {
              sideViewProvider.postMessageToWebview({
                type: MessageType.GET_CURRENT_POST,
              })
            }
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

  async updateTemplateToExtension(prev: Template[]): Promise<void> {
    await this.context.globalState.update('templates', prev)
    refreshTemplateProvider()
  }

  async submitPrompt(data: SubmitUpdatePrompt): Promise<boolean> {
    const prev = await this.getLocalTemplates()
    const prompt = await this.getLocalPrompt(
      {
        promptId: data.selectedTemplateId,
        templateId: data.selectedTemplateId,
      },
      prev,
    )
    if (prompt) {
      const { promptId, parentPrompt, templateId, ...submitPromptData } =
        data.prompt
      // submitPromptData.userAIProviderId = 4
      const success = await submitPrompt({
        submitPrompt: submitPromptData as SubmitPrompt,
        promptId: promptId,
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
          prompt.userAIProviderId = result.data.userAIProviderId
        }
        await this.updateTemplateToExtension(prev)
        vscode.window.showInformationMessage(
          `프롬프트가 저장되었습니다: ${data.prompt.promptName}`,
        )
        return true
      }
    }
    return false
  }

  async createPrompt(data: SubmitCreatePrompt): Promise<SelectPrompt | null> {
    const newPrompt: CreatePrompt = {
      parentPromptId: null,
      templateId: data.selectedTemplateId,
      promptName: data.prompt.promptName,
      postType: data.prompt.postType,
      comment: data.prompt.comment,
      promptAttachList: data.prompt.promptAttachList,
      promptOptionList: data.prompt.promptOptionList,
      notionDatabaseId: data.prompt.notionDatabaseId,
      userAIProviderId: data.prompt.userAIProviderId,
    }
    const success = await savePrompt(newPrompt)
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
    return null
  }

  async deletePrompt(data: SelectPrompt): Promise<void> {
    const prev = await this.getLocalTemplates()
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
      refreshTemplateProvider()
    }
    vscode.window.showInformationMessage(`프롬프트가 삭제되었습니다:`)
  }

  async getLocalTemplates(): Promise<Template[]> {
    return this.context.globalState.get<Template[]>('templates', [])
  }

  async getLocalTemplate(
    templateId: number,
    prev?: Template[],
  ): Promise<Template | null> {
    const templates = prev ?? (await this.getLocalTemplates())
    return templates.find((t) => t.templateId === templateId) || null
  }

  async getDefaultTemplate(): Promise<Template | null> {
    const selectedTemplateId = getDraftData<number>(
      DraftDataType.selectedTemplateId,
    )
    if (selectedTemplateId) {
      return this.getLocalTemplate(selectedTemplateId)
    } else {
      const templates = await this.getLocalTemplates()
      if (templates.length > 0) {
        setDraftData(DraftDataType.selectedTemplateId, templates[0].templateId)
        return templates[0]
      }
    }
    return null
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
// TODO : 절반 이하로 줄인다 671
