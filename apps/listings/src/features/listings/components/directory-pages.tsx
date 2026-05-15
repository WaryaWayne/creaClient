import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { useAtom } from '@effect/atom-react'
import { Link } from '@tanstack/react-router'
import {
  ArrowRight,
  Building2,
  CalendarDays,
  Clock,
  ExternalLink,
  Home,
  MapPin,
  Phone,
  UserRound,
  Users,
} from 'lucide-react'

import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import { Label } from '@workspace/ui/components/label'
import { cn } from '#/lib/utils'

import type {
  AgentDetail,
  DirectoryData,
  OfficeCard,
  OfficeDetail,
  OpenHouseCard,
  PersonCard,
  SocialMediaCard,
} from '../data'
import { EXIT_EXCEL_OFFICE_NAME } from '../data'
import { compactOpenHouseSearch, defaultListingSearch } from '../search'
import type { AgentSearch, DirectorySearch, OpenHouseSearch } from '../search'
import { openHouseFiltersAtom } from '../state'
import { ContactAgentButton } from './contact'
import { ListingsGrid } from './listing-card'
import { MediaGroupsView, mediaGroups, mediaKey } from './media'
import { DetailItem, InfoSection, Pagination } from './shared'
import {
  formatDate,
  looseSearchTokens,
  looseValueMatches,
  number,
  openHouseTimeLabel,
  personName,
} from './utils'

export function OfficesPage({
  data,
}: {
  readonly data: DirectoryData<OfficeDetail>
  readonly onSearchChange?: (search: DirectorySearch) => void
}) {
  const office = data.items.at(0) ?? null

  if (office === null) {
    return (
      <main className="page-wrap py-14">
        <div className="rounded-lg border border-[var(--line)] bg-white/80 p-8">
          <h1 className="text-2xl font-extrabold">Office not found</h1>
          <p className="mt-2 text-sm text-[var(--sea-ink-soft)]">
            EXIT EXCEL REALTY was not found in the local office table.
          </p>
          <Button
            nativeButton={false}
            render={<Link to="/listings" search={defaultListingSearch} />}
            className="mt-5"
          >
            Back to listings
          </Button>
        </div>
      </main>
    )
  }

  return <OfficeDetailView office={office} />
}

function OfficeMetric({
  icon: Icon,
  label,
  value,
}: {
  readonly icon: typeof Building2
  readonly label: string
  readonly value: string
}) {
  return (
    <div className="rounded-md border border-[var(--line)] bg-white/72 p-3">
      <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--sea-ink-soft)]">
        <Icon className="size-3.5" />
        {label}
      </p>
      <p className="mt-1 text-2xl font-extrabold text-[var(--sea-ink)]">
        {value}
      </p>
    </div>
  )
}

export function AgentsPage({
  data,
  onSearchChange,
}: {
  readonly data: DirectoryData<PersonCard>
  readonly onSearchChange: (search: AgentSearch) => void
}) {
  const routeSearch = data.search as AgentSearch

  return (
    <DirectoryPageShell
      eyebrow="Members"
      title={`${EXIT_EXCEL_OFFICE_NAME} Agents`}
      description={`Showing only EXIT EXCEL REALTY members attached to active listings.`}
    >
      {data.items.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data.items.map((agent) => (
            <DirectoryCard key={agent.memberKey}>
              <AgentRow agent={agent} prominent />
            </DirectoryCard>
          ))}
        </div>
      ) : (
        <DirectoryEmpty message="No EXIT EXCEL REALTY members have active listings in the local property table." />
      )}
      <Pagination
        page={routeSearch.page}
        hasNextPage={data.hasNextPage}
        onPage={(page) => onSearchChange({ ...routeSearch, page })}
      />
    </DirectoryPageShell>
  )
}

