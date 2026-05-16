import * as Atom from 'effect/unstable/reactivity/Atom'

import {
  defaultAgentSearch,
  defaultDirectorySearch,
  defaultListingSearch,
  defaultOpenHouseSearch,
} from './search'

import type { ExpertDestinationsData } from './data'

export type DestinationExpertsState =
  | {
      readonly status: 'idle' | 'loading'
      readonly data: ExpertDestinationsData | null
      readonly errorMessage?: undefined
    }
  | {
      readonly status: 'ready'
      readonly data: ExpertDestinationsData
      readonly errorMessage?: undefined
    }
  | {
      readonly status: 'error'
      readonly data: ExpertDestinationsData | null
      readonly errorMessage: string
    }

export const listingFiltersAtom = Atom.make(defaultListingSearch).pipe(
  Atom.keepAlive,
)

export const officeFiltersAtom = Atom.make(defaultDirectorySearch).pipe(
  Atom.keepAlive,
)

export const agentFiltersAtom = Atom.make(defaultAgentSearch).pipe(
  Atom.keepAlive,
)

export const openHouseFiltersAtom = Atom.make(defaultOpenHouseSearch).pipe(
  Atom.keepAlive,
)

export const destinationExpertsAtom = Atom.make<DestinationExpertsState>({
  status: 'idle',
  data: null,
}).pipe(Atom.keepAlive)
