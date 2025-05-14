import * as vscode from 'vscode'

interface ConfigSchema {
  defaultPostType: 'TECH_CONCEPT' | 'TROUBLE_SHOOTING'
  defaultPromptOptionIds: number[]
  defaultNotionDatabaseId: number
}

// 기본값 정의
const defaultConfig: ConfigSchema = {
  defaultPostType: 'TECH_CONCEPT',
  defaultPromptOptionIds: [],
  defaultNotionDatabaseId: 0,
}

export class Configuration {
  private static readonly configSection = 'vibeEditor'
  private static currentConfig: ConfigSchema = { ...defaultConfig }

  public static get<K extends keyof ConfigSchema>(key: K): ConfigSchema[K] {
    const config = vscode.workspace.getConfiguration(this.configSection)
    const value = config.get<ConfigSchema[K]>(key)
    return value ?? this.currentConfig[key]
  }

  public static getAll(): ConfigSchema {
    const config = vscode.workspace.getConfiguration(this.configSection)
    return {
      defaultPostType:
        config.get('defaultPostType') ?? defaultConfig.defaultPostType,
      defaultPromptOptionIds:
        config.get('defaultPromptOptionIds') ??
        defaultConfig.defaultPromptOptionIds,
      defaultNotionDatabaseId:
        config.get('defaultNotionDatabaseId') ??
        defaultConfig.defaultNotionDatabaseId,
    }
  }

  public static async set<K extends keyof ConfigSchema>(
    key: K,
    value: ConfigSchema[K],
  ): Promise<void> {
    console.log('[CONFIG SET]', key, value)
    console.log('[CONFIG TYPE]', typeof value, Array.isArray(value))

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
      const keys: (keyof ConfigSchema)[] = []
      keys.forEach((key) => {
        const fullKey = `vibeEditor.${key}`
        if (e.affectsConfiguration(fullKey)) {
          const newValue = vscode.workspace
            .getConfiguration(this.configSection)
            .get(key)
          vscode.commands.executeCommand('setContext', fullKey, newValue)
        }
      })
    })
  }
}
