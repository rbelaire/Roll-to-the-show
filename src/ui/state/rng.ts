import type { RNG } from '../../game/dice/resolveDice'

export function createBrowserRng(): RNG {
  return { nextFloat: () => Math.random() }
}
