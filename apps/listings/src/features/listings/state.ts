import * as Atom from 'effect/unstable/reactivity/Atom'

import {
  defaultAgentSearch,
  defaultDirectorySearch,
  defaultListingSearch,
  defaultOpenHouseSearch,
} from './search'

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
