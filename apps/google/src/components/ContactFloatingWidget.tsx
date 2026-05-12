import { routes } from "@/lib/routes"
import { Avatar, AvatarImage } from "@workspace/ui/components/avatar"
import { Button } from "@workspace/ui/components/button"
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverTitle,
  PopoverTrigger,
} from "@workspace/ui/components/popover"
import {
  ArrowUpFromDot,
  Calendar,
  Mail,
  MessageCircle,
  Phone,
} from "lucide-react"

const founderHeadshotSrc = `${routes.google.home}/2To6X-Founder-website-headshot.jpg`

export const ContactFloatingWidget = () => {
  return (
    <div className="fixed right-4 bottom-28 z-50 flex flex-col items-center gap-3 lg:right-6 lg:bottom-6">
      <div>
        <Button
          size={"icon-sm"}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Scroll to top"
        >
          <ArrowUpFromDot />
        </Button>
      </div>

      <Popover>
        <PopoverTrigger
          render={
            <Button
              className={
                "h-14 w-14 cursor-pointer rounded-full border-2 border-primary p-0 shadow-2xl"
              }
              variant="outline"
            />
          }
        >
          <Avatar
            size="lg"
            aria-label="2To6X contact options"
            className="size-12 items-center justify-center bg-background text-foreground after:hidden"
          >
            <AvatarImage src={founderHeadshotSrc} />
          </Avatar>
        </PopoverTrigger>
        <PopoverContent side="top" align="end">
          <div className="flex items-center gap-3 border-b border-border p-4">
            <Avatar
              size="lg"
              aria-hidden="true"
              className="items-center justify-center bg-background text-foreground after:hidden"
            >
              <AvatarImage src={founderHeadshotSrc} />
            </Avatar>
            <div className="min-w-0">
              <PopoverTitle className="text-sm leading-snug font-semibold text-primary">
                Abdullahi Mohamed. Founder, 2To6X
              </PopoverTitle>
              <PopoverDescription className="text-xs leading-snug">
                I've audited hundreds of Google Ads accounts for local
                businesses.
                {/*Websites, ads, and custom software since 2021*/}
              </PopoverDescription>
            </div>
          </div>
          <div className="flex flex-col p-2">
            <a
              href={routes.google.services.AdsAudit + "#pricing"}
              target="_blank"
              className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors hover:bg-secondary"
            >
              <Calendar className="h-4 w-4 shrink-0 text-primary" />
              Start a Google Ads Audit
            </a>
            <a
              href={routes.google.contact + "#contact-form-view"}
              target="_blank"
              className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors hover:bg-secondary"
            >
              <MessageCircle className="h-4 w-4 shrink-0 text-primary" />
              Ask Before Ordering
            </a>
            <a
              href={`tel:${import.meta.env.PUBLIC_COMPANY_PHONE_NUMBER}`}
              className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors hover:bg-secondary"
            >
              <Phone className="h-4 w-4 shrink-0 text-primary" />
              Call Me
            </a>
            <a
              href={`mailto:${import.meta.env.PUBLIC_CONTACT_EMAIL}`}
              className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors hover:bg-secondary"
            >
              <Mail className="h-4 w-4 shrink-0 text-primary" />
              Email Me
            </a>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
