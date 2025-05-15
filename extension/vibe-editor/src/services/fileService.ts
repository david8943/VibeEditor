import * as fs from 'fs'
import * as path from 'path'
import * as vscode from 'vscode'

import { Template } from '../types/template'

export class FileService {
  private context: vscode.ExtensionContext

  constructor(context: vscode.ExtensionContext) {
    this.context = context
  }

  public async captureFileSnapshot(
    filePath: string,
    templates: Template[],
  ): Promise<string> {
    try {
      const fileContent = fs.readFileSync(filePath)
      let result = fileContent.toString()
      vscode.commands.executeCommand(
        'workbench.view.extension.vibeEditorCodeSnapshot',
      )
      return result
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : '알 수 없는 오류가 발생했습니다.'
      vscode.window.showErrorMessage(
        `파일 스냅샷 생성 중 오류 발생: ${errorMessage}`,
      )
      return ''
    }
  }
}