export function AgentDetailPage({
  agent,
}: {
  readonly agent: AgentDetail | null
}) {
  if (agent === null) {
    return (
      <main className="page-wrap py-14">
        <div className="rounded-lg border border-[var(--line)] bg-white/80 p-8">
          <h1 className="text-2xl font-extrabold">Agent not found</h1>
          <Button
            nativeButton={false}
            render={<Link to="/agents" search={{ officeKey: '', page: 1 }} />}
            className="mt-5"
          >
            Back to agents
          </Button>
        </div>
      </main>
    )
  }

  return (
    <main className="page-wrap grid gap-6 py-8">
      <section className="grid gap-6 rounded-lg border border-[var(--line)] bg-white/78 p-5 lg:grid-cols-[auto_1fr_auto] lg:items-start">
        <div className="flex size-28 items-center justify-center overflow-hidden rounded-lg bg-[var(--sand)] text-[var(--palm)]">
          {agent.imageUrl ? (
            <img
              src={agent.imageUrl}
              alt={personName(agent)}
              className="h-full w-full object-cover"
            />
          ) : (
            <UserRound className="size-12" />
          )}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--kicker)]">
            Agent
          </p>
          <h1 className="display-title mt-2 text-4xl font-bold text-[var(--sea-ink)]">
            {personName(agent)}
          </h1>
          <p className="mt-2 text-sm leading-6 text-[var(--sea-ink-soft)]">
            {[agent.jobTitle, agent.type, agent.status]
              .filter(Boolean)
              .join(' · ')}
          </p>
          <p className="mt-1 text-sm leading-6 text-[var(--sea-ink-soft)]">
            {[agent.office?.officeName, agent.city, agent.province]
              .filter(Boolean)
              .join(' · ')}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 lg:justify-end">
          <ContactAgentButton agent={agent} />
          <Button
            nativeButton={false}
            render={
              <Link
                to="/offices"
                search={{ city: '', province: '', page: 1 }}
              />
            }
            variant="outline"
          >
            <Building2 />
            Office
          </Button>
        </div>
      </section>
      <section className="grid gap-6 lg:grid-cols-[1fr_340px] lg:items-start">
        <div className="grid gap-6">
          <InfoSection title="Agent details">
            <div className="grid gap-3 sm:grid-cols-2">
              <DetailItem label="Agent key" value={agent.memberKey} />
              <DetailItem label="MLS member ID" value={agent.memberMlsId} />
              <DetailItem
                label="National association ID"
                value={agent.nationalAssociationId}
              />
              <DetailItem
                label="Office national ID"
                value={agent.officeNationalAssociationId}
              />
              <DetailItem label="AOR" value={agent.memberAor} />
              <DetailItem label="AOR key" value={agent.memberAorKey} />
              <DetailItem label="Office key" value={agent.officeKey} />
              <DetailItem label="Nickname" value={agent.nickname} />
            </div>
          </InfoSection>
          <InfoSection title="Contact and location">
            <div className="grid gap-3 sm:grid-cols-2">
              <DetailItem label="Phone" value={agent.phone} />
              <DetailItem label="Phone extension" value={agent.phoneExt} />
              <DetailItem label="Toll-free phone" value={agent.tollFreePhone} />
              <DetailItem label="Fax" value={agent.fax} />
              <DetailItem label="Address" value={agent.address} />
              <DetailItem label="City" value={agent.city} />
              <DetailItem label="Province" value={agent.province} />
              <DetailItem label="Postal code" value={agent.postalCode} />
              <DetailItem label="Country" value={agent.country} />
            </div>
          </InfoSection>
          <AgentTagsSection
            title="Languages"
            values={agent.languages}
            emptyLabel="No languages are attached."
          />
          <AgentTagsSection
            title="Designations"
            values={agent.designations}
            emptyLabel="No designations are attached."
          />
          <InfoSection title="Listings">
            {agent.listings.length > 0 ? (
              <ListingsGrid listings={agent.listings} />
            ) : (
              <DirectoryEmpty message="No active listings are attached to this agent." />
            )}
          </InfoSection>
          <InfoSection title="Related open houses">
            {agent.openHouses.length > 0 ? (
              <div className="grid gap-4 lg:grid-cols-2">
                {agent.openHouses.map((openHouse) => (
                  <OpenHouseRow
                    openHouse={openHouse}
                    prominent
                    key={openHouse.openHouseKey}
                  />
                ))}
              </div>
            ) : (
              <DirectoryEmpty message="No open houses are attached to this agent's active listings." />
            )}
          </InfoSection>
        </div>
        <aside className="island-shell grid content-start gap-5 rounded-lg p-5 lg:sticky lg:top-24">
          <AgentRow agent={agent} prominent />
          {agent.office ? (
            <div className="grid gap-3 border-t border-[var(--line)] pt-5">
              <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-[var(--kicker)]">
                Office
              </p>
              <OfficeRow office={agent.office} prominent />
              <Button
                nativeButton={false}
                render={
                  <Link
                    to="/offices"
                    search={{ city: '', province: '', page: 1 }}
                  />
                }
                variant="outline"
              >
                Office details
              </Button>
            </div>
          ) : null}
          <SocialLinksList socialMedia={agent.socialMedia} />
        </aside>
      </section>
    </main>
  )
}

