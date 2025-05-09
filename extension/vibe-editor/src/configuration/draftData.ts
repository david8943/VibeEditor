import * as vscode from 'vscode'

import { DraftDataType } from '../types/configuration'

const initialDraftData: Record<DraftDataType, unknown> = {
  [DraftDataType.loginStatus]: false,
  [DraftDataType.notionStatus]: false,
  [DraftDataType.selectedTemplateId]: 0,
  [DraftDataType.selectedPromptId]: 0,
  [DraftDataType.selectedPostId]: 0,
  [DraftDataType.optionList]: [],
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

export function clearDraftData(key?: DraftDataType): void {
  if (key) {
    delete draftData[key]
    vscode.commands.executeCommand(
      'setContext',
      `vibeEditor.draftData.${key}`,
      initialDraftData[key],
    )
  } else {
    draftData = { ...initialDraftData }
    Object.entries(initialDraftData).forEach(([key, value]) => {
      vscode.commands.executeCommand(
        'setContext',
        `vibeEditor.draftData.${key}`,
        value,
      )
    })
  }
}
