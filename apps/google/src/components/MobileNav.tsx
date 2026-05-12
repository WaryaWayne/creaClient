import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from "@workspace/ui/components/sheet"
import {
  industriesOverviewHref,
  orderIndustriesForNav,
  primaryCtaHref,
  primaryNavLinks,
  serviceLinks,
  servicesOverviewHref,
} from "@/lib/site-nav"
import { serviceTypes } from "@/data/service-types"
import { ArrowRight, Logs, Menu } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { CTAButton } from "./CTAButton"
import { routes } from "@/lib/routes"
import Logo from "@/assets/logo.svg?react"

export function MobileNav() {
  const navIndustries = orderIndustriesForNav(serviceTypes)

  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button
            variant={"ghost"}
            size={"icon-lg"}
            aria-label="Open Main Menu"
          />
        }
      >
        <Menu className="size-8 text-primary" />
      </SheetTrigger>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="overflow-y-auto border-border bg-background"
      >
        <div className="flex flex-col gap-1 px-4 py-4 text-sm">
          <div className="flex items-center justify-between">
            <a
              href={import.meta.env.BASE_URL}
              className="flex items-center py-2.5"
              aria-label="2To6X home"
            >
              <Logo className="h-8 w-auto transition-transform duration-200 hover:scale-105" />
            </a>
            <SheetClose className={"cursor-pointer"}>
              <Logs className="size-8 text-primary transition-transform duration-300 hover:rotate-90" />
            </SheetClose>
          </div>

          <div className="border-t border-border pt-2">
            {primaryNavLinks.map((link) => (
              <SheetClose
                key={link.href}
                nativeButton={false}
                render={
                  <a
                    href={link.href}
                    className="block py-2.5 font-medium text-foreground hover:text-primary"
                  />
                }
              >
                {link.label}
              </SheetClose>
            ))}
          </div>

          <div className="border-t border-border py-2">
            <p className="py-2 text-xs tracking-wider text-foreground uppercase">
              Services
            </p>
            <div className="space-y-2">
              {serviceLinks.map((service) => (
                <SheetClose
                  key={service.href}
                  nativeButton={false}
                  render={
                    <a
                      href={service.href}
                      className="block border border-border px-3 py-3 hover:border-primary/30 hover:bg-primary/5 hover:backdrop-blur-sm"
                    />
                  }
                >
                  <p className="font-semibold text-foreground">
                    {service.label}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {service.description}
                  </p>
                  <p className="mt-2 text-xs font-semibold text-primary">
                    {service.price}
                  </p>
                </SheetClose>
              ))}
            </div>
            <SheetClose
              nativeButton={false}
              render={
                <a
                  href={servicesOverviewHref}
                  className="mt-2 inline-flex items-center gap-1 py-2 text-xs font-semibold text-primary hover:text-primary/80"
                />
              }
            >
              Compare all services <ArrowRight className="h-3.5 w-3.5" />
            </SheetClose>
          </div>

          <div className="border-t border-border py-2">
            <p className="py-2 text-xs tracking-wider text-foreground uppercase">
              Industries
            </p>
            <p className="mb-2 text-xs text-muted-foreground">
              See before and after ad examples for your specific trade
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {navIndustries.map((s) => (
                <SheetClose
                  key={s.slug}
                  nativeButton={false}
                  render={
                    <a
                      href={`${routes.google.industry.Index}/${s.slug}`}
                      className="flex min-h-[3.5rem] items-center gap-2 border border-border px-3 py-2 text-sm text-foreground hover:border-primary/30 hover:bg-primary/5 hover:text-primary hover:backdrop-blur-sm"
                    />
                  }
                >
                  <span className="leading-snug font-medium">{s.name}</span>
                </SheetClose>
              ))}
            </div>
            <SheetClose
              nativeButton={false}
              render={
                <a
                  href={industriesOverviewHref}
                  className="mt-2 inline-flex items-center gap-1 py-2 text-xs font-semibold text-primary hover:text-primary/80"
                />
              }
            >
              Compare all industries <ArrowRight className="h-3.5 w-3.5" />
            </SheetClose>
          </div>

          <CTAButton variant={"default"} target="_self" href={primaryCtaHref}>
            Get Started
          </CTAButton>
        </div>
      </SheetContent>
    </Sheet>
  )
}
