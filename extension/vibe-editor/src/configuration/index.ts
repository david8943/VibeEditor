import * as vscode from 'vscode'

// 설정 키와 값 타입 정의
interface ConfigSchema {
  loginStatus: boolean
  notionToken: string
}

// 기본값 정의
const defaultConfig: ConfigSchema = {
  loginStatus: false,
  notionToken: '',
}

export class Configuration {
  private static readonly configSection = 'vibe-editor'

  // 설정 값을 가져오는 메서드
  public static get<K extends keyof ConfigSchema>(key: K): ConfigSchema[K] {
    const value = vscode.workspace
      .getConfiguration(this.configSection)
      .get<ConfigSchema[K]>(key)
    return value ?? defaultConfig[key]
  }

  // 설정 값을 저장하는 메서드
  public static set<K extends keyof ConfigSchema>(
    key: K,
    value: ConfigSchema[K],
  ): Thenable<void> {
    return vscode.workspace
      .getConfiguration(this.configSection)
      .update(key, value, vscode.ConfigurationTarget.Global)
  }

  // 설정 변경 이벤트 리스너
  public static onDidChangeConfiguration(
    callback: (e: vscode.ConfigurationChangeEvent) => void,
  ): vscode.Disposable {
    return vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(this.configSection)) {
        callback(e)
      }
    })
  }

  // 모든 설정 가져오기
  public static getAll(): ConfigSchema {
    const config = vscode.workspace.getConfiguration(this.configSection)
    return {
      loginStatus: config.get('loginStatus') ?? defaultConfig.loginStatus,
      notionToken: config.get('notionToken') ?? defaultConfig.notionToken,
    }
  }
}
