import * as vscode from 'vscode'

import {
  CaptureSnapshotCommand,
  CopyCodeCommand,
  DirectoryTreeCommand,
  GithubLoginCommand,
  GoogleLoginCommand,
  SetNotionApiCommand,
} from './commands'
import { Configuration } from './configuration'
import {
  setCodeSnapshotProvider,
  setDirectorySnapshotProvider,
  setLogSnapshotProvider,
} from './services/snapshotService'
import {
  CodeSnapshotProvider,
  DirectoryTreeSnapshotProvider,
  LogSnapshotProvider,
  registerSnapshotViewCommand,
} from './views/codeSnapshotView'

export function activate(context: vscode.ExtensionContext): void {
  // 로그인 상태 확인
  const isLoggedIn = Configuration.get('loginStatus')
  if (!isLoggedIn) {
    vscode.window.showInformationMessage('Vibe Editor에 로그인이 필요합니다.')
  }

  // 명령어 등록
  const commands = [
    new CopyCodeCommand(),
    new DirectoryTreeCommand(context),
    new SetNotionApiCommand(context),
    new GoogleLoginCommand(context),
    new GithubLoginCommand(context),
    new CaptureSnapshotCommand(context),
  ]

  commands.forEach((command) => {
    const disposable = vscode.commands.registerCommand(
      command.commandName,
      command.execute.bind(command),
    )
    context.subscriptions.push(disposable)
  })

  // Create Template 명령어 등록
  const createTemplateDisposable = vscode.commands.registerCommand(
    'vibe-editor.createTemplate',
    () => {
      const panel = vscode.window.createWebviewPanel(
        'createTemplate',
        'Create Template',
        vscode.ViewColumn.One,
        {
          enableScripts: true,
        },
      )

      panel.webview.html = getWebviewContent()
    },
  )
  context.subscriptions.push(createTemplateDisposable)

  // 코드 스냅샷 뷰 등록 및 전역 등록
  const codeSnapshotProvider = new CodeSnapshotProvider(context)
  const directoryTreeSnapshotProvider = new DirectoryTreeSnapshotProvider(
    context,
  )
  const logSnapshotProvider = new LogSnapshotProvider(context)

  vscode.window.registerTreeDataProvider(
    'vibeEditorCodeSnapshot',
    codeSnapshotProvider,
  )
  vscode.window.registerTreeDataProvider(
    'vibeEditorDirectoryTreeSnapshot',
    directoryTreeSnapshotProvider,
  )
  vscode.window.registerTreeDataProvider(
    'vibeEditorLogSnapshot',
    logSnapshotProvider,
  )

  // 각 프로바이더 등록
  setCodeSnapshotProvider(codeSnapshotProvider)
  setDirectorySnapshotProvider(directoryTreeSnapshotProvider)
  setLogSnapshotProvider(logSnapshotProvider)

  // 스냅샷 클릭 시 WebView 명령어 등록
  registerSnapshotViewCommand(context)
  // 설정 변경 이벤트 구독
  context.subscriptions.push(Configuration.onDidChangeConfiguration(() => {}))
}

function getWebviewContent(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Create Template</title>
</head>
<body>
  <h1>📝 템플릿 생성 창</h1>
  <p>이곳에 나중에 React가 연결됩니다.</p>
</body>
</html>`
}

export function deactivate(): void {
  // 정리 작업이 필요한 경우 여기에 추가
}
