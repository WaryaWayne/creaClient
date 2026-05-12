import { offerCatalog, offers, type OfferKey } from "@/data/offers"

const currency = "CAD"

export type ZarazOfferKey = OfferKey
export type ZarazContentKey = OfferKey | "pricing"
export type ZarazEventName =
  | "Product Viewed"
  | "Product List Viewed"
  | "Checkout Started"
  | "Order Completed"

type ZarazProduct = {
  product_id: string
  sku: string
  category: string
  name: string
  brand: string
  price: number
  currency: typeof currency
  quantity?: number
  value?: number
  position?: number
}

export type ZarazEventProperties = {
  product_id?: string
  sku?: string
  category?: string
  name?: string
  brand?: string
  price?: number
  quantity?: number
  currency?: typeof currency
  value?: number
  products?: ZarazProduct[]
  checkout_id?: string
  order_id?: string
  total?: number
  revenue?: number
}

const productCategory = "Google Ads service"
const productBrand = "2to6x"

const isBrowser = () => typeof window !== "undefined"

const isTrackingDisabled = () => {
  if (!isBrowser()) return true

  try {
    return localStorage.getItem("ad_tracking_opt_out") === "true"
  } catch {
    // TODO: track this error? 05May26
    return true
  }
}

const getOfferProduct = (
  offerKey: ZarazOfferKey,
  position?: number
): ZarazProduct => {
  const offer = offerCatalog[offerKey]
  const price = Number(offer.productSchema.price)

  return {
    product_id: offer.productSchema.productId,
    sku: offer.key,
    category: productCategory,
    name: offer.label,
    brand: productBrand,
    price,
    currency,
    value: price,
    ...(position ? { position } : {}),
  }
}

const getViewContentProperties = (
  contentKey: ZarazContentKey
): { eventName: ZarazEventName; properties: ZarazEventProperties } =>
  contentKey === "pricing"
    ? {
        eventName: "Product List Viewed",
        properties: {
          products: offers.map((offer, index) =>
            getOfferProduct(offer.key, index + 1)
          ),
        },
      }
    : {
        eventName: "Product Viewed",
        properties: getOfferProduct(contentKey),
      }

export const getCheckoutProperties = (offerKey: ZarazOfferKey) => {
  const product = getOfferProduct(offerKey)

  return {
    checkout_id: offerKey,
    currency,
    products: [{ ...product, quantity: 1 }],
    total: product.price,
    revenue: product.price,
    value: product.price,
  } satisfies ZarazEventProperties
}

const getOrderProperties = (
  offerKey: ZarazOfferKey,
  sessionId: string
): ZarazEventProperties => {
  const product = getOfferProduct(offerKey)

  return {
    checkout_id: sessionId,
    order_id: sessionId,
    currency,
    products: [{ ...product, quantity: 1 }],
    total: product.price,
    revenue: product.price,
    value: product.price,
  }
}

const trackEcommerceEvent = (
  eventName: ZarazEventName,
  properties: ZarazEventProperties
) => {
  if (isTrackingDisabled()) return

  void window.zaraz?.ecommerce(eventName, properties)
}

export const trackViewContent = (contentKey: ZarazContentKey) => {
  const { eventName, properties } = getViewContentProperties(contentKey)

  trackEcommerceEvent(eventName, properties)
}

export const trackInitiateCheckout = (offerKey: ZarazOfferKey) => {
  trackEcommerceEvent("Checkout Started", getCheckoutProperties(offerKey))
}

export const trackPurchase = (offerKey: ZarazOfferKey, sessionId: string) => {
  trackEcommerceEvent(
    "Order Completed",
    getOrderProperties(offerKey, sessionId)
  )
}

export const trackSubscribe = (offerKey: ZarazOfferKey, sessionId: string) => {
  trackEcommerceEvent(
    "Order Completed",
    getOrderProperties(offerKey, sessionId)
  )
}
