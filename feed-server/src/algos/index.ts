import { AppContext } from '../config'
import {
  QueryParams,
  OutputSchema as AlgoOutput,
} from '../lexicon/types/app/bsky/feed/getFeedSkeleton'
import * as allLabels from './all-labels'
import * as byLabel from './by-label'
import labelsConfig from "../../../labels";

type AlgoHandler = (ctx: AppContext, params: QueryParams) => Promise<AlgoOutput>

const labelsHandlers = {};
for (let label of labelsConfig.labels) {
  labelsHandlers[label.value] = byLabel.handler;
}

const algos: Record<string, AlgoHandler> = {
  [allLabels.shortname]: allLabels.handler,
  ...labelsHandlers
}

export default algos
