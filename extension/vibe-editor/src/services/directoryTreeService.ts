import * as fs from 'fs'
import * as path from 'path'
import * as vscode from 'vscode'

export class DirectoryTreeService {
  private context: vscode.ExtensionContext

  constructor(context: vscode.ExtensionContext) {
    this.context = context
  }

  public async generateTree(dirPath: string, prefix = ''): Promise<string> {
    try {
      const entries = fs.readdirSync(dirPath, { withFileTypes: true })
      let result = ''

      for (const entry of entries) {
        const entryPath = path.join(dirPath, entry.name)
        result += `${prefix}${entry.name}\n`

        if (entry.isDirectory()) {
          result += await this.generateTree(entryPath, prefix + '  ')
        }
      }

      if (prefix === '') {
        vscode.window.showInformationMessage(
          '📸 디렉토리 트리 스냅샷이 저장되었습니다!',
        )
        vscode.commands.executeCommand(
          'workbench.view.extension.vibeEditorDirectoryTreeSnapshot',
        )
      }
      return result
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : '알 수 없는 오류가 발생했습니다.'
      vscode.window.showErrorMessage(
        `디렉토리 트리 생성 중 오류 발생: ${errorMessage}`,
      )
      return ''
    }
  }
}
