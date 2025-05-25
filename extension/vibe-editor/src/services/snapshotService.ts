import * as vscode from 'vscode'

import {
  addSnapshot,
  getSnapshotDetail,
  removeSnapshot,
  updateSnapshot,
} from '../apis/snapshot'
import { getDraftData, setDraftData } from '../configuration/draftData'
import { DraftDataType } from '../types/configuration'
import { Snapshot, SnapshotType } from '../types/snapshot'
import { Template } from '../types/template'
import { formatTime } from '../utils/formatTime'
import {
  SnapshotItem,
  refreshTemplateProvider,
} from '../views/tree/templateTreeView'
import { TemplateService } from './templateService'

export class SnapshotService {
  private context: vscode.ExtensionContext

  constructor(context: vscode.ExtensionContext) {
    this.context = context
  }
  public async selectTemplate(templates: Template[]): Promise<Template | null> {
    let selectedTemplateId = getDraftData(DraftDataType.selectedTemplateId)
    console.log('selectTemplate', selectedTemplateId, templates)

    if (!selectedTemplateId) {
      return new Promise<Template | null>((resolve) => {
        const quickPick = vscode.window.createQuickPick()
        quickPick.items = templates.map((template) => ({
          label: template.templateName,
          templateId: template.templateId,
        }))
        quickPick.placeholder = '에픽을 선택하세요'
        quickPick.buttons = [
          {
            iconPath: new vscode.ThemeIcon('add'),
            tooltip: '에픽 추가',
          },
        ]

        quickPick.onDidTriggerButton(async () => {
          quickPick.hide()
          const templateService = new TemplateService(this.context)
          await templateService.createTemplate()
          resolve(null)
        })

        quickPick.onDidAccept(() => {
          const selected = quickPick.selectedItems[0] as {
            label: string
            templateId: number
          }
          if (selected) {
            const template = templates.find(
              (t) => t.templateId === selected.templateId,
            )
            quickPick.hide()
            resolve(template ?? null)
          } else {
            resolve(null)
          }
        })

        quickPick.onDidHide(() => {
          resolve(null)
        })

        quickPick.show()
      })
    }

    return (
      templates.find(
        (template) => template.templateId === selectedTemplateId,
      ) ?? null
    )
  }
  public async getSnapshotName(): Promise<string> {
    const editor = vscode.window.activeTextEditor
    if (!editor) return ''

    const document = editor.document
    const selection = editor.selection
    const selectedText = document.getText(selection).trim()

    if (!selectedText) {
      vscode.window.showWarningMessage('⚠️ 드래그한 코드가 없습니다.')
      return ''
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
    return id
  }
  public async captureSnapshot(): Promise<string> {
    const editor = vscode.window.activeTextEditor
    if (!editor) return ''

    const document = editor.document
    const selection = editor.selection
    const selectedText = document.getText(selection).trim()
    return selectedText
  }

  async getSnapshots(currentTemplateId: number): Promise<Snapshot[]> {
    const templates = this.context.globalState.get<Template[]>('templates', [])
    const currentTemplate =
      templates.find((template) => template.templateId === currentTemplateId) ??
      null
    templates.find
    return currentTemplate?.snapshotList ?? []
  }

  public async deleteSnapshot(snapshotId: number): Promise<void> {
    let selectedTemplateId = getDraftData(DraftDataType.selectedTemplateId)
    if (!selectedTemplateId) {
      vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: `선택한 에픽이 없습니다.`,
          cancellable: false,
        },
        async () => {
          await new Promise((resolve) => setTimeout(resolve, 2000))
        },
      )
      return
    }
    const prevTemplates = this.context.globalState.get<Template[]>(
      'templates',
      [],
    )

    const success = await removeSnapshot(snapshotId)
    if (success) {
    }
    const updatedTemplates = prevTemplates.map((t) => {
      if (t.templateId === selectedTemplateId) {
        return {
          ...t,
          snapshotList: t.snapshotList?.filter(
            (s) => s.snapshotId !== snapshotId,
          ),
        }
      }
      return t
    })

