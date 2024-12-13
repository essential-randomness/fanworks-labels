import { AppContext } from '../config'
import {
  QueryParams,
  OutputSchema as AlgoOutput,
} from '../lexicon/types/app/bsky/feed/getFeedSkeleton'
import * as allLabels from './all-labels'
import * as byLabel from './by-label'

type AlgoHandler = (ctx: AppContext, params: QueryParams) => Promise<AlgoOutput>

const algos: Record<string, AlgoHandler> = {
  [allLabels.shortname]: allLabels.handler,
  fanfic: byLabel.handler,
  shitpost: byLabel.handler,
  art: byLabel.handler,
}

export default algos