function AgentTagsSection({
  title,
  values,
  emptyLabel,
}: {
  readonly title: string
  readonly values: ReadonlyArray<string>
  readonly emptyLabel: string
}) {
  return (
    <InfoSection title={title}>
      {values.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {values.map((value) => (
            <span
              className="rounded-full border border-[var(--line)] bg-white/80 px-3 py-1 text-sm font-semibold text-[var(--sea-ink)]"
              key={value}
            >
              {value}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-sm text-[var(--sea-ink-soft)]">{emptyLabel}</p>
      )}
    </InfoSection>
  )
}

export function OpenHousesPage({
  data,
  isPaging = false,
  onSearchChange,
}: {
  readonly data: DirectoryData<OpenHouseCard>
  readonly isPaging?: boolean
  readonly onSearchChange: (search: OpenHouseSearch) => void
}) {
  const [filters, setFilters] = useAtom(openHouseFiltersAtom)
  const routeSearch = data.search as OpenHouseSearch
  const searchKey = JSON.stringify(routeSearch)

  useEffect(() => {
    setFilters(routeSearch)
  }, [routeSearch, searchKey, setFilters])

  const commit = (patch: Partial<OpenHouseSearch>) => {
    const next = { ...filters, ...patch, page: patch.page ?? 1 }
    setFilters(next)
    onSearchChange(compactOpenHouseSearch(next) as OpenHouseSearch)
  }

  return (
    <DirectoryPageShell
      eyebrow="Schedule"
      title="Open houses"
      description="Open house records joined back to their property listing."
      filters={
        <div className="grid gap-3 md:grid-cols-[1fr_auto]">
          <LabeledInput
            label="Loose search"
            value={filters.q}
            placeholder="Date, address, city, time, or key"
            onChange={(q) => commit({ q })}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => commit({ q: '' })}
          >
            Clear
          </Button>
        </div>
      }
    >
      {data.items.length > 0 ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {data.items.map((openHouse) => (
            <OpenHouseRow
              openHouse={openHouse}
              prominent
              searchQuery={routeSearch.q}
              key={openHouse.openHouseKey}
            />
          ))}
        </div>
      ) : (
        <DirectoryEmpty message="No open houses match that search." />
      )}
      <Pagination
        page={routeSearch.page}
        hasNextPage={data.hasNextPage}
        isPending={isPaging}
        onPage={(page) => commit({ page })}
      />
    </DirectoryPageShell>
  )
}

function DirectoryPageShell({
  eyebrow,
  title,
  description,
  filters,
  children,
}: {
  readonly eyebrow: string
  readonly title: string
  readonly description: string
  readonly filters?: ReactNode
  readonly children: ReactNode
}) {
  return (
    <main className="page-wrap grid gap-6 py-8">
      <section className="rounded-lg border border-[var(--line)] bg-white/72 p-5">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--kicker)]">
          {eyebrow}
        </p>
        <h1 className="display-title mt-2 text-4xl font-bold text-[var(--sea-ink)]">
          {title}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--sea-ink-soft)]">
          {description}
        </p>
        {filters ? <div className="mt-5">{filters}</div> : null}
      </section>
      {children}
    </main>
  )
}

function DirectoryEmpty({ message }: { readonly message: string }) {
  return (
    <div className="rounded-lg border border-dashed border-[var(--line)] bg-white/70 p-8 text-center">
      <p className="text-lg font-bold text-[var(--sea-ink)]">{message}</p>
    </div>
  )
}

