import * as vscode from 'vscode'

import { ViewLoader } from '../views/webview/ViewLoader'

export class SettingService {
  private context: vscode.ExtensionContext
  private page: string
  constructor(context: vscode.ExtensionContext, page: string) {
    this.context = context
    this.page = page
  }

  async showSettingPage(): Promise<void> {
    ViewLoader.showWebview(this.context, this.page)
  }
}
