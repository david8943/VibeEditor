import * as vscode from 'vscode'

import { getDraftData } from '../configuration/draftData'
import { DraftDataType } from '../types/configuration'
import { Snapshot } from '../types/snapshot'
import { Template } from '../types/template'
import { SnapshotProvider } from '../views/codeSnapshotView'
import { SnapshotItem } from '../views/codeSnapshotView'

let codeProviderInstance: SnapshotProvider | undefined
let directoryProviderInstance: SnapshotProvider | undefined
let logProviderInstance: SnapshotProvider | undefined

export function setCodeSnapshotProvider(provider: SnapshotProvider) {
  codeProviderInstance = provider
}

export function setDirectorySnapshotProvider(provider: SnapshotProvider) {
  directoryProviderInstance = provider
}

export function setLogSnapshotProvider(provider: SnapshotProvider) {
  logProviderInstance = provider
}

export function refreshAllProviders() {
  codeProviderInstance?.refresh()
  directoryProviderInstance?.refresh()
  logProviderInstance?.refresh()
}

export class SnapshotService {
  private context: vscode.ExtensionContext

  constructor(context: vscode.ExtensionContext) {
    this.context = context
  }
  public async refreshSnapshot(): Promise<void> {
    refreshAllProviders()
  }
  public async selectTemplate(templates: Template[]): Promise<Template | null> {
    let selectedTemplateId = getDraftData(DraftDataType.selectedTemplateId)
    if (!selectedTemplateId) {
      const selected = await vscode.window.showQuickPick(
        templates.map((template) => ({
          label: template.templateName,
          templateId: template.templateId,
        })),
        { placeHolder: '템플릿을 선택하세요' },
      )

      if (!selected) {
        vscode.window.showInformationMessage(`선택해주세요.`)
        return null
      }
      selectedTemplateId = selected.templateId
    }
    return (
      templates.find(
        (template) => template.templateId === selectedTemplateId,
      ) ?? null
    )
  }
  public async captureSnapshot(templates: Template[]): Promise<void> {
    const selectedTemplate = await this.selectTemplate(templates)
    if (!selectedTemplate) {
      vscode.window.showInformationMessage(`선택한 템플릿이 없습니다.`)
      return
    }

    const editor = vscode.window.activeTextEditor
    if (!editor) return

    const document = editor.document
    const selection = editor.selection
    const selectedText = document.getText(selection).trim()

    if (!selectedText) {
      vscode.window.showWarningMessage('⚠️ 드래그한 코드가 없습니다.')
      return
    }

    const filePath = document.uri.fsPath
    const relativePath = vscode.workspace.asRelativePath(filePath)
    const startLine = selection.start.line + 1
    const endLine = selection.end.line + 1
    const timestamp = new Date()
      .toISOString()
      .replace(/[-:]/g, '')
      .split('.')[0]
    const id = `${relativePath}_${startLine}-${endLine}_${timestamp}`

    const snapshot: Snapshot = {
      snapshotId: new Date().getTime(),
      snapshotName: id,
      snapshotType: 'code',
      content: selectedText,
      createdAt: timestamp,
      updatedAt: timestamp,
    }

    selectedTemplate.snapshots?.push(snapshot)
    await this.context.globalState.update('templates', [
      ...templates.filter((t) => t.templateId !== selectedTemplate.templateId),
      selectedTemplate,
    ])

    vscode.window.showInformationMessage('📸 코드 스냅샷이 저장되었습니다!')
    vscode.commands.executeCommand(
      'workbench.view.extension.vibeEditorCodeSnapshot',
    )

    refreshAllProviders()
  }

  async getSnapshots(currentTemplateId: number): Promise<Snapshot[]> {
    const templates = this.context.globalState.get<Template[]>('templates', [])
    const currentTemplate =
      templates.find((template) => template.templateId === currentTemplateId) ??
      null
    templates.find
    return currentTemplate?.snapshots ?? []
  }

  public async deleteSnapshot(snapshot: SnapshotItem): Promise<void> {
    let selectedTemplateId = getDraftData(DraftDataType.selectedTemplateId)
    if (!selectedTemplateId) {
      vscode.window.showInformationMessage(`선택한 템플릿이 없습니다.`)
      return
    }
    const prevTemplates = this.context.globalState.get<Template[]>(
      'templates',
      [],
    )

    const updatedTemplates = prevTemplates.map((t) => {
      if (t.templateId === selectedTemplateId) {
        return {
          ...t,
          snapshots: t.snapshots?.filter(
            (s) => s.snapshotId !== snapshot.snapshot.snapshotId,
          ),
        }
      }
      return t
    })

    await this.context.globalState.update('templates', updatedTemplates)
    vscode.window.showInformationMessage(`스냅샷이 삭제되었습니다.`)
    refreshAllProviders()
  }

  async renameSnapshot(snapshotId: number): Promise<void> {
    const selectedTemplateId = getDraftData(DraftDataType.selectedTemplateId)
    const templates = this.context.globalState.get<Template[]>('templates', [])

    const template = templates.find(
      (template) => template?.templateId === selectedTemplateId,
    )
    if (!template) {
      return
    }
    const snapshot: Snapshot | undefined = template.snapshots?.find(
      (snapshot) => snapshot.snapshotId === snapshotId,
    )

    if (!snapshot) {
      vscode.window.showInformationMessage('스냅샷을 찾을 수 없습니다.')
      return
    }

    vscode.window
      .showInputBox({
        value: snapshot.snapshotName,
        prompt: '스냅샷 이름을 입력하세요',
        placeHolder: snapshot.snapshotName,
      })
      .then(async (value) => {
        if (value) {
          snapshot.snapshotName = value
          await this.context.globalState.update('templates', templates)
          refreshAllProviders()
        }
      })
  }

  public async copyCode(templates: Template[]): Promise<void> {
    const text = await vscode.env.clipboard.readText()
    const title = await vscode.window.showInputBox({
      prompt: `${text} 로그의 제목을 입력해주세요.`,
      placeHolder: '로그 제목',
    })
    if (!title) {
      vscode.window.showWarningMessage('⚠️ 로그 제목을 입력해주세요.')
      return
    }
    const selectedTemplate = await this.selectTemplate(templates)
    if (!selectedTemplate) {
      vscode.window.showInformationMessage('선택한 템플릿이 없습니다.')
      return
    }
    const snapshot: Snapshot = {
      snapshotId: new Date().getTime(),
      snapshotName: title,
      snapshotType: 'log',
      content: text,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    selectedTemplate.snapshots?.push(snapshot)
    await this.context.globalState.update('templates', [
      ...templates.filter((t) => t.templateId !== selectedTemplate.templateId),
      selectedTemplate,
    ])

    vscode.window.showInformationMessage('📸 코드 스냅샷이 저장되었습니다!')
    refreshAllProviders()
  }
}
