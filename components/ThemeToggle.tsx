"use client"

import { useEffect, useState } from "react"
import { Moon, Sun } from "lucide-react"

type Theme = "dark" | "light"

const THEME_KEY = "proctorly-theme"

function applyTheme(theme: Theme) {
  const root = document.documentElement
  const body = document.body
  // Apply on both html and body to ensure variables inherit consistently.
  root.classList.remove("theme-dark", "theme-light")
  body.classList.remove("theme-dark", "theme-light")
  root.classList.add(`theme-${theme}`)
  body.classList.add(`theme-${theme}`)
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") return "dark"
    const stored = window.localStorage.getItem(THEME_KEY)
    return stored === "light" ? "light" : "dark"
  })

  useEffect(() => {
    applyTheme(theme)
    window.localStorage.setItem(THEME_KEY, theme)
  }, [theme])

  const toggleTheme = () => {
    const next: Theme = theme === "dark" ? "light" : "dark"
    setTheme(next)
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className=" inline-flex h-9 w-9 items-center cursor-pointer justify-center rounded-[var(--radius-button)] border border-border bg-secondary text-foreground hover:bg-secondary/80"
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  )
}
