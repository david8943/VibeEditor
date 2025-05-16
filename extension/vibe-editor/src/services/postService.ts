import * as vscode from 'vscode'

import { getPostList, upgradePost, uploadPost } from '../apis/post'
import { getDraftData, setDraftData } from '../configuration/draftData'
import { DraftDataType } from '../types/configuration'
import { Post, PostDetail, UploadToNotionRequestPost } from '../types/post'
import { isLoading } from '../utils/isLoading'
import { refreshPostProvider } from '../views/tree/postTreeView'

export class PostService {
  private context: vscode.ExtensionContext
  constructor(context: vscode.ExtensionContext) {
    this.context = context
  }

  async resetPost(): Promise<void> {
    await this.context.globalState.update('posts', [])
    refreshPostProvider()
  }

  async createPost(postId: number): Promise<void> {
    const newPost: PostDetail = {
      postId: postId,
      postTitle: `임시 포스트 제목 ${postId}`,
      postContent: '임시 포스트 내용입니다.',
      templateId: 0,
      promptId: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      parentPostIdList: [],
    }
    const prev = this.context.globalState.get<PostDetail[]>('posts', [])
    prev.push(newPost)
    await this.context.globalState.update('posts', prev)
    refreshPostProvider()
    vscode.window.showInformationMessage(
      `포스트가 생성되었습니다: ${newPost.postTitle}`,
    )
  }

  async deletePost(postId: number): Promise<void> {
    const prev = await this.getLocalPosts()
    const updated = prev.filter((post) => post.postId !== postId)
    await this.context.globalState.update('posts', updated)
    refreshPostProvider()
    vscode.window.showInformationMessage(`포스트가 삭제되었습니다.`)
  }

  async getSelectedPostId(): Promise<number> {
    let selectedPostId = getDraftData<number>(DraftDataType.selectedPostId)
    if (selectedPostId) {
      return selectedPostId
    } else {
      const posts = await this.getPosts()
      if (posts.length > 0) {
        selectedPostId = posts[0].postId
        setDraftData(DraftDataType.selectedPostId, posts[0].postId)
        return posts[0].postId
      }
    }
    return 0
  }
  async getCurrentPost(): Promise<PostDetail | null> {
    const postId = await this.getSelectedPostId()
    return await this.getPost(postId)
  }

  async getPost(postId: number): Promise<PostDetail | null> {
    return this.getLocalPost(postId)
  }
  async getLocalPosts(): Promise<PostDetail[]> {
    return this.context.globalState.get<PostDetail[]>('posts') || []
  }
  async getPosts(): Promise<PostDetail[]> {
    const prev = await this.getLocalPosts()

    const result = await getPostList()
    let posts: PostDetail[] = []
    if (result.success) {
      posts = result.data
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
        .map((post) => {
          const localPost = prev.find((p) => p.postId === post.postId)
          if (localPost) {
            localPost.postTitle = post.postTitle
            localPost.createdAt = post.createdAt
            localPost.updatedAt = post.updatedAt
            localPost.uploadStatus = post.uploadStatus
            return localPost
          } else {
            return {
              postId: post.postId,
              postTitle: post.postTitle,
              postContent: '',
              templateId: 0,
              promptId: 0,
              createdAt: post.createdAt,
              updatedAt: post.updatedAt,
              parentPostIdList: [],
              uploadStatus: post.uploadStatus,
            }
          }
        })
      await this.context.globalState.update('posts', posts)
    }
    return posts
  }
  async getLocalPost(
    postId: number,
    prev?: PostDetail[],
  ): Promise<PostDetail | null> {
    const posts = prev || (await this.getLocalPosts())
    return postId ? posts.find((post) => post.postId === postId) || null : null
  }

  async updatePost(data: Post): Promise<void> {
    const prev = await this.getLocalPosts()
    const updated = prev.map((post) =>
      post.postId === data.postId ? { ...post, ...data } : post,
    )
    await this.context.globalState.update('posts', updated)
    const success = await upgradePost({
      postId: data.postId,
      updatePost: {
        postContent: data.postContent,
        postTitle: data.postTitle,
      },
    })
    if (success) {
      vscode.window.showInformationMessage('포스트가 업데이트되었습니다.')
    }
    refreshPostProvider()
  }
  async submitToNotion(data: UploadToNotionRequestPost): Promise<string> {
    // 실제로는 data.promptId를 백엔드에 보내서 postContent 등을 받아야 함
    const result = await uploadPost(data)
    let postUrl = 'http://www.naver.com'
    if (result.success) {
      postUrl = result.data.postUrl
    }
    const prev = await this.getLocalPosts()
    const filtered = prev.filter((post) => !isLoading(post.postId))
    await this.context.globalState.update('posts', filtered)
    refreshPostProvider()
    return postUrl
  }
  moveToNotion = (postUrl: string) => {
    vscode.window
      .showInformationMessage(
        '노션이 생성되었습니다. 해당 페이지로 이동하시겠습니까?',
        { modal: true },
        'Ok',
      )
      .then(async (selection) => {
        if (selection === 'Ok') {
          await vscode.env.openExternal(vscode.Uri.parse(postUrl))
        }
      })
  }
}
