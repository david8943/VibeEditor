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
import { setSnapshotProvider } from './services/snapshotService'
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
  setSnapshotProvider(codeSnapshotProvider)

  // 스냅샷 클릭 시 WebView 명령어 등록
  registerSnapshotViewCommand(context)
  // 설정 변경 이벤트 구독
  context.subscriptions.push(Configuration.onDidChangeConfiguration(() => {}))
}

export function deactivate(): void {
  // 정리 작업이 필요한 경우 여기에 추가
}
