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

  private getIconForStatus(post: PostSummary): vscode.ThemeIcon {
    if (post.isLoading) return new vscode.ThemeIcon('sync~spin')

    switch (post.uploadStatus) {
      case 'SUCCESS':
        return new vscode.ThemeIcon('check')
      case 'FAIL':
        return new vscode.ThemeIcon('error')
      case 'PENDING':
        return new vscode.ThemeIcon('debug-breakpoint-function')
      default:
        return new vscode.ThemeIcon('book')
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
