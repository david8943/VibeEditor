import * as vscode from 'vscode'

import { ICommand } from '../types/command'
import { PageType } from '../types/webview'
import { ViewLoader } from '../views/webview/ViewLoader'

export class ShowPostPageCommand implements ICommand {
  public static readonly commandName = 'vibeEditor.showPostPage'

  constructor(private readonly context: vscode.ExtensionContext) {}

  public get commandName(): string {
    return ShowPostPageCommand.commandName
  }
  public async execute(postId: number): Promise<void> {
    ViewLoader.showWebview(this.context, PageType.POST, postId)
  }
}
