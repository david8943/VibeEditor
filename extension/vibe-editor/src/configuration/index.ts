import * as vscode from 'vscode'

// 설정 키와 값 타입 정의
interface ConfigSchema {
  loginStatus: boolean
  notionStatus: boolean
}

// 기본값 정의
const defaultConfig: ConfigSchema = {
  loginStatus: false,
  notionStatus: false,
}

export class Configuration {
  private static readonly configSection = 'vibeEditor'
  private static currentConfig: ConfigSchema = { ...defaultConfig }

  public static get<K extends keyof ConfigSchema>(key: K): ConfigSchema[K] {
    const config = vscode.workspace.getConfiguration(this.configSection)
    const value = config.get<ConfigSchema[K]>(key)
    return value ?? this.currentConfig[key]
  }

  public static async set<K extends keyof ConfigSchema>(
    key: K,
    value: ConfigSchema[K],
  ): Promise<void> {
    this.currentConfig[key] = value
    try {
      const config = vscode.workspace.getConfiguration(this.configSection)
      await config.update(key, value, vscode.ConfigurationTarget.Global)

      // 뷰 업데이트
      await vscode.commands.executeCommand(
        'setContext',
        `vibeEditor.${key}`,
        value,
      )
    } catch (error) {
      console.error('설정 저장 실패:', error)
    }
  }

  public static onDidChangeConfiguration(
    callback: (e: vscode.ConfigurationChangeEvent) => void,
  ): vscode.Disposable {
    return vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration('vibeEditor.notionStatus')) {
        const newValue = vscode.workspace
          .getConfiguration(this.configSection)
          .get<boolean>('notionStatus')
        if (newValue !== undefined) {
          this.currentConfig.notionStatus = newValue
          vscode.commands.executeCommand(
            'vscode.refreshView',
            'vibeEditorViewer',
          )
          callback(e)
        }
      }
    })
  }
}
