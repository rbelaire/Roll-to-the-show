import type { UIState } from './uiState'

const STORAGE_KEY = 'roll-to-the-show'

export function saveState(state: UIState): void {
  try {
    const { lastRollEffects: _, ...rest } = state
    const json = JSON.stringify({ ...rest, lastRollEffects: null })
    localStorage.setItem(STORAGE_KEY, json)
  } catch {
    // localStorage full or unavailable — silently ignore
  }
}

export function loadState(): UIState | null {
  try {
    const json = localStorage.getItem(STORAGE_KEY)
    if (!json) return null
    const parsed = JSON.parse(json) as UIState
    return { ...parsed, lastRollEffects: null }
  } catch {
    return null
  }
}

export function clearState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // silently ignore
  }
}
