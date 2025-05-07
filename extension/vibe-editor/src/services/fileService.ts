import * as fs from 'fs'
import * as path from 'path'
import * as vscode from 'vscode'

import { getDraftData } from '../configuration/draftData'
import { DraftDataType } from '../types/configuration'
import { Snapshot, SnapshotType } from '../types/snapshot'
import { Template } from '../types/template'
import { refreshAllProviders } from './snapshotService'

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

      const timestamp = new Date()
        .toISOString()
        .replace(/[-:]/g, '')
        .split('.')[0]

      const snapshot: Snapshot = {
        snapshotId: new Date().getTime(),
        snapshotName: filePath,
        snapshotType: SnapshotType.FILE,
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
      const selectedTemplate: Template | undefined = templates.find(
        (template) => template.templateId === selectedTemplateId,
      )
      if (!selectedTemplate) {
        vscode.window.showInformationMessage('선택한 템플릿이 없습니다.')
        return ''
      }
      selectedTemplate.snapshotList?.push(snapshot)
      await this.context.globalState.update('templates', [
        ...templates.filter(
          (t) => t.templateId !== selectedTemplate.templateId,
        ),
        selectedTemplate,
      ])

      vscode.window.showInformationMessage('📸 파일 스냅샷이 저장되었습니다!')
      vscode.commands.executeCommand(
        'workbench.view.extension.vibeEditorCodeSnapshot',
      )

      refreshAllProviders()
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
