import * as vscode from 'vscode'

import { DraftDataType } from '../types/configuration'
import { PageType } from '../types/webview'

//Test
const initialDraftData: Record<DraftDataType, unknown> = {
  [DraftDataType.loginStatus]: false,
  [DraftDataType.notionStatus]: false,
  [DraftDataType.selectedTemplateId]: 0,
  [DraftDataType.selectedPromptId]: 0,
  [DraftDataType.selectedPostId]: 0,
  [DraftDataType.optionList]: [],
  [DraftDataType.selectedPage]: PageType.SETTING,
}

let draftData: Record<DraftDataType, unknown> = { ...initialDraftData }

export function setDraftData(key: DraftDataType, value: unknown): void {
  draftData[key] = value
  vscode.commands.executeCommand(
    'setContext',
    `vibeEditor.draftData.${key}`,
    value,
  )
}

export function getDraftData<T = unknown>(key: DraftDataType): T | undefined {
  return draftData[key] as T | undefined
}

export async function clearDraftData(key?: DraftDataType): Promise<void> {
  if (key) {
    delete draftData[key]
    await vscode.commands.executeCommand(
      'setContext',
      `vibeEditor.draftData.${key}`,
      initialDraftData[key],
    )
  } else {
    draftData = { ...initialDraftData }
    for (const [key, value] of Object.entries(initialDraftData)) {
      await vscode.commands.executeCommand(
        'setContext',
        `vibeEditor.draftData.${key}`,
        value,
      )
    }
  }
}