function OfficeAgentLinkCard({ agent }: { readonly agent: PersonCard }) {
  return (
    <Link
      to="/agents/$agentKey"
      params={{ agentKey: agent.memberKey }}
      className="group flex items-center gap-3 rounded-md border border-[var(--line)] bg-white/74 p-3 text-[var(--sea-ink)] no-underline hover:border-[var(--lagoon-deep)] hover:text-[var(--lagoon-deep)]"
    >
      <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md bg-[var(--sand)] text-[var(--palm)]">
        {agent.imageUrl ? (
          <img
            src={agent.imageUrl}
            alt={personName(agent)}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <UserRound className="size-5" />
        )}
      </div>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-extrabold">
          {personName(agent)}
        </span>
        <span className="mt-0.5 block truncate text-xs font-semibold text-[var(--sea-ink-soft)]">
          {agent.jobTitle ?? agent.memberKey}
        </span>
      </span>
      <ArrowRight className="size-4 shrink-0 transition group-hover:translate-x-0.5" />
    </Link>
  )
}

function OfficeDetailView({ office }: { readonly office: OfficeDetail }) {
  const groupedMedia = mediaGroups(office.media)
  const heroImageUrl =
    office.imageUrl ?? groupedMedia.photos.at(0)?.mediaUrl ?? null

  return (
    <main className="page-wrap grid gap-6 py-8">
      <section className="grid gap-6 lg:grid-cols-[1fr_340px] lg:items-start">
        <div className="overflow-hidden rounded-lg border border-[var(--line)] bg-white/78">
          <div className="grid gap-0 md:grid-cols-[minmax(0,1fr)_280px]">
            <div className="grid content-between gap-6 p-6">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--kicker)]">
                  Office
                </p>
                <h1 className="display-title mt-2 text-4xl font-bold text-[var(--sea-ink)]">
                  {office.officeName ?? EXIT_EXCEL_OFFICE_NAME}
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--sea-ink-soft)]">
                  {[
                    office.address,
                    office.city,
                    office.province,
                    office.postalCode,
                  ]
                    .filter(Boolean)
                    .join(', ') || `Office key ${office.officeKey}`}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  nativeButton={false}
                  render={
                    <Link to="/agents" search={{ officeKey: '', page: 1 }} />
                  }
                >
                  <Users />
                  Agents
                </Button>
                {office.phone ? (
                  <Button
                    nativeButton={false}
                    render={<a href={`tel:${office.phone}`} />}
                    variant="outline"
                  >
                    <Phone />
                    Call office
                  </Button>
                ) : null}
              </div>
            </div>
            <div className="min-h-64 bg-[var(--sand)] text-[var(--palm)] md:min-h-full">
              {heroImageUrl ? (
                <img
                  src={heroImageUrl}
                  alt={office.officeName ?? 'Office logo'}
                  className="h-full w-full object-contain p-8"
                />
              ) : (
                <div className="flex h-full min-h-64 items-center justify-center">
                  <Building2 className="size-16" />
                </div>
              )}
            </div>
          </div>
          {groupedMedia.photos.length > 1 ? (
            <div className="grid grid-cols-2 gap-2 border-t border-[var(--line)] p-3 sm:grid-cols-4">
              {groupedMedia.photos.slice(0, 4).map((media) => (
                <img
                  src={media.mediaUrl ?? ''}
                  alt={media.longDescription ?? office.officeName ?? 'Office'}
                  className="aspect-[4/3] rounded-md bg-[var(--sand)] object-cover"
                  loading="lazy"
                  key={mediaKey(media)}
                />
              ))}
            </div>
          ) : null}
        </div>
        <aside className="island-shell grid content-start gap-5 rounded-lg p-5 lg:sticky lg:top-24">
          <OfficeRow office={office} prominent />
          <div className="grid grid-cols-2 gap-3">
            <OfficeMetric
              icon={Users}
              label="Agents"
              value={number.format(office.agents.length)}
            />
            <OfficeMetric
              icon={Home}
              label="Listings"
              value={number.format(office.listings.length)}
            />
          </div>
          <SocialLinksList socialMedia={office.socialMedia} />
        </aside>
      </section>
      <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <InfoSection title="Office details">
          <div className="grid gap-3 sm:grid-cols-2">
            <DetailItem label="Office key" value={office.officeKey} />
            <DetailItem label="MLS office ID" value={office.officeMlsId} />
            <DetailItem
              label="National association ID"
              value={office.officeNationalAssociationId}
            />
            <DetailItem
              label="Franchise ID"
              value={office.franchiseNationalAssociationId}
            />
            <DetailItem
              label="Broker national ID"
              value={office.officeBrokerNationalAssociationId}
            />
            <DetailItem label="AOR" value={office.officeAor} />
            <DetailItem label="AOR key" value={office.officeAorKey} />
            <DetailItem label="Type" value={office.officeType} />
            <DetailItem label="Status" value={office.officeStatus} />
          </div>
        </InfoSection>
        <InfoSection title="Address and contact">
          <div className="grid gap-3 sm:grid-cols-2">
            <DetailItem label="Address" value={office.address} />
            <DetailItem label="City" value={office.city} />
            <DetailItem label="Province" value={office.province} />
            <DetailItem label="Postal code" value={office.postalCode} />
            <DetailItem label="Country" value={office.country} />
            <DetailItem label="Phone" value={office.phone} />
            <DetailItem label="Phone extension" value={office.phoneExt} />
            <DetailItem label="Fax" value={office.fax} />
          </div>
        </InfoSection>
      </section>
      <InfoSection title="Agents">
        {office.agents.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {office.agents.map((agent) => (
              <OfficeAgentLinkCard agent={agent} key={agent.memberKey} />
            ))}
          </div>
        ) : (
          <DirectoryEmpty message="No active agents are attached to this office's listings." />
        )}
      </InfoSection>
      <InfoSection title="Office listings">
        {office.listings.length > 0 ? (
          <ListingsGrid listings={office.listings} />
        ) : (
          <DirectoryEmpty message="No active listings are attached to this office." />
        )}
      </InfoSection>
      {groupedMedia.all.length > 0 ? (
        <InfoSection title="Media">
          <MediaGroupsView
            listingAddress={office.officeName ?? EXIT_EXCEL_OFFICE_NAME}
            media={groupedMedia}
          />
        </InfoSection>
      ) : null}
    </main>
  )
}

