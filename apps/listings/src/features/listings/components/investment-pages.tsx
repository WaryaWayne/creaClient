import { useMemo, useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import {
  ArrowRight,
  BadgeDollarSign,
  Building2,
  Calculator,
  CheckCircle2,
  ClipboardCheck,
  Home,
  Landmark,
  ListChecks,
  Percent,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  TrendingUp,
  WalletCards,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import {
  NativeSelect,
  NativeSelectOption,
} from '@workspace/ui/components/native-select'

import { defaultListingSearch } from '../search'
import { AskExpertButton, ExpertHelpCallout } from './contact'
import { money, number } from './utils'

import type { ListingSearch } from '../search'

type InvestmentTool =
  | 'screen'
  | 'opportunities'
  | 'calculator'
  | 'due-diligence'

const investmentWorkspaceId = 'investment-workspace'

type InvestmentStrategy = 'cash-flow' | 'house-hack' | 'value-add'

type InvestorSignalKey =
  | 'finishedBasement'
  | 'garage'
  | 'centralAir'
  | 'forcedAir'
  | 'dishwasher'

type InvestmentProfileState = {
  readonly strategy: InvestmentStrategy
  readonly maxPrice: string
  readonly minBeds: string
  readonly minBaths: string
  readonly minParking: string
  readonly signals: ReadonlyArray<InvestorSignalKey>
}

type InvestmentCalculatorState = {
  readonly purchasePrice: string
  readonly downPaymentPercent: string
  readonly monthlyRent: string
  readonly vacancyPercent: string
  readonly annualTaxes: string
  readonly annualInsurance: string
  readonly maintenancePercent: string
  readonly interestRate: string
  readonly amortizationYears: string
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

const investmentToolLinks = [
  {
    key: 'screen',
    title: 'Investor screen',
    description: 'Build a quick profile before reviewing matches.',
    to: '/investments',
    icon: Home,
  },
  {
    key: 'opportunities',
    title: 'Opportunities',
    description: 'Search active listings with investor filters.',
    to: '/investments/opportunities',
    icon: Search,
  },
  {
    key: 'calculator',
    title: 'Deal calculator',
    description: 'Estimate cash flow, cap rate, and break-even rent.',
    to: '/investments/calculator',
    icon: Calculator,
  },
  {
    key: 'due-diligence',
    title: 'Due diligence',
    description: 'Check the practical questions before offering.',
    to: '/investments/due-diligence',
    icon: ClipboardCheck,
  },
] as const

const defaultInvestmentProfileState: InvestmentProfileState = {
  strategy: 'cash-flow',
  maxPrice: '',
  minBeds: '',
  minBaths: '',
  minParking: '1',
  signals: [],
}

const investorSignalOptions = [
  {
    key: 'finishedBasement',
    label: 'Finished lower level',
    description: 'Useful when screening for house-hack or suite potential.',
    search: { basement: ['Finished'] },
  },
  {
    key: 'garage',
    label: 'Garage or covered parking',
    description: 'Adds a parking feature and keeps one parking spot required.',
    search: { minParking: 1, parkingFeatures: ['Garage'] },
  },
  {
    key: 'centralAir',
    label: 'Central air',
    description: 'Flags listings with a common tenant comfort feature.',
    search: { cooling: ['Central air conditioning'] },
  },
  {
    key: 'forcedAir',
    label: 'Forced air heat',
    description: 'Keeps common forced-air systems in the first pass.',
    search: { heating: ['Forced air'] },
  },
  {
    key: 'dishwasher',
    label: 'Dishwasher',
    description: 'Adds a practical rental amenity signal.',
    search: { appliances: ['Dishwasher'] },
  },
] as const satisfies ReadonlyArray<{
  readonly key: InvestorSignalKey
  readonly label: string
  readonly description: string
  readonly search: Partial<ListingSearch>
}>

const strategyOptions = [
  {
    value: 'cash-flow',
    label: 'Cash-flow rental',
    description: 'Start with active, lower-price homes with parking.',
  },
  {
    value: 'house-hack',
    label: 'House hack',
    description: 'Start with more bedrooms, parking, and lower-level signals.',
  },
  {
    value: 'value-add',
    label: 'Value-add search',
    description: 'Start broad, then use price and filters to remove misses.',
  },
] as const satisfies ReadonlyArray<{
  readonly value: InvestmentStrategy
  readonly label: string
  readonly description: string
}>

const defaultCalculatorState: InvestmentCalculatorState = {
  purchasePrice: '500000',
  downPaymentPercent: '20',
  monthlyRent: '3000',
  vacancyPercent: '5',
  annualTaxes: '4500',
  annualInsurance: '1800',
  maintenancePercent: '5',
  interestRate: '5.25',
  amortizationYears: '25',
}

const dueDiligenceSections: ReadonlyArray<ChecklistSection> = [
  {
    title: 'Income',
    items: [
      {
        key: 'rent-comps',
        label: 'Can the rent be supported by recent rental comps?',
        description:
          'Save at least three nearby lease examples before treating projected rent as usable.',
      },
      {
        key: 'vacancy',
        label: 'Is the vacancy assumption realistic for the location?',
        description:
          'Check commute routes, schools, transit, seasonality, and competing rentals.',
      },
      {
        key: 'lease-rules',
        label: 'Are current leases, deposits, and notices understood?',
        description:
          'If occupied, verify rent, deposits, inclusions, arrears, renewal terms, and notice requirements.',
      },
    ],
  },
  {
    title: 'Expenses',
    items: [
      {
        key: 'taxes',
        label: 'Are property taxes verified from the source?',
        description:
          'Use municipal records or the tax bill, not only listing copy.',
      },
      {
        key: 'insurance',
        label: 'Can an insurer quote the intended use?',
        description:
          'Confirm rental use, vacancy exposure, short-term rental restrictions, and required coverage.',
      },
      {
        key: 'maintenance',
        label: 'Is maintenance sized to the property condition?',
        description:
          'Separate routine maintenance from known repairs, capital replacements, and deferred items.',
      },
    ],
  },
  {
    title: 'Property',
    items: [
      {
        key: 'zoning',
        label: 'Does zoning support the intended rental plan?',
        description:
          'Check legal use, accessory unit rules, parking minimums, and local licensing.',
      },
      {
        key: 'systems',
        label:
          'Are roof, HVAC, electrical, plumbing, and envelope risks known?',
        description:
          'Use disclosure, permits, inspection notes, photos, and age of systems to price risk.',
      },
      {
        key: 'utilities',
        label: 'Are utilities and metering clear?',
        description:
          'Know who pays heat, hydro, water, internet, and whether units are separately metered.',
      },
    ],
  },
  {
    title: 'Offer',
    items: [
      {
        key: 'financing',
        label: 'Does the financing survive the screened numbers?',
        description:
          'Stress the rate, amortization, down payment, and lender rental-offset treatment.',
      },
      {
        key: 'conditions',
        label: 'Are conditions matched to the risk?',
        description:
          'Use financing, inspection, insurance, document review, and lease review where needed.',
      },
      {
        key: 'walk-away',
        label: 'Is the walk-away number written down?',
        description:
          'Decide the maximum price before offering so negotiations do not erase the return.',
      },
    ],
  },
]

const cleanNumericInput = (value: string) => value.replace(/\D/g, '')

const cleanDecimalInput = (value: string) => {
  const cleaned = value.replace(/[^\d.]/g, '')
  const [head = '', ...tail] = cleaned.split('.')
  return tail.length === 0 ? head : `${head}.${tail.join('')}`
}

const numericValue = (value: string) => {
  if (!/^\d+$/.test(value)) return 0
  const parsed = Number.parseInt(value, 10)
  return Number.isSafeInteger(parsed) ? parsed : 0
}

const decimalValue = (value: string) => {
  const parsed = Number.parseFloat(value)
  return Number.isFinite(parsed) ? parsed : 0
}

const clampRate = (value: number) => Math.min(Math.max(value, 0), 100) / 100

const formatRate = (value: number) => `${number.format(value)}%`

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

const investmentSearch = (state: InvestmentProfileState): ListingSearch => {
  let search: ListingSearch = {
    ...defaultListingSearch,
    status: 'Active',
    sort: 'price-asc',
    page: 1,
  }

  if (state.strategy === 'cash-flow') {
    search = {
      ...search,
      minBeds: 2,
      minParking: 1,
    }
  }

  if (state.strategy === 'house-hack') {
    search = mergeSearchPatch(
      {
        ...search,
        minBeds: 3,
        minParking: 1,
      },
      {
        basement: ['Finished'],
      },
    )
  }

  if (state.maxPrice.length > 0) {
    search = {
      ...search,
      maxPrice: numericValue(state.maxPrice),
    }
  }

  if (state.minBeds.length > 0) {
    search = {
      ...search,
      minBeds: numericValue(state.minBeds),
    }
  }

  if (state.minBaths.length > 0) {
    search = {
      ...search,
      minBaths: numericValue(state.minBaths),
    }
  }

  if (state.minParking.length > 0) {
    search = {
      ...search,
      minParking: numericValue(state.minParking),
    }
  }

  for (const signalKey of state.signals) {
    const signal = investorSignalOptions.find(
      (option) => option.key === signalKey,
    )
    if (signal !== undefined) search = mergeSearchPatch(search, signal.search)
  }

  return search
}

function InvestmentToolNav({ active }: { readonly active: InvestmentTool }) {
  return (
    <nav className="grid gap-3 md:grid-cols-4">
      {investmentToolLinks.map((item) => {
        const Icon = item.icon
        const isActive = item.key === active
        return (
          <Link
            to={item.to}
            hash={investmentWorkspaceId}
            className={`rounded-lg border p-4 text-foreground no-underline ${
              isActive
                ? 'border-foreground bg-background shadow-sm'
                : 'border-border bg-card hover:border-foreground/50'
            }`}
            data-active={isActive}
            aria-current={isActive ? 'page' : undefined}
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

function InvestmentHero({
  eyebrow,
  title,
  description,
  active,
}: {
  readonly eyebrow: string
  readonly title: string
  readonly description: string
  readonly active: InvestmentTool
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
        <div className="mt-5 flex flex-wrap gap-3">
          <AskExpertButton
            context={{
              source: `investment-${active}-hero`,
              audience: 'investor',
              tool: active,
            }}
            label="Ask an investment expert"
            defaultMessage="I need help deciding whether this investment path is worth a closer look."
          />
          <Button
            nativeButton={false}
            render={
              <Link
                to="/investments/opportunities"
                hash={investmentWorkspaceId}
                search={investmentSearch(defaultInvestmentProfileState)}
              />
            }
            variant="outline"
          >
            <Search />
            Search opportunities
          </Button>
        </div>
      </div>
      <InvestmentToolNav active={active} />
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

function NumericInput({
  label,
  value,
  onChange,
  min = 0,
  max,
  step = 1,
  decimal = false,
}: {
  readonly label: string
  readonly value: string
  readonly onChange: (value: string) => void
  readonly min?: number
  readonly max?: number
  readonly step?: number
  readonly decimal?: boolean
}) {
  return (
    <label className="grid gap-1.5">
      <span className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground">
        {label}
      </span>
      <Input
        type="number"
        inputMode={decimal ? 'decimal' : 'numeric'}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) =>
          onChange(
            decimal
              ? cleanDecimalInput(event.target.value)
              : cleanNumericInput(event.target.value),
          )
        }
        className="bg-background"
      />
    </label>
  )
}

function ToolLink({
  to,
  title,
  description,
  icon: Icon,
}: {
  readonly to: (typeof investmentToolLinks)[number]['to']
  readonly title: string
  readonly description: string
  readonly icon: LucideIcon
}) {
  return (
    <Link
      to={to}
      hash={investmentWorkspaceId}
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

export function InvestmentLandingPage() {
  const [state, setState] = useState(defaultInvestmentProfileState)
  const navigate = useNavigate({ from: '/investments/' })
  const selectedSignals = new Set(state.signals)
  const search = investmentSearch(state)
  const selectedFilterCount = [
    state.strategy,
    state.maxPrice,
    state.minBeds,
    state.minBaths,
    state.minParking,
    ...state.signals,
  ].filter(Boolean).length

  const update = (patch: Partial<InvestmentProfileState>) =>
    setState((current) => ({ ...current, ...patch }))

  const toggleSignal = (key: InvestorSignalKey) => {
    const next = selectedSignals.has(key)
      ? state.signals.filter((item) => item !== key)
      : [...state.signals, key]
    update({ signals: next })
  }

  return (
    <main className="page-wrap grid gap-6 py-8">
      <InvestmentHero
        eyebrow="Investor screen"
        title="Screen listings before the deal math takes over."
        description="Build a first-pass investor profile, open matching active listings, then use the calculator and checklist before a property reaches your shortlist."
        active="screen"
      />

      <section
        id={investmentWorkspaceId}
        className="grid scroll-mt-24 gap-5 lg:grid-cols-[1fr_340px]"
      >
        <form
          className="grid gap-5 rounded-lg border border-border bg-card p-5"
          onSubmit={(event) => {
            event.preventDefault()
            void navigate({
              to: '/investments/opportunities',
              search,
            })
          }}
        >
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-foreground">
                Quick investment screen
              </p>
              <h2 className="display-title mt-2 text-3xl font-bold text-foreground">
                Define the buy box.
              </h2>
            </div>
            <span className="rounded-full border border-border bg-card px-3 py-1 text-xs font-extrabold text-foreground">
              {number.format(selectedFilterCount)} filters selected
            </span>
          </div>

          <p className="rounded-lg border border-border bg-card p-3 text-sm font-semibold leading-6 text-foreground">
            This screen starts with active listings sorted by lower price. Use
            it to remove obvious misses, then tighten the results with the
            filter button on the opportunities page.
          </p>

          <fieldset className="grid gap-3">
            <legend className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground">
              Strategy
            </legend>
            <div className="grid gap-3 sm:grid-cols-3">
              {strategyOptions.map((option) => (
                <label
                  className="flex cursor-pointer gap-3 rounded-lg border border-border bg-card p-3 text-sm text-foreground"
                  key={option.value}
                >
                  <input
                    type="radio"
                    name="strategy"
                    value={option.value}
                    checked={state.strategy === option.value}
                    onChange={() => update({ strategy: option.value })}
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

          <div className="grid gap-4 sm:grid-cols-4">
            <NumericInput
              label="Max price"
              value={state.maxPrice}
              onChange={(maxPrice) => update({ maxPrice })}
            />
            <NumericSelect
              label="Minimum bedrooms"
              value={state.minBeds}
              placeholder="Any beds"
              options={countOptions.slice(1)}
              onChange={(minBeds) => update({ minBeds })}
            />
            <NumericSelect
              label="Minimum bathrooms"
              value={state.minBaths}
              placeholder="Any baths"
              options={countOptions.slice(1)}
              onChange={(minBaths) => update({ minBaths })}
            />
            <NumericSelect
              label="Minimum parking"
              value={state.minParking}
              placeholder="Any parking"
              options={countOptions}
              onChange={(minParking) => update({ minParking })}
            />
          </div>

          <fieldset className="grid gap-3">
            <legend className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground">
              Rental signals
            </legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {investorSignalOptions.map((option) => (
                <label
                  className="flex cursor-pointer gap-3 rounded-lg border border-border bg-card p-3 text-sm text-foreground"
                  key={option.key}
                >
                  <input
                    type="checkbox"
                    checked={selectedSignals.has(option.key)}
                    onChange={() => toggleSignal(option.key)}
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
              Search opportunities
            </Button>
            <Button
              nativeButton={false}
              render={
                <Link
                  to="/investments/calculator"
                  hash={investmentWorkspaceId}
                />
              }
              variant="outline"
            >
              <Calculator />
              Run deal math
            </Button>
          </div>
        </form>

        <aside className="grid content-start gap-3 rounded-lg border border-border bg-card p-5">
          <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-foreground">
            Investor tools
          </p>
          <ToolLink
            to="/investments/opportunities"
            title="Search opportunities"
            description="Review matching active listings."
            icon={SlidersHorizontal}
          />
          <ToolLink
            to="/investments/calculator"
            title="Calculate the deal"
            description="Estimate cash flow and cap rate."
            icon={Calculator}
          />
          <ToolLink
            to="/investments/due-diligence"
            title="Check diligence"
            description="Work through offer-readiness questions."
            icon={ListChecks}
          />
          <ExpertHelpCallout
            context={{
              source: 'investment-tools-sidebar',
              audience: 'investor',
              tool: 'screen',
            }}
            framed={false}
            title="Need help sizing the deal?"
            description="Send the strategy, price range, or risk you are unsure about and we will help sharpen the screen."
            buttonLabel="Ask about the deal"
            defaultMessage="I need help screening an investment listing or buy box."
          />
        </aside>
      </section>
    </main>
  )
}

export function InvestmentCalculatorPage() {
  const [state, setState] = useState(defaultCalculatorState)
  const purchasePrice = numericValue(state.purchasePrice)
  const downPaymentRate = clampRate(decimalValue(state.downPaymentPercent))
  const monthlyRent = numericValue(state.monthlyRent)
  const vacancyRate = clampRate(decimalValue(state.vacancyPercent))
  const maintenanceRate = clampRate(decimalValue(state.maintenancePercent))
  const annualTaxes = numericValue(state.annualTaxes)
  const annualInsurance = numericValue(state.annualInsurance)
  const interestRate = Math.max(0, decimalValue(state.interestRate)) / 100
  const amortizationYears = Math.max(1, decimalValue(state.amortizationYears))

  const downPayment = Math.round(purchasePrice * downPaymentRate)
  const loanAmount = Math.max(0, purchasePrice - downPayment)
  const monthlyInterestRate = interestRate / 12
  const paymentCount = amortizationYears * 12
  const monthlyFinancing =
    loanAmount <= 0
      ? 0
      : monthlyInterestRate === 0
        ? loanAmount / paymentCount
        : (loanAmount *
            monthlyInterestRate *
            Math.pow(1 + monthlyInterestRate, paymentCount)) /
          (Math.pow(1 + monthlyInterestRate, paymentCount) - 1)
  const monthlyVacancy = monthlyRent * vacancyRate
  const monthlyMaintenance = monthlyRent * maintenanceRate
  const monthlyTaxes = annualTaxes / 12
  const monthlyInsurance = annualInsurance / 12
  const monthlyNoi =
    monthlyRent -
    monthlyVacancy -
    monthlyTaxes -
    monthlyInsurance -
    monthlyMaintenance
  const monthlyCashFlow = monthlyNoi - monthlyFinancing
  const annualNoi = monthlyNoi * 12
  const capRate = purchasePrice > 0 ? (annualNoi / purchasePrice) * 100 : 0
  const variableExpenseRate = Math.min(0.95, vacancyRate + maintenanceRate)
  const fixedMonthlyCosts = monthlyFinancing + monthlyTaxes + monthlyInsurance
  const breakEvenRent =
    fixedMonthlyCosts > 0 ? fixedMonthlyCosts / (1 - variableExpenseRate) : 0

  const update = (patch: Partial<InvestmentCalculatorState>) =>
    setState((current) => ({ ...current, ...patch }))

  const summaryRows = [
    { label: 'Gross rent', value: monthlyRent },
    { label: 'Vacancy allowance', value: -monthlyVacancy },
    { label: 'Taxes', value: -monthlyTaxes },
    { label: 'Insurance', value: -monthlyInsurance },
    { label: 'Maintenance reserve', value: -monthlyMaintenance },
    { label: 'Financing payment', value: -monthlyFinancing },
    { label: 'Monthly cash flow', value: monthlyCashFlow, strong: true },
  ]

  return (
    <main className="page-wrap grid gap-6 py-8">
      <InvestmentHero
        eyebrow="Deal calculator"
        title="Stress-test the rent against the carrying costs."
        description="Estimate down payment, financing, operating costs, monthly cash flow, cap rate, and the rent needed to break even before a listing moves to diligence."
        active="calculator"
      />

      <section
        id={investmentWorkspaceId}
        className="grid scroll-mt-24 gap-5 lg:grid-cols-[1fr_380px]"
      >
        <div className="grid gap-5 rounded-lg border border-border bg-card p-5">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-foreground">
              Purchase and rent
            </p>
            <h2 className="display-title mt-2 text-3xl font-bold text-foreground">
              Enter the base assumptions.
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <NumericInput
              label="Purchase price"
              value={state.purchasePrice}
              onChange={(purchasePrice) => update({ purchasePrice })}
            />
            <NumericInput
              label="Down payment %"
              value={state.downPaymentPercent}
              max={100}
              step={0.25}
              decimal
              onChange={(downPaymentPercent) => update({ downPaymentPercent })}
            />
            <NumericInput
              label="Monthly rent"
              value={state.monthlyRent}
              onChange={(monthlyRent) => update({ monthlyRent })}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-4">
            <NumericInput
              label="Vacancy %"
              value={state.vacancyPercent}
              max={100}
              step={0.25}
              decimal
              onChange={(vacancyPercent) => update({ vacancyPercent })}
            />
            <NumericInput
              label="Annual taxes"
              value={state.annualTaxes}
              onChange={(annualTaxes) => update({ annualTaxes })}
            />
            <NumericInput
              label="Annual insurance"
              value={state.annualInsurance}
              onChange={(annualInsurance) => update({ annualInsurance })}
            />
            <NumericInput
              label="Maintenance %"
              value={state.maintenancePercent}
              max={100}
              step={0.25}
              decimal
              onChange={(maintenancePercent) => update({ maintenancePercent })}
            />
          </div>

          <fieldset className="grid gap-3 rounded-lg border border-border bg-card p-4">
            <legend className="px-1 text-xs font-semibold uppercase tracking-[0.16em] text-foreground">
              Financing
            </legend>
            <div className="grid gap-4 sm:grid-cols-3">
              <NumericInput
                label="Interest rate %"
                value={state.interestRate}
                step={0.05}
                decimal
                onChange={(interestRate) => update({ interestRate })}
              />
              <NumericInput
                label="Amortization years"
                value={state.amortizationYears}
                min={1}
                max={40}
                step={1}
                decimal
                onChange={(amortizationYears) => update({ amortizationYears })}
              />
              <div className="grid content-end gap-1.5 rounded-md border border-border bg-card p-3 text-sm text-foreground">
                <span className="text-xs font-semibold uppercase tracking-[0.16em]">
                  Loan amount
                </span>
                <span className="text-xl font-extrabold">
                  {money.format(loanAmount)}
                </span>
              </div>
            </div>
          </fieldset>

          <p className="rounded-lg border border-border bg-card p-3 text-sm font-semibold leading-6 text-foreground">
            This calculator is only a screening tool. Verify rent, tax,
            insurance, maintenance, financing, and legal use before relying on
            the result.
          </p>
        </div>

        <aside className="grid content-start gap-4 rounded-lg border border-border bg-card p-5">
          <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-foreground">
            Deal snapshot
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <MetricTile
              icon={WalletCards}
              label="Cash flow"
              value={money.format(monthlyCashFlow)}
              detail="Estimated monthly after financing."
            />
            <MetricTile
              icon={Percent}
              label="Cap rate"
              value={formatRate(capRate)}
              detail="Annual NOI divided by purchase price."
            />
            <MetricTile
              icon={BadgeDollarSign}
              label="Break-even rent"
              value={money.format(breakEvenRent)}
              detail="Rent needed to cover debt and selected costs."
            />
            <MetricTile
              icon={Landmark}
              label="Down payment"
              value={money.format(downPayment)}
              detail={`${formatRate(downPaymentRate * 100)} of purchase price.`}
            />
          </div>
          <div className="grid gap-2">
            {summaryRows.map((row) => (
              <div
                className="flex items-center justify-between gap-3 rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground"
                key={row.label}
              >
                <span
                  className={row.strong === true ? 'font-extrabold' : undefined}
                >
                  {row.label}
                </span>
                <span
                  className={row.strong === true ? 'font-extrabold' : undefined}
                >
                  {money.format(Math.round(row.value))}
                </span>
              </div>
            ))}
          </div>
          <ExpertHelpCallout
            context={{
              source: 'investment-calculator-sidebar',
              audience: 'investor',
              tool: 'calculator',
              details: {
                purchasePrice,
                monthlyRent,
                monthlyCashFlow: Math.round(monthlyCashFlow),
                capRate: Math.round(capRate * 100) / 100,
              },
            }}
            framed={false}
            title="Need a second look at the deal?"
            description="Send the snapshot with your question and we will help separate math risk from listing risk."
            buttonLabel="Ask about the math"
            defaultMessage="I need help reviewing this investment calculator result."
          />
        </aside>
      </section>
    </main>
  )
}

function MetricTile({
  icon: Icon,
  label,
  value,
  detail,
}: {
  readonly icon: LucideIcon
  readonly label: string
  readonly value: string
  readonly detail: string
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 text-foreground">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em]">
        <Icon className="size-4" />
        {label}
      </div>
      <p className="display-title mt-2 text-3xl font-bold">{value}</p>
      <p className="mt-1 text-sm leading-6">{detail}</p>
    </div>
  )
}

export function InvestmentDueDiligencePage() {
  const [checked, setChecked] = useState<ReadonlyArray<string>>([])
  const checkedSet = useMemo(() => new Set(checked), [checked])
  const allItems = dueDiligenceSections.flatMap((section) => section.items)
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
      <InvestmentHero
        eyebrow="Due diligence"
        title="Answer the risk questions before the offer."
        description="Use this checklist to decide whether a listing deserves a deeper look, a sharper price, more conditions, or a clean pass."
        active="due-diligence"
      />

      <section
        id={investmentWorkspaceId}
        className="grid scroll-mt-24 gap-5 lg:grid-cols-[320px_1fr]"
      >
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
              {number.format(allItems.length)} checks complete.
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
          <ExpertHelpCallout
            context={{
              source: 'investment-diligence-sidebar',
              audience: 'investor',
              tool: 'due-diligence',
              details: {
                completedCount,
                progress,
              },
            }}
            framed={false}
            title="Stuck on a risk question?"
            description="Send the diligence item and we will help decide what to verify before offering."
            buttonLabel="Ask about diligence"
            defaultMessage="I need help deciding what diligence matters for this investment."
          />
        </aside>

        <div className="grid gap-4">
          {dueDiligenceSections.map((section) => (
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

export function InvestmentOpportunityIntro() {
  return (
    <div
      id={investmentWorkspaceId}
      className="grid scroll-mt-24 gap-4 text-sm leading-6 text-foreground lg:grid-cols-[1fr_320px]"
    >
      <div className="rounded-lg border border-border bg-card p-4">
        <p className="font-extrabold">Opportunity screen reminder</p>
        <p className="mt-1">
          Price is only the first pass. Use filters to narrow by property type,
          beds, baths, parking, city, and rental signals, then run the
          calculator before a listing becomes a real candidate.
        </p>
      </div>
      <ExpertHelpCallout
        context={{
          source: 'investment-opportunities-intro',
          audience: 'investor',
          tool: 'opportunities',
        }}
        title="Need help reading a candidate?"
        description="Send the buy-box question and we will help decide what to calculate or verify next."
        buttonLabel="Ask about a candidate"
        defaultMessage="I need help reviewing an investment listing candidate."
      />
    </div>
  )
}

export function InvestmentQuickLinks() {
  return (
    <section className="grid gap-3 md:grid-cols-3">
      <ToolLink
        to="/investments/opportunities"
        title="Search investor listings"
        description="Open the active listing search."
        icon={Building2}
      />
      <ToolLink
        to="/investments/calculator"
        title="Run the deal math"
        description="Check cash flow and cap rate."
        icon={TrendingUp}
      />
      <ToolLink
        to="/investments/due-diligence"
        title="Verify before offering"
        description="Use the diligence checklist."
        icon={ClipboardCheck}
      />
    </section>
  )
}
