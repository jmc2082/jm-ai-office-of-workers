import { ref, watchEffect } from 'vue'

export type ThemeChoice = 'system' | 'light' | 'dark'

const KEY = 'office-theme'
const choice = ref<ThemeChoice>(read())
const media = typeof window !== 'undefined' ? window.matchMedia('(prefers-color-scheme: dark)') : null

function read(): ThemeChoice {
  try {
    const v = localStorage.getItem(KEY)
    return v === 'light' || v === 'dark' ? v : 'system'
  } catch {
    return 'system'
  }
}

function apply() {
  const dark = choice.value === 'dark' || (choice.value === 'system' && !!media?.matches)
  document.documentElement.classList.toggle('dark', dark)
}

let started = false

/** Light / dark / system theme, applied as a `.dark` class on <html>. */
export function useTheme() {
  if (!started && typeof window !== 'undefined') {
    started = true
    media?.addEventListener('change', apply)
    watchEffect(() => {
      apply()
      try {
        localStorage.setItem(KEY, choice.value)
      } catch {
        // storage unavailable; theme still applies for this session
      }
    })
  }
  const cycle = () => {
    choice.value = choice.value === 'system' ? 'light' : choice.value === 'light' ? 'dark' : 'system'
  }
  return { choice, cycle }
}
