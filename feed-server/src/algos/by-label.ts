import { QueryParams } from '../lexicon/types/app/bsky/feed/getFeedSkeleton'
import { AppContext } from '../config'

export const handler = async (ctx: AppContext, params: QueryParams) => {
  const requestedFeed = params.feed
  const label = params.feed.substring(params.feed.lastIndexOf('/') + 1)
  // console.log('feed requested:', requestedFeed)
  // console.log('label requested:', label)

  let builder = ctx.db
    .selectFrom('post')
    .selectAll()
    .innerJoin('label', 'post.uri', 'label.post_uri')
    .where('label.post_uri', '=', label)
    .orderBy('indexedAt', 'desc')
    .orderBy('cid', 'desc')
    .limit(params.limit ?? 10)

  if (params.cursor) {
    const timeStr = new Date(parseInt(params.cursor, 10)).toISOString()
    builder = builder.where('post.indexedAt', '<', timeStr)
  }
  const res = await builder.execute()

  const feed = res.map((row) => ({
    post: row.uri,
  }))

  let cursor: string | undefined
  const last = res.at(-1)
  if (last) {
    cursor = new Date(last.indexedAt).getTime().toString(10)
  }

  return {
    cursor,
    feed,
  }
}
