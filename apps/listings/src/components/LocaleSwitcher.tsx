// Locale switcher refs:
// - Paraglide docs: https://inlang.com/m/gerre34r/library-inlang-paraglideJs
// - Router example: https://github.com/TanStack/router/tree/main/examples/react/i18n-paraglide#switching-locale
import { Button } from '@workspace/ui/components/button'
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
          <Button
            key={locale}
            type="button"
            variant={locale === currentLocale ? 'default' : 'outline'}
            size="sm"
            onClick={() => setLocale(locale)}
            aria-pressed={locale === currentLocale}
            className={
              locale === currentLocale ? 'font-bold' : 'font-medium opacity-70'
            }
          >
            {locale.toUpperCase()}
          </Button>
        ))}
      </div>
    </div>
  )
}
