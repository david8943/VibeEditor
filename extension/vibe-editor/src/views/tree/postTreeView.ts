import * as path from 'path'
import * as vscode from 'vscode'

import { PostDetail, PostSummary } from '../../types/post'
import { isLoading } from '../../utils/isLoading'

export class PostProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<
    vscode.TreeItem | undefined | void
  > = new vscode.EventEmitter()
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event

  constructor(private context: vscode.ExtensionContext) {}

  refresh(): void {
    this._onDidChangeTreeData.fire()
  }

  getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
    return element
  }

  getChildren(): vscode.ProviderResult<vscode.TreeItem[]> {
    const posts = this.context.globalState.get<PostDetail[]>('posts', [])
    const summaries: PostSummary[] = posts.map((post) => ({
      postId: post.postId,
      postTitle: post.postTitle,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      isLoading: isLoading(post.postId),
      uploadStatus: post?.uploadStatus ?? undefined,
      postUrl: post?.postUrl ?? '',
    }))
    return Promise.resolve(
      summaries
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
        .map((summary) => new PostItem(summary)),
    )
  }
}

export class PostItem extends vscode.TreeItem {
  constructor(public readonly post: PostSummary) {
    super(post.postTitle, vscode.TreeItemCollapsibleState.None)

    console.log(
      `[PostItem] postId=${post.postId}, title=${post.postTitle}, isLoading=${post.isLoading}, uploadStatus=${post.uploadStatus}`,
    )

    this.tooltip = `${post.postTitle}`
    this.command = {
      command: 'vibeEditor.showPostPage',
      title: 'View Post',
      arguments: [post.postId],
    }
    this.contextValue = post.postUrl
      ? 'vibeEditorPostURLList'
      : 'vibeEditorPostList'

    this.iconPath = this.getIconForStatus(post)
  }
  private extensionPath(subPath: string): string {
    return path.join(
      vscode.extensions.getExtension('VibeEditor.vibe-editor')!.extensionPath,
      subPath,
    )
  }
  private getIconBasePath(): string {
    return this.extensionPath('media/icons')
  }
  private getIconForStatus(post: PostSummary): {
    light: vscode.Uri
    dark: vscode.Uri
  } {
    const iconBasePath = this.getIconBasePath()
    let icon = 'book.svg'
    if (post.isLoading) {
      icon = 'sync.svg'
    } else {
      switch (post.uploadStatus) {
        case 'SUCCESS':
          icon = 'check.svg'
          break
        case 'FAIL':
          icon = 'error.svg'
          break
        case 'PENDING':
          icon = 'history.svg'
          break
        default:
          icon = 'book.svg'
      }
    }
    return {
      light: vscode.Uri.file(path.join(iconBasePath, 'light', icon)),
      dark: vscode.Uri.file(path.join(iconBasePath, 'dark', icon)),
    }
  }
}

let postProviderInstance: PostProvider | undefined

export function refreshPostProvider() {
  postProviderInstance?.refresh()
}
export function setPostProvider(provider: PostProvider) {
  postProviderInstance = provider
}

export function getPostProvider(): PostProvider | undefined {
  return postProviderInstance
}
