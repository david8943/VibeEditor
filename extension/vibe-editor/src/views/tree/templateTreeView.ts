import * as vscode from 'vscode'

import { getDraftData } from '../../configuration/draftData'
import { TemplateService } from '../../services/templateService'
import { DraftDataType } from '../../types/configuration'
import { Snapshot, SnapshotType, TypeOrder } from '../../types/snapshot'
import { Prompt, Template } from '../../types/template'

export class TreeItemBase extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
  ) {
    super(label, collapsibleState)
  }

  getChildren(): TreeItemBase[] {
    return []
  }
}
export class SnapshotItem extends TreeItemBase {
  constructor({
    snapshot,
    templateId,
  }: {
    snapshot: Snapshot
    templateId: number
  }) {
    super(snapshot.snapshotName, vscode.TreeItemCollapsibleState.None)
    this.snapshot = snapshot
    this.templateId = templateId
    this.tooltip = `${snapshot.snapshotName}`
    this.command = {
      command: 'vibeEditor.viewCodeSnapshot',
      title: '코드 스냅샷 보기',
      arguments: [{ snapshot, templateId }],
    }
    let iconPath = 'symbol-snippet'
    switch (snapshot.snapshotType) {
      case SnapshotType.BLOCK:
        iconPath = 'code'
        break
      case SnapshotType.FILE:
        iconPath = 'file'
        break
      case SnapshotType.DIRECTORY:
        iconPath = 'file-submodule'
        break
      case SnapshotType.LOG:
        iconPath = 'terminal'
        break
      default:
        break
    }
    this.iconPath = new vscode.ThemeIcon(iconPath)
    const selectdPromptId = getDraftData(DraftDataType.selectedTemplateId)
    if (selectdPromptId == templateId) {
      this.contextValue = 'vibeEditorSelectedSnapshot'
    } else {
      this.contextValue = 'vibeEditorSnapshot'
    }
  }

  public snapshot: Snapshot
  public templateId: number
}

export class CategoryItem extends TreeItemBase {
  constructor(
    public readonly label: string,
    public readonly children: TreeItemBase[] = [],
  ) {
    super(
      label,
      children.length > 0
        ? vscode.TreeItemCollapsibleState.Expanded
        : vscode.TreeItemCollapsibleState.None,
    )
    this.tooltip = label
    this.contextValue = 'vibeEditorCategory'
    this.iconPath = new vscode.ThemeIcon('symbol-folder')
  }

  getChildren(): TreeItemBase[] {
    return this.children
  }
}
export class PromptItem extends TreeItemBase {
  constructor(
    public readonly templateId: number,
    public readonly prompt: Prompt,
    public readonly children: TreeItemBase[] = [],
  ) {
    super(
      prompt.promptName,
      children.length > 0
        ? vscode.TreeItemCollapsibleState.Expanded
        : vscode.TreeItemCollapsibleState.None,
    )
    this.tooltip = prompt.promptName
    this.command = {
      command: 'vibeEditor.showPrompt',
      title: 'View Prompt',
      arguments: [{ prompt, templateId }],
    }
    this.contextValue = 'vibeEditorPrompt'
    this.iconPath = new vscode.ThemeIcon('notebook-template')
  }

  getChildren(): TreeItemBase[] {
    return this.children
  }
}
export class TemplateItem extends TreeItemBase {
  constructor(
    public readonly template: Template,
    public readonly children: TreeItemBase[] = [],
  ) {
    super(
      template.templateName,
      children.length > 0
        ? vscode.TreeItemCollapsibleState.Expanded
        : vscode.TreeItemCollapsibleState.None,
    )
    this.tooltip = `${template.templateName}`
    this.command = {
      command: 'vibeEditor.showTemplatePage',
      title: 'View Template',
      arguments: [template.templateId],
    }
    this.iconPath = new vscode.ThemeIcon('notebook')
    this.contextValue = 'vibeEditorTemplatePage'
  }

  getChildren(): TreeItemBase[] {
    return this.children
  }
}

export class TemplateProvider implements vscode.TreeDataProvider<TreeItemBase> {
  private _onDidChangeTreeData: vscode.EventEmitter<
    TreeItemBase | undefined | void
  > = new vscode.EventEmitter<TreeItemBase | undefined | void>()
  readonly onDidChangeTreeData: vscode.Event<TreeItemBase | undefined | void> =
    this._onDidChangeTreeData.event

  private templateService: TemplateService

  refresh(): void {
    this._onDidChangeTreeData.fire()
  }

  constructor(private context: vscode.ExtensionContext) {
    this.templateService = new TemplateService(context)
  }

  getTreeItem(element: TreeItemBase): TreeItemBase {
    return element
  }

  async getChildren(element?: TreeItemBase): Promise<TreeItemBase[]> {
    if (!element) {
      const templates: Template[] = await this.templateService.getTemplates()

      return templates?.map((template) => {
        const sortedSnapshotList = template.snapshotList?.sort((a, b) => {
          if (
            a.snapshotType === SnapshotType.BLOCK &&
            b.snapshotType !== SnapshotType.BLOCK
          ) {
            return -1
          }
          if (
            b.snapshotType === SnapshotType.BLOCK &&
            a.snapshotType !== SnapshotType.BLOCK
          ) {
            return 1
          }

          return (
            (TypeOrder[a.snapshotType] || 0) - (TypeOrder[b.snapshotType] || 0)
          )
        })

        const categories = [
          ...(template.promptList?.map(
            (prompt) => new PromptItem(template.templateId, prompt),
          ) || []),
          new CategoryItem('스냅샷', [
            ...(template.snapshotList
              ?.filter(
                (snapshot) =>
                  snapshot.snapshotType === SnapshotType.BLOCK ||
                  snapshot.snapshotType === SnapshotType.FILE,
              )
              .map(
                (snapshot) =>
                  new SnapshotItem({
                    snapshot,
                    templateId: template.templateId,
                  }),
              ) || []),
            ...(template.snapshotList
              ?.filter((snapshot) => snapshot.snapshotType === SnapshotType.LOG)
              .map(
                (snapshot) =>
                  new SnapshotItem({
                    snapshot,
                    templateId: template.templateId,
                  }),
              ) || []),
            ...(template.snapshotList
              ?.filter(
                (snapshot) => snapshot.snapshotType === SnapshotType.DIRECTORY,
              )
              .map(
                (snapshot) =>
                  new SnapshotItem({
                    snapshot,
                    templateId: template.templateId,
                  }),
              ) || []),
          ]),
        ]
        return new TemplateItem(template, categories)
      })
    } else {
      return element.getChildren()
    }
  }
}

let templateProviderInstance: TemplateProvider | undefined

export function refreshTemplateProvider(): void {
  templateProviderInstance?.refresh()
}

export function setTemplateProvider(provider: TemplateProvider) {
  templateProviderInstance = provider
}