function SocialLinksList({
  socialMedia,
}: {
  readonly socialMedia: ReadonlyArray<SocialMediaCard>
}) {
  if (socialMedia.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-[var(--line)] bg-white/60 p-3 text-sm text-[var(--sea-ink-soft)]">
        No social media links are attached.
      </div>
    )
  }

  return (
    <div className="grid gap-3">
      <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-[var(--kicker)]">
        Social
      </p>
      {socialMedia.map((item) => (
        <a
          className="flex items-center justify-between gap-3 rounded-md border border-[var(--line)] bg-white/70 p-3 text-sm font-semibold text-[var(--sea-ink)] no-underline hover:text-[var(--lagoon-deep)]"
          href={item.socialMediaUrlOrId ?? '#'}
          target="_blank"
          rel="noreferrer"
          key={item.socialMediaKey ?? item.socialMediaUrlOrId}
        >
          <span>{item.socialMediaType ?? 'Social link'}</span>
          <ExternalLink className="size-4" />
        </a>
      ))}
    </div>
  )
}

function LabeledInput({
  label,
  value,
  placeholder,
  onChange,
}: {
  readonly label: string
  readonly value: string
  readonly placeholder?: string
  readonly onChange: (value: string) => void
}) {
  return (
    <div className="grid gap-1.5">
      <Label className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--sea-ink-soft)]">
        {label}
      </Label>
      <Input
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  )
}

function DirectoryCard({ children }: { readonly children: ReactNode }) {
  return (
    <article className="rounded-lg border border-[var(--line)] bg-white/82 p-4 shadow-[0_10px_24px_rgba(23,58,64,0.07)]">
      {children}
    </article>
  )
}

