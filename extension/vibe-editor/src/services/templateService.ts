import * as vscode from 'vscode'

import { CreatePrompt, Prompt, Template } from '../types/template'
import { SubmitPromptMessage } from '../types/webview'
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

  async submitPrompt(data: SubmitPromptMessage): Promise<void> {
    console.log('SUBMIT_PROMPT', data.payload)
    const newPrompt: Prompt = {
      promptId: new Date().getTime(),
      promptName: data.payload.prompt.promptName,
      postType: 'default',
      comment: data.payload.prompt.comment,
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      snapshots: [],
      options: [],
    }

    const prev = this.context.globalState.get<Template[]>('templates') || []
    const templateIndex = prev.findIndex(
      (template) => template.templateId === data.payload.selectedTemplateId,
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

    console.log('getChildren templates', templates)
    return templates
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .map((template) => new TemplateItem(template))
  }
}
