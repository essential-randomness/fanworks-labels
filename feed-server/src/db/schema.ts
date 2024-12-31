export type DatabaseSchema = {
  post: Post
  sub_state: SubState
  label: Label
}

export type Post = {
  uri: string
  cid: string
  indexedAt: string
}

export type Label = {
  post_uri: string
  label: string
}

export type SubState = {
  service: string
  cursor: number
}
