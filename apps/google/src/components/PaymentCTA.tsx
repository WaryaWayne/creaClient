import { Button } from "@workspace/ui/components/button"
import type { AnchorHTMLAttributes } from "react"
import { routes } from "@/lib/routes"
import { getCheckoutProperties, type ZarazOfferKey } from "@/lib/zaraz"
import { AuditSampleDialog } from "./AuditSampleDialog"

type ButtonVariant =
  | "default"
  | "outline"
  | "secondary"
  | "ghost"
  | "destructive"
  | "link"
  | null
  | undefined

export const PaymentCTA = ({
  variant = "default",
  href = routes.google.home + "#",
  target = "_blank",
  offerKey,
  turnstileSiteKey,
  children,
  className,
}: {
  variant: ButtonVariant
  href: AnchorHTMLAttributes<HTMLAnchorElement>["href"]
  target: AnchorHTMLAttributes<HTMLAnchorElement>["target"]
  offerKey: ZarazOfferKey
  turnstileSiteKey?: string
  children: React.ReactNode
  className?: string
}) => {
  const checkoutProperties = JSON.stringify(getCheckoutProperties(offerKey))

  return (
    <>
      <Button
        variant={variant}
        size="lg"
        nativeButton={false}
        render={
          <a
            href={href}
            target={target}
            rel={target === "_blank" ? "noopener noreferrer" : undefined}
            data-zaraz-checkout-properties={checkoutProperties}
          />
        }
        className={`cursor-pointer font-semibold tracking-widest uppercase ${className ?? ""}`.trim()}
      >
        {children}
      </Button>
      <AuditSampleDialog
        offerKey={offerKey}
        source={`payment-cta-${offerKey}`}
        turnstileSiteKey={turnstileSiteKey}
      />
    </>
  )
}
