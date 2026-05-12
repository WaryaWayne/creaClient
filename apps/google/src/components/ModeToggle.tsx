"use client"

import * as React from "react"
import { Monitor, Moon, Palette, Sun } from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"

type ThemePreference = "light" | "dark" | "system"

const THEME_STORAGE_KEY = "theme"
const THEME_PREFERENCE_EVENT = "theme-preference-change"

const getStoredThemePreference = (): ThemePreference => {
  if (typeof window === "undefined") {
    return "system"
  }

  try {
    const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY)
    if (storedTheme === "theme-light" || storedTheme === "light") {
      return "light"
    }
    if (storedTheme === "dark" || storedTheme === "system") {
      return storedTheme
    }
  } catch {
    return "system"
  }

  return "system"
}

const applyThemePreference = (theme: ThemePreference) => {
  if (typeof window === "undefined") {
    return
  }

  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
  const isDark = theme === "dark" || (theme === "system" && prefersDark)
  document.documentElement.classList.toggle("dark", isDark)
  document.documentElement.dataset.theme = theme
}

export const title = "Theme Selector"

export const ModeToggle = () => {
  const [theme, setThemeState] = React.useState<ThemePreference>(
    getStoredThemePreference
  )

  React.useEffect(() => {
    const onThemePreferenceChange = (event: Event) => {
      const eventTheme = (event as CustomEvent<ThemePreference>).detail
      const updatedTheme = eventTheme ?? getStoredThemePreference()
      setThemeState((currentTheme) =>
        currentTheme === updatedTheme ? currentTheme : updatedTheme
      )
      applyThemePreference(updatedTheme)
    }

    const onSystemThemeChange = () => {
      if (getStoredThemePreference() === "system") {
        applyThemePreference("system")
      }
    }

    window.addEventListener(
      THEME_PREFERENCE_EVENT,
      onThemePreferenceChange as EventListener
    )
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    mediaQuery.addEventListener("change", onSystemThemeChange)

    return () => {
      window.removeEventListener(
        THEME_PREFERENCE_EVENT,
        onThemePreferenceChange as EventListener
      )
      mediaQuery.removeEventListener("change", onSystemThemeChange)
    }
  }, [])

  React.useEffect(() => {
    applyThemePreference(theme)
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme)
    } catch {
      // The selected theme still applies for the current page when storage is unavailable.
    }
    window.dispatchEvent(
      new CustomEvent<ThemePreference>(THEME_PREFERENCE_EVENT, {
        detail: theme,
      })
    )
  }, [theme])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="ghost" size="lg" aria-label="Toggle theme" />}
      >
        <Palette className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={12}
        className="w-48 p-2 backdrop-blur-sm"
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel>Theme</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setThemeState("light")}
            className={theme === "light" ? "bg-foreground/10" : undefined}
          >
            <Sun />
            Light
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setThemeState("dark")}
            className={theme === "dark" ? "bg-foreground/10" : undefined}
          >
            <Moon />
            Dark
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setThemeState("system")}
            className={theme === "system" ? "bg-foreground/10" : undefined}
          >
            <Monitor />
            System
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
