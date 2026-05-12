import { Button } from "@workspace/ui/components/button"
import type { AnchorHTMLAttributes } from "react"
import { routes } from "@/lib/routes"

export const CTAButton = ({
  variant = "default",
  href = routes.google.home + "#",
  target = "_blank",
  children,
}: {
  variant:
    | "default"
    | "outline"
    | "secondary"
    | "ghost"
    | "destructive"
    | "link"
    | null
    | undefined
  href: AnchorHTMLAttributes<HTMLAnchorElement>["href"]
  target: AnchorHTMLAttributes<HTMLAnchorElement>["target"]
  children: React.ReactNode
}) => {
  return (
    <Button
      variant={variant}
      size="lg"
      nativeButton={false}
      render={<a href={href} target={target} />}
      className="cursor-pointer font-semibold tracking-widest uppercase"
    >
      {children}
    </Button>
  )
}
