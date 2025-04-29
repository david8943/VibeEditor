import * as vscode from 'vscode'

import { PageType } from '../types/webview'
import { SettingViewLoader } from '../views/webview/SettingViewLoader'

export class SettingService {
  private context: vscode.ExtensionContext
  private page: PageType
  constructor(context: vscode.ExtensionContext, page: PageType) {
    this.context = context
    this.page = page
  }

  async showSettingPage(): Promise<void> {
    SettingViewLoader.showWebview(this.context, this.page)
  }
}
