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

import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import {
  NativeSelect,
  NativeSelectOption,
} from '@workspace/ui/components/native-select'

import { defaultListingSearch } from '../search'
import { money, number } from './utils'

import type { ListingSearch } from '../search'

type SellerTool = 'research' | 'comparables' | 'calculator' | 'get-ready'

type SellerAmenityKey =
  | 'finishedBasement'
  | 'waterfront'
  | 'centralAir'
  | 'forcedAir'
  | 'dishwasher'

type SellerCompState = {
  readonly bedrooms: string
  readonly bathrooms: string
  readonly parking: string
  readonly garage: 'any' | 'garage'
  readonly amenities: ReadonlyArray<SellerAmenityKey>
}

type CalculatorState = {
  readonly mortgageDebt: string
  readonly helocDebt: string
  readonly propertyDebt: string
  readonly purchasePrice: string
  readonly yearBought: string
  readonly improvementsMade: 'no' | 'yes'
  readonly improvements: string
  readonly lawyerFee: string
  readonly prepCosts: string
  readonly dischargeFee: string
  readonly movingCosts: string
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
const currentYear = new Date().getFullYear()

const defaultSellerCompState: SellerCompState = {
  bedrooms: '',
  bathrooms: '',
  parking: '',
  garage: 'any',
  amenities: [],
}

const sellerAmenityOptions = [
  {
    key: 'finishedBasement',
    label: 'Finished basement',
    description: 'Keeps finished lower-level homes together.',
    search: { basement: ['Finished'] },
  },
  {
    key: 'waterfront',
    label: 'Waterfront',
    description: 'Narrows to listings with waterfront features.',
    search: { waterfrontFeatures: ['Waterfront'] },
  },
  {
    key: 'centralAir',
    label: 'Central air',
    description: 'Matches listings that advertise central air.',
    search: { cooling: ['Central air conditioning'] },
  },
  {
    key: 'forcedAir',
    label: 'Forced air',
    description: 'Matches common forced-air heating systems.',
    search: { heating: ['Forced air'] },
  },
  {
    key: 'dishwasher',
    label: 'Dishwasher',
    description: 'Adds a common appliance signal.',
    search: { appliances: ['Dishwasher'] },
  },
] as const satisfies ReadonlyArray<{
  readonly key: SellerAmenityKey
  readonly label: string
  readonly description: string
  readonly search: Partial<ListingSearch>
}>

const sellerToolLinks = [
  {
    key: 'research',
    title: 'Seller research',
    description: 'Build a quick comp profile before reviewing matches.',
    to: '/sellers',
    icon: Home,
  },
  {
    key: 'comparables',
    title: 'Comparables',
    description: 'Display active listings that match your seller filters.',
    to: '/sellers/comparables',
    icon: Search,
  },
  {
    key: 'calculator',
    title: 'Net proceeds',
    description: 'Estimate take-home after appreciation, debt, and costs.',
    to: '/sellers/calculator',
    icon: Calculator,
  },
  {
    key: 'get-ready',
    title: 'Get ready',
    description: 'Work through a practical pre-listing checklist.',
    to: '/sellers/get-ready',
    icon: ClipboardCheck,
  },
] as const

const defaultCalculatorState: CalculatorState = {
  mortgageDebt: '',
  helocDebt: '',
  propertyDebt: '',
  purchasePrice: '',
  yearBought: '',
  improvementsMade: 'no',
  improvements: '',
  lawyerFee: '2000',
  prepCosts: '2500',
  dischargeFee: '500',
  movingCosts: '1500',
}

const lawyerFeeOptions = [
  { value: 1500, label: 'Lean legal', description: 'Basic sale file.' },
  { value: 2000, label: 'Typical legal', description: 'Common sale estimate.' },
  { value: 3000, label: 'Complex legal', description: 'More admin or advice.' },
] as const

const prepCostOptions = [
  { value: 0, label: 'Skip prep', description: 'No staging or repairs.' },
  { value: 2500, label: 'Light prep', description: 'Cleaning and touch-ups.' },
  {
    value: 6000,
    label: 'Full prep',
    description: 'Staging and small repairs.',
  },
] as const

const dischargeFeeOptions = [
  { value: 0, label: 'None', description: 'No discharge/admin cost.' },
  { value: 500, label: 'Standard', description: 'Typical lender admin.' },
  { value: 1500, label: 'Higher', description: 'Penalty or extra admin.' },
] as const

const movingCostOptions = [
  { value: 0, label: 'None', description: 'No move-out allowance.' },
  { value: 1500, label: 'Light move', description: 'Cleaning and movers.' },
  { value: 3500, label: 'Full move', description: 'Larger move-out budget.' },
] as const

const checklistSections: ReadonlyArray<ChecklistSection> = [
  {
    title: 'Numbers',
    items: [
      {
        key: 'mortgage-payoff',
        label: 'Confirm mortgage payoff and discharge rules',
        description:
          'Get the current balance, prepayment language, and discharge cost from the lender.',
      },
      {
        key: 'property-tax',
        label: 'Check property tax and utility balances',
        description:
          'Know the prorations or arrears that may appear on closing.',
      },
      {
        key: 'pricing-range',
        label: 'Review active comparable listings',
        description:
          'Use the comparables tool to see the current competition before setting a range.',
      },
    ],
  },
  {
    title: 'Property',
    items: [
      {
        key: 'minor-repairs',
        label: 'Handle small repairs',
        description:
          'Fix obvious loose handles, lights, paint marks, and simple maintenance items.',
      },
      {
        key: 'declutter',
        label: 'Declutter the first showing path',
        description:
          'Start with entry, kitchen, living room, bathrooms, and the primary bedroom.',
      },
      {
        key: 'documents',
        label: 'Gather permits, warranties, and improvement receipts',
        description: 'Keep proof ready for upgrades that help explain value.',
      },
    ],
  },
  {
    title: 'Launch',
    items: [
      {
        key: 'photos',
        label: 'Prepare for photos and media',
        description:
          'Clean surfaces, open light paths, and remove temporary personal items.',
      },
      {
        key: 'showings',
        label: 'Choose showing windows',
        description:
          'Block predictable times so buyers can visit without constant rescheduling.',
      },
      {
        key: 'offer-docs',
        label: 'Know what offer terms matter',
        description:
          'Decide your preferred closing window, inclusions, and condition comfort level.',
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

const sellerCompSearch = (state: SellerCompState): ListingSearch => {
  let search: ListingSearch = {
    ...defaultListingSearch,
    status: 'Active',
    sort: 'newest',
    page: 1,
  }

  if (state.bedrooms) {
    search = {
      ...search,
      minBeds: Number.parseInt(state.bedrooms, 10),
      maxBeds: Number.parseInt(state.bedrooms, 10),
    }
  }
  if (state.bathrooms) {
    search = {
      ...search,
      minBaths: Number.parseInt(state.bathrooms, 10),
      maxBaths: Number.parseInt(state.bathrooms, 10),
    }
  }
  if (state.parking) {
    search = {
      ...search,
      minParking: Number.parseInt(state.parking, 10),
    }
  }
  if (state.garage === 'garage') {
    search = mergeSearchPatch(search, {
      minParking: search.minParking || 1,
      parkingFeatures: ['Garage'],
    })
  }

  for (const amenityKey of state.amenities) {
    const amenity = sellerAmenityOptions.find(
      (option) => option.key === amenityKey,
    )
    if (amenity) search = mergeSearchPatch(search, amenity.search)
  }

  return search
}

function SellerToolNav({ active }: { readonly active: SellerTool }) {
  return (
    <nav className="grid gap-3 md:grid-cols-4">
      {sellerToolLinks.map((item) => {
        const Icon = item.icon
        const isActive = item.key === active
        return (
          <Link
            to={item.to}
            className="rounded-lg border border-border bg-card p-4 text-foreground no-underline hover:border-border"
            data-active={isActive}
            key={item.key}
          >
            <span className="flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-md border border-border bg-card">
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

function SellerHero({
  eyebrow,
  title,
  description,
  active,
}: {
  readonly eyebrow: string
  readonly title: string
  readonly description: string
  readonly active: SellerTool
}) {
  return (
    <section className="grid gap-5 rounded-lg border border-border bg-card p-5">
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
      <SellerToolNav active={active} />
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

export function SellerLandingPage() {
  const [state, setState] = useState(defaultSellerCompState)
  const navigate = useNavigate({ from: '/sellers/' })
  const selectedAmenities = new Set(state.amenities)
  const search = sellerCompSearch(state)
  const selectedFilterCount = [
    state.bedrooms,
    state.bathrooms,
    state.parking,
    state.garage === 'garage',
    ...state.amenities,
  ].filter(Boolean).length

  const update = (patch: Partial<SellerCompState>) =>
    setState((current) => ({ ...current, ...patch }))

  const toggleAmenity = (key: SellerAmenityKey) => {
    const next = selectedAmenities.has(key)
      ? state.amenities.filter((item) => item !== key)
      : [...state.amenities, key]
    update({ amenities: next })
  }

  return (
    <main className="page-wrap grid gap-6 py-8">
      <SellerHero
        eyebrow="Seller research"
        title="Check the market against a home like yours."
        description="Build a quick comparable profile, then jump into matching active listings before you choose a pricing lane."
        active="research"
      />

      <section className="grid gap-5 lg:grid-cols-[1fr_340px]">
        <form
          className="grid gap-5 rounded-lg border border-border bg-card p-5"
          onSubmit={(event) => {
            event.preventDefault()
            void navigate({
              to: '/sellers/comparables',
              search,
            })
          }}
        >
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-foreground">
                Quick comp check
              </p>
              <h2 className="display-title mt-2 text-3xl font-bold text-foreground">
                Describe the house.
              </h2>
            </div>
            <span className="rounded-full border border-border bg-card px-3 py-1 text-xs font-extrabold text-foreground">
              {number.format(selectedFilterCount)} filters selected
            </span>
          </div>

          <p className="rounded-lg border border-border bg-card p-3 text-sm font-semibold leading-6 text-foreground">
            The more detailed the filters, the more accurate the similar
            listings. Start with beds, baths, parking, garage, and amenities,
            then refine the results on the comparables page.
          </p>

          <div className="grid gap-4 sm:grid-cols-3">
            <NumericSelect
              label="Bedrooms"
              value={state.bedrooms}
              placeholder="Any bedrooms"
              options={countOptions.slice(1)}
              onChange={(bedrooms) => update({ bedrooms })}
            />
            <NumericSelect
              label="Bathrooms"
              value={state.bathrooms}
              placeholder="Any bathrooms"
              options={countOptions.slice(1)}
              onChange={(bathrooms) => update({ bathrooms })}
            />
            <NumericSelect
              label="Parking"
              value={state.parking}
              placeholder="Any parking"
              options={countOptions}
              onChange={(parking) => update({ parking })}
            />
          </div>

          <fieldset className="grid gap-3">
            <legend className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground">
              Garage
            </legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                {
                  value: 'any',
                  label: 'Any garage status',
                  description: 'Do not restrict by parking feature.',
                },
                {
                  value: 'garage',
                  label: 'Garage listed',
                  description: 'Prioritize listings with garage features.',
                },
              ].map((option) => (
                <label
                  className="flex cursor-pointer gap-3 rounded-lg border border-border bg-card p-3 text-sm text-foreground"
                  key={option.value}
                >
                  <input
                    type="radio"
                    name="garage"
                    value={option.value}
                    checked={state.garage === option.value}
                    onChange={() =>
                      update({
                        garage: option.value as SellerCompState['garage'],
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
              Amenities
            </legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {sellerAmenityOptions.map((option) => (
                <label
                  className="flex cursor-pointer gap-3 rounded-lg border border-border bg-card p-3 text-sm text-foreground"
                  key={option.key}
                >
                  <input
                    type="checkbox"
                    checked={selectedAmenities.has(option.key)}
                    onChange={() => toggleAmenity(option.key)}
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
              Quick comp check
            </Button>
            <Button
              nativeButton={false}
              render={<Link to="/sellers/calculator" />}
              variant="outline"
            >
              <Calculator />
              Estimate take-home
            </Button>
          </div>
        </form>

        <aside className="grid content-start gap-3 rounded-lg border border-border bg-card p-5">
          <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-foreground">
            Seller tools
          </p>
          <ToolLink
            to="/sellers/comparables"
            title="Compare listings"
            description="See the matching listings grid."
            icon={SlidersHorizontal}
          />
          <ToolLink
            to="/sellers/calculator"
            title="Calculate proceeds"
            description="Run the napkin math with debt and costs."
            icon={Calculator}
          />
          <ToolLink
            to="/sellers/get-ready"
            title="Prepare to sell"
            description="Work through the selling checklist."
            icon={ListChecks}
          />
        </aside>
      </section>
    </main>
  )
}

function ToolLink({
  to,
  title,
  description,
  icon: Icon,
}: {
  readonly to: (typeof sellerToolLinks)[number]['to']
  readonly title: string
  readonly description: string
  readonly icon: typeof Search
}) {
  return (
    <Link
      to={to}
      className="flex items-center justify-between gap-3 rounded-md border border-border bg-card px-3 py-3 text-foreground no-underline hover:border-border"
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

function CostRadioGroup({
  title,
  name,
  value,
  options,
  onChange,
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
}) {
  return (
    <fieldset className="grid gap-3 rounded-lg border border-border bg-card p-4">
      <legend className="px-1 text-xs font-semibold uppercase tracking-[0.16em] text-foreground">
        {title}
      </legend>
      <div className="grid gap-3 sm:grid-cols-3">
        {options.map((option) => (
          <label
            className="flex cursor-pointer gap-3 rounded-md border border-border bg-card p-3 text-sm text-foreground"
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
                {money.format(option.value)}
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

export function SellerCalculatorPage() {
  const [state, setState] = useState(defaultCalculatorState)
  const purchasePrice = numericValue(state.purchasePrice)
  const yearBought = numericValue(state.yearBought)
  const validYear =
    yearBought >= 1900 && yearBought <= currentYear ? yearBought : currentYear
  const yearsHeld = purchasePrice > 0 ? Math.max(0, currentYear - validYear) : 0
  const improvements =
    state.improvementsMade === 'yes' ? numericValue(state.improvements) : 0
  const estimatedValue =
    purchasePrice > 0
      ? Math.round(purchasePrice * Math.pow(1.05, yearsHeld) + improvements)
      : 0
  const brokerFee = Math.round(estimatedValue * 0.05)
  const debtTotal =
    numericValue(state.mortgageDebt) +
    numericValue(state.helocDebt) +
    numericValue(state.propertyDebt)
  const commonCosts =
    numericValue(state.lawyerFee) +
    numericValue(state.prepCosts) +
    numericValue(state.dischargeFee) +
    numericValue(state.movingCosts)
  const takeHome = estimatedValue - brokerFee - commonCosts - debtTotal

  const update = (patch: Partial<CalculatorState>) =>
    setState((current) => ({ ...current, ...patch }))

  const summaryRows = [
    { label: 'Estimated sale value', value: estimatedValue },
    { label: 'Broker fee at 5%', value: -brokerFee },
    { label: 'Selected selling costs', value: -commonCosts },
    { label: 'Property debt payoff', value: -debtTotal },
    { label: 'Estimated take-home', value: takeHome, strong: true },
  ]

  return (
    <main className="page-wrap grid gap-6 py-8">
      <SellerHero
        eyebrow="Seller calculator"
        title="Estimate the cash you may take home."
        description="This is napkin math: purchase price grows at 5% per year, improvements are added, then broker fee, debts, legal, and common selling costs are deducted."
        active="calculator"
      />

      <section className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <div className="grid gap-5 rounded-lg border border-border bg-card p-5">
          <div className="grid gap-4 sm:grid-cols-3">
            <NumericInput
              label="Current mortgage debt"
              value={state.mortgageDebt}
              onChange={(mortgageDebt) => update({ mortgageDebt })}
            />
            <NumericInput
              label="HELOC debt"
              value={state.helocDebt}
              onChange={(helocDebt) => update({ helocDebt })}
            />
            <NumericInput
              label="Other property debt"
              value={state.propertyDebt}
              onChange={(propertyDebt) => update({ propertyDebt })}
            />
            <NumericInput
              label="Purchase price"
              value={state.purchasePrice}
              onChange={(nextPurchasePrice) =>
                update({ purchasePrice: nextPurchasePrice })
              }
            />
            <NumericInput
              label="Year bought"
              value={state.yearBought}
              min={1900}
              max={currentYear}
              onChange={(nextYearBought) =>
                update({ yearBought: nextYearBought })
              }
            />
          </div>

          <fieldset className="grid gap-3">
            <legend className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground">
              Improvements
            </legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                {
                  value: 'no',
                  label: 'No improvement budget',
                  description: 'Use appreciation only.',
                },
                {
                  value: 'yes',
                  label: 'Add improvements',
                  description: 'Add renovation or upgrade dollars.',
                },
              ].map((option) => (
                <label
                  className="flex cursor-pointer gap-3 rounded-lg border border-border bg-card p-3 text-sm text-foreground"
                  key={option.value}
                >
                  <input
                    type="radio"
                    name="improvementsMade"
                    value={option.value}
                    checked={state.improvementsMade === option.value}
                    onChange={() =>
                      update({
                        improvementsMade:
                          option.value as CalculatorState['improvementsMade'],
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
            {state.improvementsMade === 'yes' ? (
              <NumericInput
                label="Improvement dollars"
                value={state.improvements}
                onChange={(nextImprovements) =>
                  update({ improvements: nextImprovements })
                }
              />
            ) : null}
          </fieldset>

          <CostRadioGroup
            title="Lawyer fees"
            name="lawyerFee"
            value={state.lawyerFee}
            options={lawyerFeeOptions}
            onChange={(lawyerFee) => update({ lawyerFee })}
          />
          <CostRadioGroup
            title="Prep costs"
            name="prepCosts"
            value={state.prepCosts}
            options={prepCostOptions}
            onChange={(prepCosts) => update({ prepCosts })}
          />
          <CostRadioGroup
            title="Mortgage discharge"
            name="dischargeFee"
            value={state.dischargeFee}
            options={dischargeFeeOptions}
            onChange={(dischargeFee) => update({ dischargeFee })}
          />
          <CostRadioGroup
            title="Moving and cleaning"
            name="movingCosts"
            value={state.movingCosts}
            options={movingCostOptions}
            onChange={(movingCosts) => update({ movingCosts })}
          />
        </div>

        <aside className="grid content-start gap-4 rounded-lg border border-border bg-card p-5">
          <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-foreground">
            Net proceeds
          </p>
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="display-title text-4xl font-bold text-foreground">
              {money.format(takeHome)}
            </p>
            <p className="mt-2 text-sm leading-6 text-foreground">
              Based on {number.format(yearsHeld)} years at 5% annual
              appreciation.
            </p>
          </div>
          <div className="grid gap-2">
            {summaryRows.map((row) => (
              <div
                className="flex items-center justify-between gap-3 rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground"
                key={row.label}
              >
                <span className={row.strong ? 'font-extrabold' : undefined}>
                  {row.label}
                </span>
                <span className={row.strong ? 'font-extrabold' : undefined}>
                  {money.format(row.value)}
                </span>
              </div>
            ))}
          </div>
        </aside>
      </section>
    </main>
  )
}

export function SellerGetReadyPage() {
  const [checked, setChecked] = useState<ReadonlyArray<string>>([])
  const checkedSet = useMemo(() => new Set(checked), [checked])
  const allItems = checklistSections.flatMap((section) => section.items)
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
      <SellerHero
        eyebrow="Seller checklist"
        title="Get the property ready before listing."
        description="Work through the practical steps that make pricing, launch, showings, and closing smoother."
        active="get-ready"
      />

      <section className="grid gap-5 lg:grid-cols-[320px_1fr]">
        <aside className="grid content-start gap-4 rounded-lg border border-border bg-card p-5">
          <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-foreground">
            Progress
          </p>
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="display-title text-4xl font-bold text-foreground">
              {number.format(progress)}%
            </p>
            <p className="mt-2 text-sm leading-6 text-foreground">
              {number.format(completedCount)} of{' '}
              {number.format(allItems.length)} items complete.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => setChecked([])}
            disabled={checked.length === 0}
          >
            Reset checklist
          </Button>
        </aside>

        <div className="grid gap-4">
          {checklistSections.map((section) => (
            <section
              className="grid gap-3 rounded-lg border border-border bg-card p-5"
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
                      className="flex cursor-pointer gap-3 rounded-md border border-border bg-card p-4 text-foreground"
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

export function SellerComparableIntro() {
  return (
    <div className="rounded-lg border border-border bg-card p-4 text-sm leading-6 text-foreground">
      <p className="font-extrabold">Comparable search reminder</p>
      <p className="mt-1">
        The more specific the filters, the tighter the comp set. Use the filter
        button to refine bedrooms, bathrooms, parking, property type, garage
        features, and amenities before comparing results.
      </p>
    </div>
  )
}
