"use client"

import { useState, useMemo } from "react"
import { Search, X, ChevronDown, CircleOff } from "lucide-react"
import { faqCategories, faqCategoryLinks } from "@/data/faq-page"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@workspace/ui/components/Empty"
import { Button } from "@workspace/ui/components/button"
import { routes } from "@/lib/routes"
import { CTAButton } from "./CTAButton"

function escapeRegex(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

function toSlug(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function getFaqId(categoryId: string, faq: { q: string; a: string }) {
  return `${categoryId}-${toSlug(faq.q)}-${toSlug(faq.a).slice(0, 32)}`
}

function Highlighted({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>
  const parts = text.split(new RegExp(`(${escapeRegex(query)})`, "gi"))
  const segments = parts.reduce<Array<{ part: string; start: number }>>(
    (acc, part) => {
      const previous = acc.at(-1)
      const start = previous ? previous.start + previous.part.length : 0
      return [...acc, { part, start }]
    },
    []
  )

  return (
    <>
      {segments.map(({ part, start }) => {
        const key = `${start}-${part}`

        return part.toLowerCase() === query.toLowerCase() ? (
          <mark
            key={key}
            className="rounded-[2px] bg-primary/25 px-[1px] text-foreground not-italic"
          >
            {part}
          </mark>
        ) : (
          <span key={key}>{part}</span>
        )
      })}
    </>
  )
}

export function FAQPage() {
  const [search, setSearch] = useState("")
  const [openIds, setOpenIds] = useState<Set<string>>(new Set())
  const [activeCategory, setActiveCategory] = useState("all")

  const query = search.trim().toLowerCase()

  const filteredCategories = useMemo(() => {
    const base =
      activeCategory === "all"
        ? faqCategories
        : faqCategories.filter((c) => c.id === activeCategory)

    if (!query) return base

    return base
      .map((c) => ({
        ...c,
        faqs: c.faqs.filter(
          (faq) =>
            faq.q.toLowerCase().includes(query) ||
            faq.a.toLowerCase().includes(query)
        ),
      }))
      .filter((c) => c.faqs.length > 0)
  }, [query, activeCategory])

  const totalResults = filteredCategories.reduce(
    (acc, c) => acc + c.faqs.length,
    0
  )
  const totalAll = faqCategories.reduce((acc, c) => acc + c.faqs.length, 0)

  function toggleCard(id: string) {
    setOpenIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  // Auto-expand all matching cards when searching
  const isOpen = (id: string) => {
    if (query) return true
    return openIds.has(id)
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 pb-32">
      {/* Hero */}
      <div className="mb-14 text-center">
        <p className="mb-3 text-sm font-bold tracking-widest text-primary uppercase">
          Support
        </p>
        <h1 className="mb-4 text-5xl leading-tight font-black md:text-6xl">
          Every Question.{" "}
          <span className="text-primary">Answered Straight.</span>
        </h1>
        <p className="mx-auto max-w-xl text-lg text-muted-foreground">
          {totalAll} questions across {faqCategories.length} topics. Search
          below or browse by category.
        </p>
      </div>

      {/* Search bar */}
      <div className="sticky top-4 z-20 mb-8">
        <div className="relative">
          <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search questions and answers…"
            className="w-full border border-border bg-background py-4 pr-12 pl-12 text-base text-foreground placeholder:text-muted-foreground focus:border-primary/60 focus:ring-2 focus:ring-primary/20 focus:outline-none"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute top-1/2 right-4 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
        {query && (
          <p className="mt-2 px-1 text-sm text-muted-foreground">
            {totalResults === 0 ? (
              <span className="font-semibold text-destructive">
                No matches found for &ldquo;{search}&rdquo;
              </span>
            ) : (
              <>
                <span className="font-bold text-primary">{totalResults}</span>{" "}
                {totalResults === 1 ? "result" : "results"} for &ldquo;
                {search}&rdquo;
              </>
            )}
          </p>
        )}
      </div>

      {/* Category pills */}
      <div className="mb-10 flex flex-wrap gap-2">
        <Button
          onClick={() => setActiveCategory("all")}
          variant={activeCategory === "all" ? "default" : "outline"}
        >
          All ({totalAll})
        </Button>
        {faqCategories.map((c) => (
          <Button
            key={c.id}
            onClick={() => setActiveCategory(c.id)}
            variant={activeCategory === c.id ? "default" : "outline"}
          >
            {c.label} ({c.faqs.length})
          </Button>
        ))}
      </div>

      {/* Results */}
      {filteredCategories.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <CircleOff className="text-primary" />
            </EmptyMedia>
            <EmptyTitle>No matches found</EmptyTitle>
            <EmptyDescription>
              Try a different search term or browse all categories
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button variant={"default"} onClick={() => setSearch("")}>
              Add data
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <div className="space-y-12">
          {filteredCategories.map((category) => (
            <section
              key={category.id}
              id={category.id}
              className="scroll-mt-24"
            >
              {/* Category header */}
              <div className="mb-5 flex items-center gap-3">
                <h2 className="text-2xl font-black text-foreground">
                  {category.label}
                </h2>
                <span className="border border-border bg-background px-2 py-0.5 text-xs font-bold text-muted-foreground">
                  {category.faqs.length}
                </span>
              </div>
              {!query && faqCategoryLinks[category.id] && (
                <p className="mb-5 text-sm text-muted-foreground">
                  Related:{" "}
                  {faqCategoryLinks[category.id].map((link, idx) => (
                    <span key={link.href}>
                      <a
                        href={link.href}
                        className="font-semibold text-primary underline underline-offset-2 hover:no-underline"
                      >
                        {link.label}
                      </a>
                      {idx < faqCategoryLinks[category.id].length - 1
                        ? " · "
                        : ""}
                    </span>
                  ))}
                </p>
              )}

              {/* Cards */}
              <div className="space-y-3">
                {category.faqs.map((faq) => {
                  const id = getFaqId(category.id, faq)
                  const open = isOpen(id)
                  const isMatch =
                    query &&
                    (faq.q.toLowerCase().includes(query) ||
                      faq.a.toLowerCase().includes(query))

                  return (
                    <div
                      key={id}
                      className={`border bg-background transition-all duration-200 ${
                        isMatch
                          ? "border-primary bg-primary/5 shadow-sm backdrop-blur-sm"
                          : query
                            ? "border-border opacity-40"
                            : "border-border hover:border-primary/30"
                      }`}
                    >
                      <button
                        onClick={() => !query && toggleCard(id)}
                        className={`flex w-full items-center justify-between gap-4 px-6 py-5 text-left ${
                          query ? "cursor-default" : "cursor-pointer"
                        }`}
                      >
                        <span className="leading-snug font-black text-foreground">
                          {query ? (
                            <Highlighted text={faq.q} query={search.trim()} />
                          ) : (
                            faq.q
                          )}
                        </span>
                        {!query && (
                          <ChevronDown
                            className={`h-4 w-4 shrink-0 text-primary transition-transform duration-200 ${
                              open ? "rotate-180" : ""
                            }`}
                          />
                        )}
                      </button>

                      {open && (
                        <p className="px-6 pb-5 text-sm leading-relaxed text-muted-foreground">
                          {query ? (
                            <Highlighted text={faq.a} query={search.trim()} />
                          ) : (
                            faq.a
                          )}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            </section>
          ))}
        </div>
      )}

      {/* Bottom CTA */}
      {!query && (
        <div className="mt-16 border border-primary/30 bg-primary/5 p-8 text-center backdrop-blur-sm">
          <p className="mb-2 text-xs font-bold tracking-widest text-primary uppercase">
            Need Help?
          </p>
          <p className="mb-2 text-xl font-black text-foreground">
            Still have a question?
          </p>
          <p className="mb-5 text-sm text-muted-foreground">
            If it is not covered above, send the question and we will point you
            to the right next step.
          </p>
          <CTAButton
            href={routes.google.contact}
            target="_self"
            variant={"default"}
          >
            Send a Question
          </CTAButton>
        </div>
      )}
    </div>
  )
}
