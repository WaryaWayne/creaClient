// Locale switcher refs:
// - Paraglide docs: https://inlang.com/m/gerre34r/library-inlang-paraglideJs
// - Router example: https://github.com/TanStack/router/tree/main/examples/react/i18n-paraglide#switching-locale
import { getLocale, locales, setLocale } from '#/paraglide/runtime'
import { m } from '#/paraglide/messages'

export default function ParaglideLocaleSwitcher() {
  const currentLocale = getLocale()

  return (
    <div
      className="flex items-center gap-2 text-inherit"
      aria-label={m.language_label()}
    >
      <span className="opacity-80">
        {m.current_locale({ locale: currentLocale })}
      </span>
      <div className="flex gap-1">
        {locales.map((locale) => (
          <button
            key={locale}
            onClick={() => setLocale(locale)}
            aria-pressed={locale === currentLocale}
            className={`cursor-pointer rounded-full border border-border bg-background px-3 py-1.5 text-foreground ${
              locale === currentLocale ? 'font-bold' : 'font-medium opacity-70'
            }`}
          >
            {locale.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  )
}
