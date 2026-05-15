const featuredSearchGroupOrder = [
  'property-sub-type',
  'neighborhood',
  'waterfront-features',
  'water-source',
  'lot-features',
  'view',
  'business-type',
  'architectural-style',
  'parking-features',
  'basement',
  'zoning',
] as const

export const groupOrderRank = (slug: string) => {
  const index = featuredSearchGroupOrder.findIndex((item) => item === slug)
  return index === -1 ? featuredSearchGroupOrder.length : index
}
