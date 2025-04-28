import * as vscode from 'vscode'

let draftData: Record<string, unknown> = {}

export function setDraftData(key: string, value: unknown): void {
  draftData[key] = value
  vscode.commands.executeCommand(
    'setContext',
    `vibeEditor.draftData.${key}`,
    value,
  )
}

export function getDraftData<T = unknown>(key: string): T | undefined {
  return draftData[key] as T | undefined
}

export function clearDraftData(key?: string): void {
  if (key) {
    delete draftData[key]
    vscode.commands.executeCommand(
      'setContext',
      `vibeEditor.draftData.${key}`,
      undefined,
    )
  } else {
    draftData = {}
    vscode.commands.executeCommand(
      'setContext',
      'vibeEditor.draftData',
      undefined,
    )
  }
}