export function OfficeRow({
  office,
  prominent = false,
}: {
  readonly office: OfficeCard
  readonly prominent?: boolean
}) {
  const identifiers = [
    `Office key ${office.officeKey}`,
    office.officeMlsId ? `MLS ${office.officeMlsId}` : null,
    office.officeNationalAssociationId
      ? `National ${office.officeNationalAssociationId}`
      : null,
  ].filter(Boolean)

  return (
    <div className="flex items-start gap-3">
      <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md bg-[var(--sand)] text-[var(--palm)]">
        {office.imageUrl ? (
          <img
            src={office.imageUrl}
            alt={office.officeName ?? 'Office logo'}
            className="h-full w-full object-contain"
            loading="lazy"
          />
        ) : (
          <Building2 className="size-5" />
        )}
      </div>
      <div className="min-w-0">
        <p
          className={cn(
            'font-extrabold text-[var(--sea-ink)]',
            prominent ? 'text-lg' : 'text-sm',
          )}
        >
          {office.officeName ?? 'Office'}
        </p>
        <p className="mt-1 text-sm text-[var(--sea-ink-soft)]">
          {[office.city, office.province].filter(Boolean).join(', ') ||
            office.officeKey}
        </p>
        <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--sea-ink-soft)]">
          {identifiers.join(' · ')}
        </p>
        {office.phone ? (
          <p className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-[var(--sea-ink-soft)]">
            <Phone className="size-3" />
            {office.phone}
          </p>
        ) : null}
      </div>
    </div>
  )
}

export function AgentRow({
  agent,
  prominent = false,
}: {
  readonly agent: PersonCard
  readonly prominent?: boolean
}) {
  return (
    <div className="grid gap-4">
      <div className="flex items-start gap-3">
        <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-md bg-[var(--sand)] text-[var(--palm)]">
          {agent.imageUrl ? (
            <img
              src={agent.imageUrl}
              alt={personName(agent)}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <UserRound className="size-5" />
          )}
        </div>
        <div className="min-w-0">
          <Link
            to="/agents/$agentKey"
            params={{ agentKey: agent.memberKey }}
            className={cn(
              'font-extrabold text-[var(--sea-ink)] no-underline hover:text-[var(--lagoon-deep)]',
              prominent ? 'text-lg' : 'text-sm',
            )}
          >
            {personName(agent)}
          </Link>
          {agent.jobTitle ? (
            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--kicker)]">
              {agent.jobTitle}
            </p>
          ) : null}
          <p className="mt-1 text-sm text-[var(--sea-ink-soft)]">
            {agent.office?.officeName ||
              [agent.city, agent.province].filter(Boolean).join(', ') ||
              agent.memberKey}
          </p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--sea-ink-soft)]">
            Agent key {agent.memberKey}
            {agent.officeKey ? ` · Office key ${agent.officeKey}` : ''}
          </p>
          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs font-semibold text-[var(--sea-ink-soft)]">
            {agent.phone ? (
              <span className="inline-flex items-center gap-1">
                <Phone className="size-3" />
                {agent.phone}
              </span>
            ) : null}
            {agent.type ? <span>{agent.type}</span> : null}
            {agent.status ? <span>{agent.status}</span> : null}
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          nativeButton={false}
          render={
            <Link
              to="/agents/$agentKey"
              params={{ agentKey: agent.memberKey }}
            />
          }
          size="sm"
        >
          <UserRound />
          Details
        </Button>
        <ContactAgentButton agent={agent} buttonLabel="Contact" />
      </div>
    </div>
  )
}

