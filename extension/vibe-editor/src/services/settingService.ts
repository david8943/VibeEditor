import * as vscode from 'vscode'

import { SettingViewLoader } from '../views/webview/SettingViewLoader'

export class SettingService {
  private context: vscode.ExtensionContext
  private page: string
  constructor(context: vscode.ExtensionContext, page: string) {
    this.context = context
    this.page = page
  }

  async showSettingPage(): Promise<void> {
    SettingViewLoader.showWebview(this.context, this.page)
  }
}
