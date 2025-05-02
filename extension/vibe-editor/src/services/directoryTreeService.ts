import * as fs from 'fs'
import * as path from 'path'
import * as vscode from 'vscode'

import { getDraftData } from '../configuration/draftData'
import { DraftDataType } from '../types/configuration'
import { Snapshot } from '../types/snapshot'
import { Template } from '../types/template'
import { refreshAllProviders } from './snapshotService'

export class DirectoryTreeService {
  private context: vscode.ExtensionContext

  constructor(context: vscode.ExtensionContext) {
    this.context = context
  }

  public async generateTree(
    dirPath: string,
    templates: Template[],
    prefix = '',
  ): Promise<string> {
    try {
      const entries = fs.readdirSync(dirPath, { withFileTypes: true })
      let result = ''

      for (const entry of entries) {
        const entryPath = path.join(dirPath, entry.name)
        result += `${prefix}${entry.name}\n`

        if (entry.isDirectory()) {
          result += await this.generateTree(entryPath, templates, prefix + '  ')
        }
      }

      // 최상위 디렉토리에서만 스냅샷 생성
      if (prefix === '') {
        const timestamp = new Date()
          .toISOString()
          .replace(/[-:]/g, '')
          .split('.')[0]

        const snapshot: Snapshot = {
          snapshotId: new Date().getTime(),
          snapshotName: dirPath,
          snapshotType: 'directory',
          content: result,
          createdAt: timestamp,
          updatedAt: timestamp,
        }
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
            return ''
          }
          selectedTemplateId = selected.templateId
        }
        const selectedTemplate = templates.find(
          (template) => template.templateId === selectedTemplateId,
        )
        if (!selectedTemplate) {
          vscode.window.showInformationMessage('선택한 템플릿이 없습니다.')
          return ''
        }
        selectedTemplate.snapshots?.push(snapshot)
        await this.context.globalState.update('templates', [
          ...templates.filter(
            (t) => t.templateId !== selectedTemplate.templateId,
          ),
          selectedTemplate,
        ])

        vscode.window.showInformationMessage(
          '📸 디렉토리 트리 스냅샷이 저장되었습니다!',
        )
        vscode.commands.executeCommand(
          'workbench.view.extension.vibeEditorDirectoryTreeSnapshot',
        )
      }

      refreshAllProviders()
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