export function OpenHouseRow({
  openHouse,
  prominent = false,
  searchQuery = '',
}: {
  readonly openHouse: OpenHouseCard
  readonly prominent?: boolean
  readonly searchQuery?: string
}) {
  const dateLabel = formatDate(openHouse.date)
  const timeLabel = openHouseTimeLabel(openHouse)
  const propertyLocation = openHouse.property
    ? [openHouse.property.city, openHouse.property.province]
        .filter(Boolean)
        .join(', ')
    : ''
  const listingLabel = openHouse.listingId ?? openHouse.listingKey

  return (
    <div
      className={cn(
        'grid gap-3 rounded-lg border border-[var(--line)] bg-white/76 p-3 md:grid-cols-[auto_1fr]',
        prominent && 'p-4 shadow-[0_10px_24px_rgba(23,58,64,0.07)]',
      )}
    >
      <div className="flex size-12 items-center justify-center rounded-md bg-[var(--sand)] text-[var(--palm)]">
        <CalendarDays className="size-6" />
      </div>
      <div className="grid min-w-0 gap-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p
              className={cn(
                'font-extrabold text-[var(--sea-ink)]',
                prominent ? 'text-xl' : 'text-base',
              )}
            >
              <HighlightedValue value={dateLabel} query={searchQuery} />
            </p>
            <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-[var(--sea-ink-soft)]">
              <span className="inline-flex items-center gap-1">
                <Clock className="size-3.5" />
                <HighlightedValue value={timeLabel} query={searchQuery} />
              </span>
              {listingLabel ? (
                <span className="inline-flex items-center gap-1">
                  <Home className="size-3.5" />
                  <HighlightedValue
                    value={listingLabel}
                    query={searchQuery}
                  />
                </span>
              ) : null}
              {openHouse.status ? <span>{openHouse.status}</span> : null}
            </p>
            {openHouse.type ? (
              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--kicker)]">
                {openHouse.type}
              </p>
            ) : null}
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Button
              nativeButton={false}
              render={
                <Link
                  to="/open-houses/$openHouseKey"
                  params={{ openHouseKey: openHouse.openHouseKey }}
                />
              }
              size="sm"
            >
              <CalendarDays />
              Details
            </Button>
            {openHouse.property ? (
              <Button
                nativeButton={false}
                render={
                  <Link
                    to="/listings/$listingKey"
                    params={{ listingKey: openHouse.property.listingKey }}
                  />
                }
                size="sm"
                variant="outline"
              >
                Property
              </Button>
            ) : null}
          </div>
        </div>
        {openHouse.property ? (
          <Link
            to="/listings/$listingKey"
            params={{ listingKey: openHouse.property.listingKey }}
            className="group grid gap-1 rounded-md border border-[var(--line)] bg-[var(--foam)] p-3 no-underline hover:border-[var(--lagoon-deep)]"
          >
            <span className="text-sm font-extrabold text-[var(--sea-ink)] group-hover:text-[var(--lagoon-deep)]">
              <HighlightedValue
                value={openHouse.property.address}
                query={searchQuery}
              />
            </span>
            <span className="flex items-center gap-1.5 text-xs font-semibold text-[var(--sea-ink-soft)]">
              <MapPin className="size-3.5" />
              <HighlightedValue value={propertyLocation} query={searchQuery} />
            </span>
          </Link>
        ) : null}
        {openHouse.remarks ? (
          <p className="line-clamp-2 text-sm leading-6 text-[var(--sea-ink-soft)]">
            {openHouse.remarks}
          </p>
        ) : null}
      </div>
    </div>
  )
}

const escapeRegex = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

function HighlightedValue({
  value,
  query,
}: {
  readonly value: string
  readonly query: string
}) {
  if (!looseValueMatches(value, query)) return <>{value}</>

  const tokens = looseSearchTokens(query)
    .filter((token) => token.length > 0)
    .sort((left, right) => right.length - left.length)

  if (tokens.length === 0) return <>{value}</>

  const tokenSet = new Set(tokens.map((token) => token.toLowerCase()))
  const pattern = new RegExp(`(${tokens.map(escapeRegex).join('|')})`, 'gi')
  const parts = value.split(pattern).filter((part) => part.length > 0)

  if (parts.length <= 1) {
    return (
      <mark className="rounded bg-yellow-200/80 px-0.5 text-inherit">
        {value}
      </mark>
    )
  }

  return (
    <>
      {parts.map((part, index) =>
        tokenSet.has(part.toLowerCase()) ? (
          <mark
            className="rounded bg-yellow-200/80 px-0.5 text-inherit"
            key={`${part}-${index}`}
          >
            {part}
          </mark>
        ) : (
          part
        ),
      )}
    </>
  )
}