    await this.context.globalState.update('templates', updatedTemplates)
    vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: `스냅샷이 삭제되었습니다.`,
        cancellable: false,
      },
      async () => {
        await new Promise((resolve) => setTimeout(resolve, 2000))
      },
    )
    refreshTemplateProvider()
  }

  async renameSnapshot(snapshotItem: SnapshotItem): Promise<void> {
    const selectedTemplateId = snapshotItem.templateId
    const templates = this.context.globalState.get<Template[]>('templates', [])

    const template = templates.find(
      (template) => template?.templateId === selectedTemplateId,
    )
    if (!template) {
      return
    }
    const snapshot: Snapshot | undefined = template.snapshotList?.find(
      (snapshot) => snapshot.snapshotId === snapshotItem.snapshot.snapshotId,
    )

    if (!snapshot) {
      vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: '스냅샷을 찾을 수 없습니다.',
          cancellable: false,
        },
        async () => {
          await new Promise((resolve) => setTimeout(resolve, 2000))
        },
      )
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
          const success = await updateSnapshot({
            snapshotId: snapshotItem.snapshot.snapshotId,
            snapshotName: snapshot.snapshotName,
          })
          if (success) {
            await this.context.globalState.update('templates', templates)
            refreshTemplateProvider()
          }
        }
      })
  }

  public async copyCode(): Promise<string> {
    const text = await vscode.env.clipboard.readText()
    return text
  }

  async createSnapshotName(defaultSnapshotName: string): Promise<string> {
    const newSnapshotName = await vscode.window.showInputBox({
      prompt: '스냅샷 이름을 입력하세요',
      placeHolder: '스냅샷 이름',
      value: defaultSnapshotName,
    })
    return newSnapshotName ?? defaultSnapshotName
  }

  async createSnapshot({
    defaultSnapshotName,
    snapshotType,
    snapshotContent,
    localTemplates,
  }: {
    defaultSnapshotName: string
    snapshotType: SnapshotType
    snapshotContent: string
    localTemplates: Template[]
  }): Promise<boolean> {
    const selectedTemplate = await this.selectTemplate(localTemplates)
    if (!selectedTemplate) {
      vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: '선택한 에픽이 없습니다.',
          cancellable: false,
        },
        async () => {
          await new Promise((resolve) => setTimeout(resolve, 2000))
        },
      )
      return false
    }

    const snapshotName = await this.createSnapshotName(defaultSnapshotName)
    return await addSnapshot({
      templateId: selectedTemplate.templateId,
      snapshotName: snapshotName,
      snapshotType: snapshotType,
      snapshotContent: snapshotContent,
    })
  }
  public async openTextDocument(content: string) {
    const doc = await vscode.workspace.openTextDocument({
      content: content,
      language: 'plaintext',
    })
    await vscode.window.showTextDocument(doc)
  }

  public async updateCodeSnapshot(
    snapshotId: number,
    templateId: number,
  ): Promise<Snapshot | null> {
    const result = await getSnapshotDetail(snapshotId)
    if (!result.success) {
      vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: '스냅샷을 찾을 수 없습니다.',
          cancellable: false,
        },
        async () => {
          await new Promise((resolve) => setTimeout(resolve, 2000))
        },
      )
      return null
    }
    const {
      snapshotName,
      snapshotType,
      snapshotContent,
      createdAt,
      updatedAt,
    } = result.data

    const selectedTemplateId = templateId
    if (selectedTemplateId) {
      const templates = this.context.globalState.get<Template[]>(
        'templates',
        [],
      )
      const localTemplate = templates.find(
        (t) => t.templateId == selectedTemplateId,
      )
      if (localTemplate) {
        const localSnapshot = localTemplate.snapshotList?.find(
          (s) => s.snapshotId == snapshotId,
        )
        console.log('로컬 스냅샷', localSnapshot)
        if (localSnapshot) {
          localSnapshot.snapshotName = snapshotName
          localSnapshot.snapshotType = snapshotType
          localSnapshot.snapshotContent = snapshotContent
          localSnapshot.updatedAt = updatedAt
          localSnapshot.createdAt = createdAt
          await this.context.globalState.update('templates', templates)
          return localSnapshot
        }
      }
    }
    return null
  }
  public async viewUpdatedSnapshot(snapshot: Snapshot): Promise<void> {
    const panel = vscode.window.createWebviewPanel(
      'captureCodeSnapshot',
      `📸 ${snapshot.snapshotName}`,
      vscode.ViewColumn.One,
      {
        enableScripts: false,
        localResourceRoots: [vscode.Uri.file(this.context.extensionPath)],
      },
    )
    panel.webview.html = this.getCodeWebviewHTML(snapshot)
  }
  public async viewCodeSnapshot(
    snapshotId: number,
    templateId: number,
  ): Promise<void> {
    setDraftData(DraftDataType.selectedTemplateId, templateId)
    const snapshot = await this.updateCodeSnapshot(snapshotId, templateId)
    if (!snapshot) {
      vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: '스냅샷을 찾을 수 없습니다.',
          cancellable: false,
        },
        async () => {
          await new Promise((resolve) => setTimeout(resolve, 2000))
        },
      )
      return
    }
    await this.viewUpdatedSnapshot(snapshot)
  }

  getCodeWebviewHTML(snapshot: Snapshot): string {
    let label = ''
    switch (snapshot.snapshotType) {
      case SnapshotType.BLOCK:
        label = '코드 스냅샷'
        break
      case SnapshotType.FILE:
        label = '파일 스냅샷'
        break
      case SnapshotType.DIRECTORY:
        label = '디렉토리 구조 시각화'
        break
      case SnapshotType.LOG:
        label = '로그 스냅샷'
        break
      default:
        break
    }

    const cssPath = vscode.Uri.file(
      this.context.asAbsolutePath('src/styles/highlight-vscode.css'),
    ).with({ scheme: 'vscode-resource' })

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>${snapshot.snapshotName}</title>
      <link rel="stylesheet" type="text/css" href="${cssPath}">
      <style>
        body {
          font-family: 'var(--vscode-font-family)';
          padding: 1rem;
          background-color: 'var(--vscode-editor-background)';
          color:'var(--vscode-foreground)';
          font-size: 'var(--vscode-font-size)';
        }
        pre {
          font-family: var(--vscode-editor-font-family);
          white-space: pre-wrap;
          word-wrap: break-word;
          padding: 1rem;
          background-color: 'var(--vscode-editor-background)';
          color:'var(--vscode-editor-foreground)';
          border-radius: 6px;
        }
      </style>
    </head>
    <body>
      <label>${label}</label>
      <h3>${snapshot.snapshotName} | ${formatTime(snapshot.createdAt)}</h3>
      <pre>${snapshot.snapshotContent.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
    </body>
    </html>
  `
  }
}
