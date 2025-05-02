import * as vscode from 'vscode'

import { getDraftData } from '../configuration/draftData'
import { DraftDataType } from '../types/configuration'
import { Snapshot, SnapshotType } from '../types/snapshot'
import { Template } from '../types/template'

export class SnapshotItem extends vscode.TreeItem {
  constructor(public readonly snapshot: Snapshot) {
    super(snapshot.snapshotName, vscode.TreeItemCollapsibleState.None)
    this.tooltip = `${snapshot.snapshotName}`
    this.command = {
      command: 'vibeEditor.viewCodeSnapshot',
      title: 'View Code Snapshot',
      arguments: [snapshot],
    }
    this.iconPath = new vscode.ThemeIcon('symbol-snippet')
    this.contextValue = 'vibeEditorCodeSnapshot' // ✅ 컨텍스트 메뉴 조건용
  }
}

export class SnapshotProvider
  implements vscode.TreeDataProvider<vscode.TreeItem>
{
  private _onDidChangeTreeData: vscode.EventEmitter<
    vscode.TreeItem | undefined | void
  > = new vscode.EventEmitter<vscode.TreeItem | undefined | void>()
  readonly onDidChangeTreeData: vscode.Event<
    vscode.TreeItem | undefined | void
  > = this._onDidChangeTreeData.event

  constructor(protected context: vscode.ExtensionContext) {}

  refresh(): void {
    this._onDidChangeTreeData.fire()
  }

  getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
    return element
  }

  getChildren(): vscode.ProviderResult<vscode.TreeItem[]> {
    const snapshots = this.context.globalState.get<Snapshot[]>(
      'codeSnapshots',
      [],
    )
    return snapshots
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map((snapshot) => new SnapshotItem(snapshot))
  }
}

export class CodeSnapshotProvider extends SnapshotProvider {
  constructor(context: vscode.ExtensionContext) {
    super(context)
  }

  getChildren(): vscode.ProviderResult<vscode.TreeItem[]> {
    const selectedTemplateId = getDraftData(DraftDataType.selectedTemplateId)
    if (!selectedTemplateId) {
      return []
    }
    const templates = this.context.globalState.get<Template[]>('templates', [])
    const selectedTemplate = templates?.find(
      (template) => template.templateId === selectedTemplateId,
    )
    const snapshots = selectedTemplate?.snapshots || []
    return snapshots
      .filter(
        (snapshot) =>
          snapshot.snapshotType === SnapshotType.BLOCK ||
          snapshot.snapshotType === SnapshotType.FILE,
      )
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map((snapshot) => new SnapshotItem(snapshot))
  }
}

export class DirectoryTreeSnapshotProvider extends SnapshotProvider {
  constructor(context: vscode.ExtensionContext) {
    super(context)
  }

  getChildren(): vscode.ProviderResult<vscode.TreeItem[]> {
    const selectedTemplateId = getDraftData(DraftDataType.selectedTemplateId)
    if (!selectedTemplateId) {
      return []
    }
    const templates = this.context.globalState.get<Template[]>('templates', [])
    const selectedTemplate = templates?.find(
      (template) => template.templateId === selectedTemplateId,
    )
    const snapshots = selectedTemplate?.snapshots || []
    return snapshots
      .filter((snapshot) => snapshot.snapshotType === SnapshotType.DIRECTORY)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map((snapshot) => new SnapshotItem(snapshot))
  }
}

export class LogSnapshotProvider extends SnapshotProvider {
  constructor(context: vscode.ExtensionContext) {
    super(context)
  }

  getChildren(): vscode.ProviderResult<vscode.TreeItem[]> {
    const selectedTemplateId = getDraftData(DraftDataType.selectedTemplateId)
    if (!selectedTemplateId) {
      return []
    }
    const templates = this.context.globalState.get<Template[]>('templates', [])
    const selectedTemplate = templates?.find(
      (template) => template.templateId === selectedTemplateId,
    )
    const snapshots = selectedTemplate?.snapshots || []
    return snapshots
      .filter((snapshot) => snapshot.snapshotType === SnapshotType.LOG)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map((snapshot) => new SnapshotItem(snapshot))
  }
}

export function registerSnapshotViewCommand(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand(
      'vibeEditor.viewCodeSnapshot',
      (snapshot: Snapshot) => {
        const panel = vscode.window.createWebviewPanel(
          'captureCodeSnapshot',
          `📸 ${snapshot.snapshotName}`,
          vscode.ViewColumn.One,
          { enableScripts: false },
        )

        panel.webview.html = getCodeWebviewHTML(snapshot)
      },
    ),
  )
}

function getCodeWebviewHTML(snapshot: Snapshot): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>${snapshot.snapshotName}</title>
      <style>
        body {
          font-family: monospace;
          padding: 1rem;
          background-color: #1e1e1e;
          color: #d4d4d4;
        }
        pre {
          white-space: pre-wrap;
          word-wrap: break-word;
          background-color: #2d2d2d;
          padding: 1rem;
          border-radius: 6px;
        }
      </style>
    </head>
    <body>
      <h3>${snapshot.snapshotName} | ${snapshot.createdAt}</h3>
      <pre>${snapshot.content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
    </body>
    </html>
  `
}
