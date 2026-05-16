import { useMemo, useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import {
  ArrowRight,
  Calculator,
  CheckCircle2,
  ClipboardCheck,
  Home,
  ListChecks,
  Search,
  ShieldCheck,
  SlidersHorizontal,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import {
  NativeSelect,
  NativeSelectOption,
} from '@workspace/ui/components/native-select'

import { defaultListingSearch } from '../search'
import { money, number } from './utils'

import type { ListingSearch } from '../search'

type EstateTool = 'overview' | 'properties' | 'calculator' | 'organizer'

type EstateNeedKey =
  | 'familyScale'
  | 'finishedBasement'
  | 'garage'
  | 'waterfront'
  | 'centralAir'

type EstateSearchState = {
  readonly bedrooms: string
  readonly bathrooms: string
  readonly parking: string
  readonly priceBand: 'any' | 'under900' | '900to1500' | '1500plus'
  readonly needs: ReadonlyArray<EstateNeedKey>
}

type EstateCalculatorState = {
  readonly saleLow: string
  readonly saleHigh: string
  readonly monthsToSell: string
  readonly monthlyMortgage: string
  readonly monthlyTax: string
  readonly monthlyUtilities: string
  readonly monthlyInsurance: string
  readonly monthlyCare: string
  readonly mortgagePayoff: string
  readonly securedDebt: string
  readonly taxArrears: string
  readonly cleanout: string
  readonly repairs: string
  readonly staging: string
  readonly inspection: string
  readonly legalFee: string
  readonly brokerPercent: string
  readonly executorSupport: string
  readonly closingAdjustments: string
}

type ChecklistSection = {
  readonly title: string
  readonly items: ReadonlyArray<{
    readonly key: string
    readonly label: string
    readonly description: string
  }>
}

const countOptions = [0, 1, 2, 3, 4, 5, 6]

const defaultEstateSearchState: EstateSearchState = {
  bedrooms: '4',
  bathrooms: '3',
  parking: '2',
  priceBand: 'any',
  needs: [],
}

const estateNeedOptions = [
  {
    key: 'familyScale',
    label: 'Family-scale layout',
    description: 'Keeps the search focused on four-plus bedroom homes.',
    search: { minBeds: 4 },
  },
  {
    key: 'finishedBasement',
    label: 'Finished lower level',
    description: 'Useful when space, storage, or separate living areas matter.',
    search: { basement: ['Finished'] },
  },
  {
    key: 'garage',
    label: 'Garage or workshop',
    description: 'Adds a parking-feature signal for larger-property review.',
    search: { minParking: 2, parkingFeatures: ['Garage'] },
  },
  {
    key: 'waterfront',
    label: 'Waterfront signal',
    description: 'Surfaces listings that advertise waterfront features.',
    search: { waterfrontFeatures: ['Waterfront'] },
  },
  {
    key: 'centralAir',
    label: 'Central air',
    description: 'Keeps comfort and mechanical expectations visible.',
    search: { cooling: ['Central air conditioning'] },
  },
] as const satisfies ReadonlyArray<{
  readonly key: EstateNeedKey
  readonly label: string
  readonly description: string
  readonly search: Partial<ListingSearch>
}>

const estateToolLinks = [
  {
    key: 'overview',
    title: 'Estate overview',
    description: 'Set a working property profile before searching.',
    to: '/estates',
    icon: Home,
  },
  {
    key: 'properties',
    title: 'Properties',
    description: 'Browse estate-scale homes and larger-property comps.',
    to: '/estates/properties',
    icon: Search,
  },
  {
    key: 'calculator',
    title: 'Planning calculator',
    description: 'Estimate carrying costs, sale costs, debts, and net range.',
    to: '/estates/calculator',
    icon: Calculator,
  },
  {
    key: 'organizer',
    title: 'Organizer',
    description: 'Track documents, advisors, access, and sale-readiness.',
    to: '/estates/organizer',
    icon: ClipboardCheck,
  },
] as const

const defaultEstateCalculatorState: EstateCalculatorState = {
  saleLow: '',
  saleHigh: '',
  monthsToSell: '4',
  monthlyMortgage: '',
  monthlyTax: '',
  monthlyUtilities: '',
  monthlyInsurance: '',
  monthlyCare: '',
  mortgagePayoff: '',
  securedDebt: '',
  taxArrears: '',
  cleanout: '2500',
  repairs: '5000',
  staging: '2500',
  inspection: '750',
  legalFee: '3000',
  brokerPercent: '5',
  executorSupport: '1500',
  closingAdjustments: '1000',
}

const brokerPercentOptions = [
  { value: 4, label: 'Lean sale cost', description: 'Lower commission model.' },
  {
    value: 5,
    label: 'Typical sale cost',
    description: 'Common planning rule.',
  },
  {
    value: 6,
    label: 'Complex sale cost',
    description: 'More service, distance, or property complexity.',
  },
] as const

const legalFeeOptions = [
  { value: 2000, label: 'Simple file', description: 'Basic real estate file.' },
  {
    value: 3000,
    label: 'Estate file',
    description: 'More executor and estate-paper review.',
  },
  {
    value: 5000,
    label: 'Complex file',
    description: 'Extra title, estate, or family-advisor work.',
  },
] as const

const executorSupportOptions = [
  { value: 0, label: 'Self-managed', description: 'No extra admin budget.' },
  {
    value: 1500,
    label: 'Light support',
    description: 'Document, courier, or advisor help.',
  },
  {
    value: 4000,
    label: 'Heavy support',
    description: 'More professional coordination time.',
  },
] as const

const estateChecklistSections: ReadonlyArray<ChecklistSection> = [
  {
    title: 'Decision Makers',
    items: [
      {
        key: 'authority-confirmed',
        label: 'Confirm who has authority to sign',
        description:
          'Identify the executor, attorney, trustee, or owner who can approve pricing, access, offers, and closing documents.',
      },
      {
        key: 'family-update-rhythm',
        label: 'Set an update rhythm for family or beneficiaries',
        description:
          'Choose one channel and cadence so decisions do not get repeated through separate conversations.',
      },
      {
        key: 'decision-thresholds',
        label: 'Write down decision thresholds',
        description:
          'Agree on the minimum sale range, repair budget limit, closing-window comfort, and who breaks ties.',
      },
    ],
  },
  {
    title: 'Documents',
    items: [
      {
        key: 'title-tax-utilities',
        label: 'Collect title, tax, mortgage, utility, and insurance records',
        description:
          'Keep the property identifiers, balances, arrears, policy numbers, and account contacts in one place.',
      },
      {
        key: 'estate-authority-docs',
        label: 'Gather will, probate, POA, or estate authority papers',
        description:
          'Know which papers an agent, lawyer, lender, or buyer-side lawyer may ask to review.',
      },
      {
        key: 'permits-receipts',
        label: 'Find permits, warranties, surveys, and improvement receipts',
        description:
          'Use documents to explain upgrades, boundaries, mechanicals, and any work that affects buyer confidence.',
      },
    ],
  },
  {
    title: 'Property Facts',
    items: [
      {
        key: 'room-and-feature-notes',
        label: 'Record room, parking, utility, and lot facts',
        description:
          'Capture bedrooms, baths, garage spaces, heating, cooling, water, sewer, lot features, and any special access notes.',
      },
      {
        key: 'known-issues',
        label: 'List known defects and repair history',
        description:
          'Write down leaks, foundation concerns, pests, appliance issues, insurance claims, and repairs already completed.',
      },
      {
        key: 'contents-plan',
        label: 'Separate contents, fixtures, inclusions, and exclusions',
        description:
          'Decide what stays, what is removed, what needs appraisal, and what should not appear in listing photos.',
      },
    ],
  },
  {
    title: 'Advisors',
    items: [
      {
        key: 'lawyer-contact',
        label: 'Confirm the estate or real estate lawyer contact',
        description:
          'Make sure title, authority, discharge, and closing questions have one legal contact.',
      },
      {
        key: 'lender-payoff',
        label: 'Request payout statements and discharge instructions',
        description:
          'Get current payoff numbers for mortgages, HELOCs, liens, tax arrears, and secured debts.',
      },
      {
        key: 'tax-accounting',
        label: 'Ask about tax, estate accounting, and distribution timing',
        description:
          'Use the calculator net range for planning, then confirm tax and distribution rules with the right advisor.',
      },
    ],
  },
  {
    title: 'Showings',
    items: [
      {
        key: 'access-plan',
        label: 'Choose access rules and showing windows',
        description:
          'Decide lockbox, alarm, pets, occupants, vacant-property checks, lights, heat, and who handles urgent access calls.',
      },
      {
        key: 'safety-privacy',
        label: 'Remove private papers, valuables, medications, and hazards',
        description:
          'Protect documents, family items, weapons, prescriptions, tripping hazards, and anything not meant for public view.',
      },
      {
        key: 'family-visit-plan',
        label: 'Block family pickup or inspection times',
        description:
          'Create predictable windows for family, appraisers, cleaners, contractors, photographers, and inspectors.',
      },
    ],
  },
  {
    title: 'Sale Readiness',
    items: [
      {
        key: 'cleanout',
        label: 'Finish cleanout and basic maintenance',
        description:
          'Prioritize entry, kitchen, bathrooms, mechanical rooms, yard, basement, and any space buyers need to inspect.',
      },
      {
        key: 'prep-budget',
        label: 'Set a sale-prep budget before booking work',
        description:
          'Cap cleaning, repairs, staging, landscaping, disposal, inspection, and urgent trade calls before work begins.',
      },
      {
        key: 'launch-package',
        label: 'Prepare listing notes, media access, and offer review timing',
        description:
          'Make the launch details shareable so everyone reviews the same property facts, photos, showings, and offers.',
      },
    ],
  },
]

const cleanNumericInput = (value: string) => value.replace(/\D/g, '')

const numericValue = (value: string) => {
  if (!/^\d+$/.test(value)) return 0
  const parsed = Number.parseInt(value, 10)
  return Number.isSafeInteger(parsed) ? parsed : 0
}

const optionValue = (value: number) => String(value)

const mergeSearchPatch = (
  base: ListingSearch,
  patch: Partial<ListingSearch>,
): ListingSearch => ({
  ...base,
  ...patch,
  appliances: patch.appliances ?? base.appliances,
  basement: patch.basement ?? base.basement,
  waterSource: patch.waterSource ?? base.waterSource,
  sewer: patch.sewer ?? base.sewer,
  waterfrontFeatures: patch.waterfrontFeatures ?? base.waterfrontFeatures,
  heating: patch.heating ?? base.heating,
  cooling: patch.cooling ?? base.cooling,
  parkingFeatures: patch.parkingFeatures ?? base.parkingFeatures,
})

const estateSearch = (state: EstateSearchState): ListingSearch => {
  let search: ListingSearch = {
    ...defaultListingSearch,
    status: 'Active',
    minBeds: 4,
    minBaths: 3,
    minParking: 2,
    sort: 'price-desc',
    page: 1,
  }

  if (state.bedrooms) {
    search = { ...search, minBeds: Number.parseInt(state.bedrooms, 10) }
  }
  if (state.bathrooms) {
    search = { ...search, minBaths: Number.parseInt(state.bathrooms, 10) }
  }
  if (state.parking) {
    search = { ...search, minParking: Number.parseInt(state.parking, 10) }
  }

  if (state.priceBand === 'under900') {
    search = { ...search, maxPrice: 900000 }
  }
  if (state.priceBand === '900to1500') {
    search = { ...search, minPrice: 900000, maxPrice: 1500000 }
  }
  if (state.priceBand === '1500plus') {
    search = { ...search, minPrice: 1500000 }
  }

  for (const needKey of state.needs) {
    const need = estateNeedOptions.find((option) => option.key === needKey)
    if (need) search = mergeSearchPatch(search, need.search)
  }

  return search
}

const moneyRange = (low: number, high: number) => {
  if (low <= 0 && high <= 0) return money.format(0)
  if (low === high) return money.format(low)
  return `${money.format(low)} to ${money.format(high)}`
}

function EstateToolNav({ active }: { readonly active: EstateTool }) {
  return (
    <nav className="grid gap-3 md:grid-cols-4">
      {estateToolLinks.map((item) => {
        const Icon = item.icon
        const isActive = item.key === active
        return (
          <Link
            to={item.to}
            className="rounded-lg border border-border bg-background p-4 text-foreground no-underline hover:border-border"
            data-active={isActive}
            key={item.key}
          >
            <span className="flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-md border border-border bg-background">
                <Icon className="size-5" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-extrabold">
                  {item.title}
                </span>
                <span className="mt-1 block text-xs leading-5">
                  {item.description}
                </span>
              </span>
            </span>
          </Link>
        )
      })}
    </nav>
  )
}

function EstateHero({
  eyebrow,
  title,
  description,
  active,
}: {
  readonly eyebrow: string
  readonly title: string
  readonly description: string
  readonly active: EstateTool
}) {
  return (
    <section className="grid gap-5 rounded-lg border border-border bg-background p-5">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-foreground">
          {eyebrow}
        </p>
        <h1 className="display-title mt-2 max-w-4xl text-4xl font-bold text-foreground md:text-5xl">
          {title}
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-foreground">
          {description}
        </p>
      </div>
      <EstateToolNav active={active} />
    </section>
  )
}

function NumericSelect({
  label,
  value,
  placeholder,
  options,
  onChange,
}: {
  readonly label: string
  readonly value: string
  readonly placeholder: string
  readonly options: ReadonlyArray<number>
  readonly onChange: (value: string) => void
}) {
  return (
    <label className="grid gap-1.5">
      <span className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground">
        {label}
      </span>
      <NativeSelect
        className="w-full"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <NativeSelectOption value="">{placeholder}</NativeSelectOption>
        {options.map((option) => (
          <NativeSelectOption value={option} key={option}>
            {option === 0 ? '0' : number.format(option)}
          </NativeSelectOption>
        ))}
      </NativeSelect>
    </label>
  )
}

function ToolLink({
  to,
  title,
  description,
  icon: Icon,
}: {
  readonly to: (typeof estateToolLinks)[number]['to']
  readonly title: string
  readonly description: string
  readonly icon: LucideIcon
}) {
  return (
    <Link
      to={to}
      className="flex items-center justify-between gap-3 rounded-md border border-border bg-background px-3 py-3 text-foreground no-underline hover:border-border"
    >
      <span className="flex min-w-0 items-center gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-background">
          <Icon className="size-4" />
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-extrabold">{title}</span>
          <span className="mt-0.5 block text-xs leading-5">{description}</span>
        </span>
      </span>
      <ArrowRight className="size-4 shrink-0" />
    </Link>
  )
}

function NumericInput({
  label,
  value,
  onChange,
  min = 0,
  max,
}: {
  readonly label: string
  readonly value: string
  readonly onChange: (value: string) => void
  readonly min?: number
  readonly max?: number
}) {
  return (
    <label className="grid gap-1.5">
      <span className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground">
        {label}
      </span>
      <Input
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        step={1}
        value={value}
        onChange={(event) => onChange(cleanNumericInput(event.target.value))}
        className="bg-background"
      />
    </label>
  )
}

function OptionRadioGroup({
  title,
  name,
  value,
  options,
  onChange,
  formatValue = money.format,
}: {
  readonly title: string
  readonly name: string
  readonly value: string
  readonly options: ReadonlyArray<{
    readonly value: number
    readonly label: string
    readonly description: string
  }>
  readonly onChange: (value: string) => void
  readonly formatValue?: (value: number) => string
}) {
  return (
    <fieldset className="grid gap-3 rounded-lg border border-border bg-background p-4">
      <legend className="px-1 text-xs font-semibold uppercase tracking-[0.16em] text-foreground">
        {title}
      </legend>
      <div className="grid gap-3 sm:grid-cols-3">
        {options.map((option) => (
          <label
            className="flex cursor-pointer gap-3 rounded-md border border-border bg-background p-3 text-sm text-foreground"
            key={option.value}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === optionValue(option.value)}
              onChange={(event) => onChange(event.target.value)}
              className="mt-1 size-4 shrink-0 accent-current"
            />
            <span>
              <span className="block font-extrabold">{option.label}</span>
              <span className="mt-1 block leading-5">
                {formatValue(option.value)}
              </span>
              <span className="mt-1 block text-xs leading-5">
                {option.description}
              </span>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}

export function EstateLandingPage() {
  const [state, setState] = useState(defaultEstateSearchState)
  const navigate = useNavigate({ from: '/estates/' })
  const selectedNeeds = new Set(state.needs)
  const search = estateSearch(state)
  const selectedFilterCount = [
    state.bedrooms,
    state.bathrooms,
    state.parking,
    state.priceBand !== 'any',
    ...state.needs,
  ].filter(Boolean).length

  const update = (patch: Partial<EstateSearchState>) =>
    setState((current) => ({ ...current, ...patch }))

  const toggleNeed = (key: EstateNeedKey) => {
    const next = selectedNeeds.has(key)
      ? state.needs.filter((item) => item !== key)
      : [...state.needs, key]
    update({ needs: next })
  }

  return (
    <main className="page-wrap grid gap-6 py-8">
      <EstateHero
        eyebrow="Estate planning workspace"
        title="Make the property decision easier to share."
        description="Start with a practical larger-property search, then use the calculator and organizer to turn sale range, costs, documents, and family decisions into a clear working plan."
        active="overview"
      />

      <section className="grid gap-5 lg:grid-cols-[1fr_340px]">
        <form
          className="grid gap-5 rounded-lg border border-border bg-background p-5"
          onSubmit={(event) => {
            event.preventDefault()
            void navigate({
              to: '/estates/properties',
              search,
            })
          }}
        >
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-foreground">
                Larger-property search
              </p>
              <h2 className="display-title mt-2 text-3xl font-bold text-foreground">
                Set the working property profile.
              </h2>
            </div>
            <span className="rounded-full border border-border bg-background px-3 py-1 text-xs font-extrabold text-foreground">
              {number.format(selectedFilterCount)} filters selected
            </span>
          </div>

          <p className="rounded-lg border border-border bg-background p-3 text-sm font-semibold leading-6 text-foreground">
            Use this to anchor the conversation before anyone starts comparing
            one-off links. The search opens with active, larger homes and can be
            narrowed by city, price, property type, lot feature, amenities, and
            parking from the filter button.
          </p>

          <div className="grid gap-4 sm:grid-cols-3">
            <NumericSelect
              label="Minimum bedrooms"
              value={state.bedrooms}
              placeholder="Any bedrooms"
              options={countOptions.slice(1)}
              onChange={(bedrooms) => update({ bedrooms })}
            />
            <NumericSelect
              label="Minimum bathrooms"
              value={state.bathrooms}
              placeholder="Any bathrooms"
              options={countOptions.slice(1)}
              onChange={(bathrooms) => update({ bathrooms })}
            />
            <NumericSelect
              label="Minimum parking"
              value={state.parking}
              placeholder="Any parking"
              options={countOptions}
              onChange={(parking) => update({ parking })}
            />
          </div>

          <fieldset className="grid gap-3">
            <legend className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground">
              Price range
            </legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                {
                  value: 'any',
                  label: 'Any estate-scale price',
                  description: 'Start with size and property facts first.',
                },
                {
                  value: 'under900',
                  label: 'Up to $900K',
                  description: 'Keep affordability in the first pass.',
                },
                {
                  value: '900to1500',
                  label: '$900K to $1.5M',
                  description: 'Review the middle of the larger-home market.',
                },
                {
                  value: '1500plus',
                  label: '$1.5M+',
                  description: 'Focus on higher-value estate decisions.',
                },
              ].map((option) => (
                <label
                  className="flex cursor-pointer gap-3 rounded-lg border border-border bg-background p-3 text-sm text-foreground"
                  key={option.value}
                >
                  <input
                    type="radio"
                    name="priceBand"
                    value={option.value}
                    checked={state.priceBand === option.value}
                    onChange={() =>
                      update({
                        priceBand:
                          option.value as EstateSearchState['priceBand'],
                      })
                    }
                    className="mt-1 size-4 shrink-0 accent-current"
                  />
                  <span>
                    <span className="block font-extrabold">{option.label}</span>
                    <span className="mt-1 block leading-5">
                      {option.description}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="grid gap-3">
            <legend className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground">
              Practical signals
            </legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {estateNeedOptions.map((option) => (
                <label
                  className="flex cursor-pointer gap-3 rounded-lg border border-border bg-background p-3 text-sm text-foreground"
                  key={option.key}
                >
                  <input
                    type="checkbox"
                    checked={selectedNeeds.has(option.key)}
                    onChange={() => toggleNeed(option.key)}
                    className="mt-1 size-4 shrink-0 accent-current"
                  />
                  <span>
                    <span className="block font-extrabold">{option.label}</span>
                    <span className="mt-1 block leading-5">
                      {option.description}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="flex flex-wrap gap-3">
            <Button type="submit">
              <Search />
              Search estate-scale homes
            </Button>
            <Button
              nativeButton={false}
              render={<Link to="/estates/calculator" />}
              variant="outline"
            >
              <Calculator />
              Estimate net range
            </Button>
          </div>
        </form>

        <aside className="grid content-start gap-3 rounded-lg border border-border bg-background p-5">
          <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-foreground">
            Estate tools
          </p>
          <ToolLink
            to="/estates/properties"
            title="Search larger homes"
            description="Open the estate-scale listings page."
            icon={SlidersHorizontal}
          />
          <ToolLink
            to="/estates/calculator"
            title="Plan the net range"
            description="Combine sale range, costs, carrying, and payoffs."
            icon={Calculator}
          />
          <ToolLink
            to="/estates/organizer"
            title="Organize the file"
            description="Track family, documents, advisors, and access."
            icon={ListChecks}
          />
        </aside>
      </section>
    </main>
  )
}

export function EstateCalculatorPage() {
  const [state, setState] = useState(defaultEstateCalculatorState)
  const saleLow = numericValue(state.saleLow)
  const saleHighInput = numericValue(state.saleHigh)
  const saleHigh = saleHighInput > 0 ? saleHighInput : saleLow
  const normalizedSaleLow = Math.min(saleLow, saleHigh)
  const normalizedSaleHigh = Math.max(saleLow, saleHigh)
  const saleMidpoint = Math.round((normalizedSaleLow + normalizedSaleHigh) / 2)
  const monthsToSell = Math.max(0, numericValue(state.monthsToSell))
  const monthlyCarrying =
    numericValue(state.monthlyMortgage) +
    numericValue(state.monthlyTax) +
    numericValue(state.monthlyUtilities) +
    numericValue(state.monthlyInsurance) +
    numericValue(state.monthlyCare)
  const carryingTotal = monthlyCarrying * monthsToSell
  const prepTotal =
    numericValue(state.cleanout) +
    numericValue(state.repairs) +
    numericValue(state.staging) +
    numericValue(state.inspection)
  const payoffTotal =
    numericValue(state.mortgagePayoff) +
    numericValue(state.securedDebt) +
    numericValue(state.taxArrears)
  const brokerPercent = numericValue(state.brokerPercent)
  const legalAndClosing =
    numericValue(state.legalFee) +
    numericValue(state.executorSupport) +
    numericValue(state.closingAdjustments)
  const brokerLow = Math.round(normalizedSaleLow * (brokerPercent / 100))
  const brokerHigh = Math.round(normalizedSaleHigh * (brokerPercent / 100))
  const netLow =
    normalizedSaleLow -
    brokerLow -
    carryingTotal -
    prepTotal -
    payoffTotal -
    legalAndClosing
  const netHigh =
    normalizedSaleHigh -
    brokerHigh -
    carryingTotal -
    prepTotal -
    payoffTotal -
    legalAndClosing

  const update = (patch: Partial<EstateCalculatorState>) =>
    setState((current) => ({ ...current, ...patch }))

  const summaryRows = [
    {
      label: 'Expected sale range',
      value: moneyRange(normalizedSaleLow, normalizedSaleHigh),
    },
    {
      label: 'Broker cost range',
      value: `-${moneyRange(brokerLow, brokerHigh)}`,
    },
    { label: 'Carrying costs', value: `-${money.format(carryingTotal)}` },
    { label: 'Sale-prep budget', value: `-${money.format(prepTotal)}` },
    { label: 'Payoffs and arrears', value: `-${money.format(payoffTotal)}` },
    {
      label: 'Legal, advisor, closing',
      value: `-${money.format(legalAndClosing)}`,
    },
    {
      label: 'Net available range',
      value: moneyRange(netLow, netHigh),
      strong: true,
    },
  ]

  return (
    <main className="page-wrap grid gap-6 py-8">
      <EstateHero
        eyebrow="Estate calculator"
        title="Estimate the net range before family decisions."
        description="Use a sale range, carrying timeline, sale-prep budget, debt payoff, broker cost, and legal or advisor costs to estimate what may remain for estate planning discussions."
        active="calculator"
      />

      <section className="grid gap-5 lg:grid-cols-[1fr_380px]">
        <div className="grid gap-5 rounded-lg border border-border bg-background p-5">
          <section className="grid gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-foreground">
                Sale range and timeline
              </p>
              <p className="mt-1 text-sm leading-6 text-foreground">
                Enter a conservative and optimistic sale number. If you only
                have one estimate, use the same number twice.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <NumericInput
                label="Low sale estimate"
                value={state.saleLow}
                onChange={(saleLow) => update({ saleLow })}
              />
              <NumericInput
                label="High sale estimate"
                value={state.saleHigh}
                onChange={(saleHigh) => update({ saleHigh })}
              />
              <NumericInput
                label="Months to closing"
                value={state.monthsToSell}
                onChange={(monthsToSell) => update({ monthsToSell })}
              />
            </div>
          </section>

          <section className="grid gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-foreground">
                Monthly carrying
              </p>
              <p className="mt-1 text-sm leading-6 text-foreground">
                Include costs paid until closing, especially when the property
                is vacant, inherited, or waiting on documents.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <NumericInput
                label="Mortgage payment"
                value={state.monthlyMortgage}
                onChange={(monthlyMortgage) => update({ monthlyMortgage })}
              />
              <NumericInput
                label="Property tax monthly"
                value={state.monthlyTax}
                onChange={(monthlyTax) => update({ monthlyTax })}
              />
              <NumericInput
                label="Utilities monthly"
                value={state.monthlyUtilities}
                onChange={(monthlyUtilities) => update({ monthlyUtilities })}
              />
              <NumericInput
                label="Insurance monthly"
                value={state.monthlyInsurance}
                onChange={(monthlyInsurance) => update({ monthlyInsurance })}
              />
              <NumericInput
                label="Lawn, snow, security"
                value={state.monthlyCare}
                onChange={(monthlyCare) => update({ monthlyCare })}
              />
            </div>
          </section>

          <section className="grid gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-foreground">
                Debts and payoffs
              </p>
              <p className="mt-1 text-sm leading-6 text-foreground">
                Use current payout numbers where possible. Add known liens,
                arrears, secured debt, or property-specific balances.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <NumericInput
                label="Mortgage payoff"
                value={state.mortgagePayoff}
                onChange={(mortgagePayoff) => update({ mortgagePayoff })}
              />
              <NumericInput
                label="Other secured debt"
                value={state.securedDebt}
                onChange={(securedDebt) => update({ securedDebt })}
              />
              <NumericInput
                label="Tax or utility arrears"
                value={state.taxArrears}
                onChange={(taxArrears) => update({ taxArrears })}
              />
            </div>
          </section>

          <section className="grid gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-foreground">
                Sale-prep budget
              </p>
              <p className="mt-1 text-sm leading-6 text-foreground">
                Set budgets before contractors, cleaners, family pickups, or
                staging decisions start moving.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-4">
              <NumericInput
                label="Cleanout"
                value={state.cleanout}
                onChange={(cleanout) => update({ cleanout })}
              />
              <NumericInput
                label="Repairs"
                value={state.repairs}
                onChange={(repairs) => update({ repairs })}
              />
              <NumericInput
                label="Staging/photos"
                value={state.staging}
                onChange={(staging) => update({ staging })}
              />
              <NumericInput
                label="Inspection/trades"
                value={state.inspection}
                onChange={(inspection) => update({ inspection })}
              />
            </div>
          </section>

          <OptionRadioGroup
            title="Broker cost"
            name="brokerPercent"
            value={state.brokerPercent}
            options={brokerPercentOptions}
            onChange={(brokerPercent) => update({ brokerPercent })}
            formatValue={(value) => `${number.format(value)}%`}
          />
          <OptionRadioGroup
            title="Legal fees"
            name="legalFee"
            value={state.legalFee}
            options={legalFeeOptions}
            onChange={(legalFee) => update({ legalFee })}
          />
          <OptionRadioGroup
            title="Executor or advisor support"
            name="executorSupport"
            value={state.executorSupport}
            options={executorSupportOptions}
            onChange={(executorSupport) => update({ executorSupport })}
          />

          <NumericInput
            label="Closing adjustments buffer"
            value={state.closingAdjustments}
            onChange={(closingAdjustments) => update({ closingAdjustments })}
          />
        </div>

        <aside className="grid content-start gap-4 rounded-lg border border-border bg-background p-5">
          <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-foreground">
            Net for planning
          </p>
          <div className="rounded-lg border border-border bg-background p-4">
            <p className="display-title text-4xl font-bold text-foreground">
              {moneyRange(netLow, netHigh)}
            </p>
            <p className="mt-2 text-sm leading-6 text-foreground">
              Midpoint: {money.format(saleMidpoint)} sale price before costs,
              debts, and carrying expenses.
            </p>
          </div>
          <div className="grid gap-2">
            {summaryRows.map((row) => (
              <div
                className="flex items-center justify-between gap-3 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                key={row.label}
              >
                <span className={row.strong ? 'font-extrabold' : undefined}>
                  {row.label}
                </span>
                <span className={row.strong ? 'font-extrabold' : undefined}>
                  {row.value}
                </span>
              </div>
            ))}
          </div>
          <p className="rounded-lg border border-border bg-background p-3 text-xs font-semibold leading-5 text-foreground">
            This is a planning estimate. Confirm tax, probate, mortgage
            discharge, and distribution rules with the right advisors before
            making family or executor commitments.
          </p>
        </aside>
      </section>
    </main>
  )
}

export function EstateOrganizerPage() {
  const [checked, setChecked] = useState<ReadonlyArray<string>>([])
  const checkedSet = useMemo(() => new Set(checked), [checked])
  const allItems = estateChecklistSections.flatMap((section) => section.items)
  const completedCount = checked.length
  const progress =
    allItems.length === 0
      ? 0
      : Math.round((completedCount / allItems.length) * 100)

  const toggle = (key: string) => {
    setChecked((current) =>
      current.includes(key)
        ? current.filter((item) => item !== key)
        : [...current, key],
    )
  }

  return (
    <main className="page-wrap grid gap-6 py-8">
      <EstateHero
        eyebrow="Estate organizer"
        title="Keep the file organized before the property goes public."
        description="Use the checklist to align authority, documents, property facts, advisors, showings, and sale-readiness before pricing and offers require fast decisions."
        active="organizer"
      />

      <section className="grid gap-5 lg:grid-cols-[320px_1fr]">
        <aside className="grid content-start gap-4 rounded-lg border border-border bg-background p-5">
          <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-foreground">
            Progress
          </p>
          <div className="rounded-lg border border-border bg-background p-4">
            <p className="display-title text-4xl font-bold text-foreground">
              {number.format(progress)}%
            </p>
            <p className="mt-2 text-sm leading-6 text-foreground">
              {number.format(completedCount)} of{' '}
              {number.format(allItems.length)} items complete.
            </p>
          </div>
          <div className="grid gap-2 rounded-lg border border-border bg-background p-4 text-sm leading-6 text-foreground">
            <p className="font-extrabold">Next useful output</p>
            <p>
              A shareable package with decision makers, authority documents,
              payoff numbers, property facts, access rules, and a capped prep
              budget.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => setChecked([])}
            disabled={checked.length === 0}
          >
            Reset organizer
          </Button>
        </aside>

        <div className="grid gap-4">
          {estateChecklistSections.map((section) => (
            <section
              className="grid gap-3 rounded-lg border border-border bg-background p-5"
              key={section.title}
            >
              <h2 className="display-title text-3xl font-bold text-foreground">
                {section.title}
              </h2>
              <div className="grid gap-3">
                {section.items.map((item) => {
                  const isChecked = checkedSet.has(item.key)
                  return (
                    <label
                      className="flex cursor-pointer gap-3 rounded-md border border-border bg-background p-4 text-foreground"
                      key={item.key}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggle(item.key)}
                        className="mt-1 size-4 shrink-0 accent-current"
                      />
                      <span>
                        <span className="flex items-center gap-2 font-extrabold">
                          {isChecked ? (
                            <CheckCircle2 className="size-4" />
                          ) : (
                            <ShieldCheck className="size-4" />
                          )}
                          {item.label}
                        </span>
                        <span className="mt-1 block text-sm leading-6">
                          {item.description}
                        </span>
                      </span>
                    </label>
                  )
                })}
              </div>
            </section>
          ))}
        </div>
      </section>
    </main>
  )
}

export function EstatePropertiesIntro() {
  return (
    <div className="rounded-lg border border-border bg-background p-4 text-sm leading-6 text-foreground">
      <p className="font-extrabold">Estate-scale search reminder</p>
      <p className="mt-1">
        Start from larger active homes, then use filters for city, neighborhood,
        lot feature, property type, price, beds, baths, parking, garage,
        finished space, utilities, and waterfront signals. Share the URL so
        family, executors, and advisors review the same result set.
      </p>
    </div>
  )
}
