export interface Post {
  postId: number
  postName: string
  postContent: string
  createdAt: string
  updatedAt: string
}

export type CreatePost = Pick<Post, 'postName' | 'postContent'>
