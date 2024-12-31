import express from 'express'
import { AppContext } from '../config'

const getLabelsDifference = async (
  ctx: AppContext,
  values: { labels: string[]; uri: string },
) => {
  const currentLabels = await ctx.db
    .selectFrom('label')
    .selectAll()
    .where('label.post_uri', '=', values.uri)
    .execute()

  const currentLabelsSet = new Set(currentLabels.map((value) => value.label))

  const labelsToAdd = values.labels.filter(
    (label) => !currentLabelsSet.has(label),
  )
  const labelsToRemove = Array.from(
    currentLabelsSet.difference(new Set(values.labels)),
  )

  return {
    labelsToAdd,
    labelsToRemove,
    isNowUnlabeled:
      labelsToRemove.length == currentLabelsSet.size && labelsToAdd.length == 0,
  }
}

export const addInternalRoutes = (
  app: express.Application,
  ctx: AppContext,
) => {
  app.use(express.json())
  app.put('/labels/', async (req, res) => {
    if (req.ip !== '127.0.0.1') {
      return res.sendStatus(403)
    }
    const { uri, labels } = req.body

    if (!uri) {
      return res.sendStatus(400)
    }

    const { labelsToAdd, labelsToRemove, isNowUnlabeled } =
      await getLabelsDifference(ctx, {
        uri,
        labels,
      })

    // Add and remove labels to get our database consistent with the current status
    // of the labeler
    if (labelsToRemove.length > 0) {
      await ctx.db
        .deleteFrom('label')
        .where('label.post_uri', '=', uri)
        .where('label.label', 'in', labelsToRemove)
        .execute()
    }

    if (labelsToAdd.length > 0) {
      await ctx.db
        .insertInto('label')
        .values(
          labelsToAdd.map((label) => ({
            post_uri: uri,
            label,
          })),
        )
        .execute()
    }

    if (isNowUnlabeled) {
      await ctx.db.deleteFrom('post').where('post.uri', '=', uri).execute()
    }

    // If the post doesn't have labels anymore, also remove it from the posts table and
    // stop tracking it altogether

    res.sendStatus(200)
  })
}

// curl -H "Accept: application/json" -H "Content-type: application/json" -X PUT -d '{"id":100, "test": "a test"}' http://127.0.0.1:14833/labels/
