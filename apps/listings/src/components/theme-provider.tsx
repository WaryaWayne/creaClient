import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { ScriptOnce } from '@tanstack/react-router'

type Theme = 'dark' | 'light' | 'system'

type ThemeProviderProps = {
  readonly children: ReactNode
  readonly defaultTheme?: Theme
  readonly storageKey?: string
}

type ThemeProviderState = {
  readonly theme: Theme
  readonly setTheme: (theme: Theme) => void
}

const themePreferenceEvent = 'theme-preference-change'

function getThemeScript(storageKey: string, defaultTheme: Theme) {
  const key = JSON.stringify(storageKey)
  const fallback = JSON.stringify(defaultTheme)

  return `(function(){try{var t=localStorage.getItem(${key});if(t==='theme-light'){t='light'}if(t!=='light'&&t!=='dark'&&t!=='system'){t=${fallback}}var d=matchMedia('(prefers-color-scheme: dark)').matches;var r=t==='system'?(d?'dark':'light'):t;var e=document.documentElement;e.classList.remove('light','dark');e.classList.add(r);e.style.colorScheme=r;e.dataset.theme=t}catch(e){}})();`
}

const ThemeProviderContext = createContext<ThemeProviderState | undefined>(
  undefined,
)

function applyTheme(theme: Theme) {
  const root = document.documentElement
  root.classList.remove('light', 'dark')

  const resolved =
    theme === 'system'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
      : theme

  root.classList.add(resolved)
  root.style.colorScheme = resolved
  root.dataset.theme = theme
}

function readStoredTheme(storageKey: string, defaultTheme: Theme): Theme {
  try {
    const stored = window.localStorage.getItem(storageKey)

    if (stored === 'theme-light') {
      return 'light'
    }

    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      return stored
    }
  } catch {
    return defaultTheme
  }

  return defaultTheme
}

function writeStoredTheme(storageKey: string, theme: Theme) {
  try {
    window.localStorage.setItem(storageKey, theme)
  } catch {
    // The selected theme still applies for the current page when storage is unavailable.
  }
}

function dispatchThemePreference(theme: Theme) {
  window.dispatchEvent(
    new CustomEvent<Theme>(themePreferenceEvent, { detail: theme }),
  )
}

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'theme',
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setThemeState(readStoredTheme(storageKey, defaultTheme))
    setMounted(true)
  }, [defaultTheme, storageKey])

  useEffect(() => {
    if (!mounted) {
      return
    }

    applyTheme(theme)
    dispatchThemePreference(theme)
  }, [mounted, theme])

  useEffect(() => {
    if (!mounted || theme !== 'system') {
      return
    }

    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => applyTheme('system')
    media.addEventListener('change', onChange)

    return () => media.removeEventListener('change', onChange)
  }, [mounted, theme])

  const value = useMemo<ThemeProviderState>(
    () => ({
      theme,
      setTheme: (nextTheme) => {
        writeStoredTheme(storageKey, nextTheme)
        setThemeState(nextTheme)
      },
    }),
    [storageKey, theme],
  )

  return (
    <ThemeProviderContext.Provider value={value}>
      <ScriptOnce>{getThemeScript(storageKey, defaultTheme)}</ScriptOnce>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeProviderContext)

  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }

  return context
}
