import * as vscode from 'vscode'

export interface CodeSnapshot {
  id: string
  filePath: string
  relativePath: string
  lineRange: string
  content: string
  createdAt: string
}

class SnapshotItem extends vscode.TreeItem {
  constructor(public readonly snapshot: CodeSnapshot) {
    super(snapshot.id, vscode.TreeItemCollapsibleState.None)
    this.tooltip = `${snapshot.relativePath}:${snapshot.lineRange}`
    this.command = {
      command: 'vibe-editor.viewCodeSnapshot',
      title: 'View Code Snapshot',
      arguments: [snapshot],
    }
    this.iconPath = new vscode.ThemeIcon('symbol-snippet')
  }
}

export class CodeSnapshotProvider
  implements vscode.TreeDataProvider<vscode.TreeItem>
{
  private _onDidChangeTreeData: vscode.EventEmitter<
    vscode.TreeItem | undefined | void
  > = new vscode.EventEmitter<vscode.TreeItem | undefined | void>()
  readonly onDidChangeTreeData: vscode.Event<
    vscode.TreeItem | undefined | void
  > = this._onDidChangeTreeData.event

  constructor(private context: vscode.ExtensionContext) {}

  refresh(): void {
    this._onDidChangeTreeData.fire()
  }

  getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
    return element
  }

  getChildren(): vscode.ProviderResult<vscode.TreeItem[]> {
    const snapshots =
      this.context.workspaceState.get<CodeSnapshot[]>('codeSnapshots') || []
    return snapshots
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map((snapshot) => new SnapshotItem(snapshot))
  }
}

export function registerSnapshotViewCommand(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand(
      'vibe-editor.viewCodeSnapshot',
      (snapshot: CodeSnapshot) => {
        const panel = vscode.window.createWebviewPanel(
          'codeSnapshot',
          `📸 ${snapshot.id}`,
          vscode.ViewColumn.One,
          { enableScripts: false },
        )

        panel.webview.html = getCodeWebviewHTML(snapshot)
      },
    ),
  )
}

function getCodeWebviewHTML(snapshot: CodeSnapshot): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>${snapshot.id}</title>
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
      <h3>${snapshot.relativePath} | ${snapshot.lineRange} | ${snapshot.createdAt}</h3>
      <pre>${snapshot.content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
    </body>
    </html>
  `
}
