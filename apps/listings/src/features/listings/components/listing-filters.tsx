import { useEffect, useState } from 'react'
import { useAtom } from '@effect/atom-react'
import { ChevronDown, SlidersHorizontal, X } from 'lucide-react'

import { Button } from '@workspace/ui/components/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@workspace/ui/components/command'
import {
  NativeSelect,
  NativeSelectOption,
} from '@workspace/ui/components/native-select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@workspace/ui/components/popover'
import { ScrollArea } from '@workspace/ui/components/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@workspace/ui/components/sheet'
import { AppLogo } from '#/components/AppLogo'
import { cn } from '#/lib/utils'

import type {
  ListingFacetOption,
  ListingFacets,
  ListingGroupSearchKey,
} from '../data'
import { defaultListingSearch, listingSortOptions } from '../search'
import type { ListingAdvancedFilterKey, ListingSearch } from '../search'
import { listingFiltersAtom } from '../state'
import { EmptyState } from './shared'
import {
  activeListingFilterCount,
  allValue,
  cleanSearchObject,
  maxCountLabel,
  minCountLabel,
  money,
  number,
  optionsWithSelectedValue,
  selectValue,
} from './utils'

function SelectFilter({
  label,
  value,
  placeholder,
  options,
  onChange,
}: {
  readonly label: string
  readonly value: string
  readonly placeholder: string
  readonly options: ReadonlyArray<string>
  readonly onChange: (value: string) => void
}) {
  return (
    <label className="grid gap-1.5">
      <span className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground">
        {label}
      </span>
      <Select
        value={value || allValue}
        onValueChange={(next) =>
          onChange(next === allValue || next === null ? '' : next)
        }
      >
        <SelectTrigger className="w-full bg-background">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={allValue}>{placeholder}</SelectItem>
          {options.map((option) => (
            <SelectItem value={option} key={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </label>
  )
}

function NativeSelectFilter({
  label,
  value,
  placeholder = 'All',
  options,
  onChange,
}: {
  readonly label: string
  readonly value: string
  readonly placeholder?: string
  readonly options: ReadonlyArray<{
    readonly value: number
    readonly label: string
  }>
  readonly onChange: (value: string) => void
}) {
  return (
    <label className="grid min-w-0 gap-1.5">
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
          <NativeSelectOption value={option.value} key={option.value}>
            {option.label}
          </NativeSelectOption>
        ))}
      </NativeSelect>
    </label>
  )
}

function AdvancedCommandSelect({
  label,
  selected,
  options,
  onChange,
}: {
  readonly label: string
  readonly selected: ReadonlyArray<string>
  readonly options: ReadonlyArray<ListingFacetOption>
  readonly onChange: (value: ReadonlyArray<string>) => void
}) {
  const selectedSet = new Set(selected)
  const mergedOptions = [
    ...options,
    ...selected
      .filter((value) => !options.some((option) => option.value === value))
      .map((value) => ({ value, count: 0 })),
  ]

  const toggle = (value: string) => {
    const next = selectedSet.has(value)
      ? selected.filter((item) => item !== value)
      : [...selected, value]
    onChange(next)
  }

  return (
    <div className="grid gap-1.5">
      <span className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground">
        {label}
      </span>
      <Popover>
        <PopoverTrigger
          render={
            <Button
              type="button"
              variant="outline"
              className="min-h-10 w-full justify-between rounded-lg bg-background px-3 py-2 text-left font-semibold text-foreground hover:bg-background"
            />
          }
        >
          <span className="min-w-0 truncate">
            {selected.length > 0
              ? `${selected.length} selected`
              : `All ${label.toLowerCase()}`}
          </span>
          <ChevronDown className="size-4 opacity-70" />
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-[min(23rem,calc(100vw-3rem))] p-0"
        >
          <Command className="rounded-2xl bg-background">
            <CommandInput placeholder={`Search ${label.toLowerCase()}`} />
            <CommandList>
              <CommandEmpty>No options found.</CommandEmpty>
              <CommandGroup>
                <CommandItem
                  value={`${label}-all`}
                  data-checked={selected.length === 0}
                  onSelect={() => onChange([])}
                >
                  All {label.toLowerCase()}
                </CommandItem>
                {mergedOptions.map((option) => (
                  <CommandItem
                    value={option.value}
                    key={option.value}
                    data-checked={selectedSet.has(option.value)}
                    onSelect={() => toggle(option.value)}
                  >
                    <span className="min-w-0 flex-1 truncate">
                      {option.value}
                    </span>
                    <span className="text-xs text-foreground">
                      {number.format(option.count)}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}

function ListingFilterActions({ onClear }: { readonly onClear: () => void }) {
  return (
    <div className="grid gap-2">
      <SheetClose
        render={<Button type="button" className="w-full font-extrabold" />}
      >
        Apply filters
      </SheetClose>
      <Button type="button" variant="outline" onClick={onClear}>
        Clear filters
      </Button>
    </div>
  )
}

export function ListingFilters({
  search,
  facets,
  hiddenFields = [],
  onChange,
}: {
  readonly search: ListingSearch
  readonly facets: ListingFacets
  readonly hiddenFields?: ReadonlyArray<ListingGroupSearchKey>
  readonly onChange: (search: ListingSearch) => void
}) {
  const [filters, setFilters] = useAtom(listingFiltersAtom)
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const searchKey = JSON.stringify(search)
  const hiddenFieldSet = new Set(hiddenFields)
  const activeFilters = activeListingFilterCount(filters, hiddenFieldSet)

  useEffect(() => {
    setFilters(search)
  }, [searchKey, search, setFilters])

  const commit = (patch: Partial<ListingSearch>) => {
    const next = { ...filters, ...patch, page: patch.page ?? 1 }
    setFilters(next)
    onChange(cleanSearchObject(next))
  }

  const clearFilters = () => commit(defaultListingSearch)
  const commitAdvanced = (
    key: ListingAdvancedFilterKey,
    value: ReadonlyArray<string>,
  ) => commit({ [key]: value })
  const priceValues = optionsWithSelectedValue(
    optionsWithSelectedValue(facets.prices, filters.minPrice),
    filters.maxPrice,
  )
  const bedroomValues = optionsWithSelectedValue(
    optionsWithSelectedValue(facets.bedrooms, filters.minBeds),
    filters.maxBeds,
  )
  const bathroomValues = optionsWithSelectedValue(
    optionsWithSelectedValue(facets.bathrooms, filters.minBaths),
    filters.maxBaths,
  )
  const parkingValues = optionsWithSelectedValue(
    facets.parking.filter((value) => value > 0),
    filters.minParking,
  )
  const priceOptions = priceValues.map((value) => ({
    value,
    label: money.format(value),
  }))
  const minBedroomOptions = bedroomValues.map((value) => ({
    value,
    label: minCountLabel(value, 'bed', 'beds'),
  }))
  const maxBedroomOptions = bedroomValues.map((value) => ({
    value,
    label: maxCountLabel(value, 'bed', 'beds'),
  }))
  const minBathroomOptions = bathroomValues.map((value) => ({
    value,
    label: minCountLabel(value, 'bath', 'baths'),
  }))
  const maxBathroomOptions = bathroomValues.map((value) => ({
    value,
    label: maxCountLabel(value, 'bath', 'baths'),
  }))
  const parkingOptions = parkingValues.map((value) => ({
    value,
    label: minCountLabel(value, 'space', 'spaces'),
  }))
  const advancedGroups = facets.advancedGroups.filter(
    (group) => group.options.length > 0 || filters[group.key].length > 0,
  )

  return (
    <Sheet>
      <div className="pointer-events-none sticky top-20 z-30 -mb-2 flex justify-end">
        <SheetTrigger
          render={
            <Button
              type="button"
              variant="outline"
              className="island-shell pointer-events-auto h-11 rounded-full bg-background px-4 font-extrabold text-foreground shadow-[0_12px_30px_rgba(23,58,64,0.12)] hover:bg-background"
            />
          }
        >
          <SlidersHorizontal />
          Filters
          {activeFilters > 0 ? (
            <span className="ml-1 inline-flex size-5 items-center justify-center rounded-full bg-background text-xs font-extrabold text-foreground">
              {activeFilters}
            </span>
          ) : null}
        </SheetTrigger>
      </div>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="h-dvh overflow-hidden border-l-0 bg-background p-0 data-[side=right]:w-full sm:border-l sm:data-[side=right]:max-w-md"
      >
        <div className="flex h-dvh min-h-0 flex-col">
          <SheetHeader className="flex-row items-center justify-between gap-4 px-5 pb-4 pt-5 sm:px-6 sm:pt-6">
            <SheetTitle className="min-w-0">
              <AppLogo imageClassName="h-9 max-w-[156px]" />
            </SheetTitle>
            <SheetClose
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Close filters"
                  className="shrink-0 text-foreground hover:bg-background"
                />
              }
            >
              <X />
              <span className="sr-only">Close filters</span>
            </SheetClose>
            <SheetDescription className="sr-only">
              Listing filter controls
            </SheetDescription>
          </SheetHeader>
          <ScrollArea className="min-h-0 flex-1 px-5 pb-5 sm:px-6 sm:pb-6">
            <div className="grid gap-4 pb-2">
              {hiddenFieldSet.has('city') ? null : (
                <SelectFilter
                  label="City"
                  value={filters.city}
                  placeholder="All cities"
                  options={facets.cities}
                  onChange={(city) => commit({ city })}
                />
              )}
              {hiddenFieldSet.has('province') ? null : (
                <SelectFilter
                  label="Province"
                  value={filters.province}
                  placeholder="All provinces"
                  options={facets.provinces}
                  onChange={(province) => commit({ province })}
                />
              )}
              {hiddenFieldSet.has('status') ? null : (
                <SelectFilter
                  label="Status"
                  value={filters.status}
                  placeholder="All statuses"
                  options={facets.statuses}
                  onChange={(status) => commit({ status })}
                />
              )}
              {hiddenFieldSet.has('type') ? null : (
                <SelectFilter
                  label="Type"
                  value={filters.type}
                  placeholder="All property types"
                  options={facets.types}
                  onChange={(type) => commit({ type })}
                />
              )}
              <div className="grid grid-cols-2 gap-3">
                <NativeSelectFilter
                  label="Min price"
                  value={selectValue(filters.minPrice)}
                  options={priceOptions}
                  onChange={(minPrice) => commit({ minPrice })}
                />
                <NativeSelectFilter
                  label="Max price"
                  value={selectValue(filters.maxPrice)}
                  options={priceOptions}
                  onChange={(maxPrice) => commit({ maxPrice })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <NativeSelectFilter
                  label="Min beds"
                  value={selectValue(filters.minBeds)}
                  options={minBedroomOptions}
                  onChange={(minBeds) => commit({ minBeds })}
                />
                <NativeSelectFilter
                  label="Max beds"
                  value={selectValue(filters.maxBeds)}
                  options={maxBedroomOptions}
                  onChange={(maxBeds) => commit({ maxBeds })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <NativeSelectFilter
                  label="Min baths"
                  value={selectValue(filters.minBaths)}
                  options={minBathroomOptions}
                  onChange={(minBaths) => commit({ minBaths })}
                />
                <NativeSelectFilter
                  label="Max baths"
                  value={selectValue(filters.maxBaths)}
                  options={maxBathroomOptions}
                  onChange={(maxBaths) => commit({ maxBaths })}
                />
              </div>
              <NativeSelectFilter
                label="Parking"
                value={selectValue(filters.minParking)}
                options={parkingOptions}
                onChange={(minParking) => commit({ minParking })}
              />
              <label className="grid gap-1.5">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground">
                  Sort
                </span>
                <Select
                  value={filters.sort}
                  onValueChange={(sort) => {
                    if (sort !== null) {
                      commit({ sort })
                    }
                  }}
                >
                  <SelectTrigger className="w-full bg-background">
                    <SelectValue placeholder="Sort" />
                  </SelectTrigger>
                  <SelectContent>
                    {listingSortOptions.map((option) => (
                      <SelectItem value={option.value} key={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </label>
              <ListingFilterActions onClear={clearFilters} />
              <Button
                type="button"
                variant="outline"
                className="mt-2 w-full justify-between rounded-lg bg-background font-extrabold text-foreground hover:bg-background"
                aria-expanded={advancedOpen}
                onClick={() => setAdvancedOpen((open) => !open)}
              >
                Advanced search
                <ChevronDown
                  className={cn(
                    'size-4 transition-transform',
                    advancedOpen && 'rotate-180',
                  )}
                />
              </Button>
              {advancedOpen ? (
                <div className="grid gap-4 border-t border-border pt-4">
                  {advancedGroups.length > 0 ? (
                    advancedGroups.map((group) => (
                      <AdvancedCommandSelect
                        label={group.label}
                        selected={filters[group.key]}
                        options={group.options}
                        onChange={(value) => commitAdvanced(group.key, value)}
                        key={group.key}
                      />
                    ))
                  ) : (
                    <EmptyState
                      title="No advanced filters are available for the current data."
                      icon={SlidersHorizontal}
                      align="start"
                      size="compact"
                      className="bg-background p-4"
                    />
                  )}
                  <ListingFilterActions onClear={clearFilters} />
                </div>
              ) : null}
            </div>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  )
}
