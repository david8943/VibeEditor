import * as vscode from 'vscode'

import { PostItem, PostService } from '../services/postService'
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

export class DeletePostCommand implements ICommand {
  public static readonly commandName = 'vibeEditor.deletePost'

  private postService: PostService

  constructor(private readonly context: vscode.ExtensionContext) {
    this.postService = new PostService(context)
  }

  public get commandName(): string {
    return DeletePostCommand.commandName
  }

  public async execute(item: PostItem): Promise<void> {
    await this.postService.deletePost(item.post.postId)
  }
}
