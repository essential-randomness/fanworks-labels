import { QueryParams } from '../lexicon/types/app/bsky/feed/getFeedSkeleton'
import { AppContext } from '../config'
import Database from "better-sqlite3";
const db = new Database("../labels-server/labels.db");

export const handler = async (ctx: AppContext, params: QueryParams) => {
  const requestedFeed = params.feed
  const label = params.feed.substring(params.feed.lastIndexOf('/') + 1)
  // console.log('feed requested:', requestedFeed)
  // console.log('label requested:', label)

  let builder = ctx.db
    .selectFrom('post')
    .selectAll()
    .orderBy('indexedAt', 'desc')
    .orderBy('cid', 'desc');

  if (params.cursor) {
    const timeStr = new Date(parseInt(params.cursor, 10)).toISOString()
    builder = builder.where('post.indexedAt', '<', timeStr)
  }
  const res = await builder.execute()

  const labelsQuery = db.prepare(`select labels.uri, labels.cts, neg from (select uri, count(*), max(cts) as m_cts from labels where val = ? group by uri order by cts desc) as max_op left join labels on max_op.m_cts = labels.cts and max_op.uri = labels.uri;`);
  const labelsData = labelsQuery.all(label);

  const activeLabelsUris = labelsData.filter((v: any) => !v.neg).map((v:any) => v.uri);
  const postsWithLabel = res.filter(row => activeLabelsUris.find(uri => uri == row.uri));
  const postsInFeed = postsWithLabel.slice(0, params.limit);

  const feed = postsInFeed.map((row) => ({
    post: row.uri,
  }))

  let cursor: string | undefined
  const last = postsInFeed.at(-1)
  if (last) {
    cursor = new Date(last.indexedAt).getTime().toString(10)
  }

  return {
    cursor,
    feed,
  }
}
