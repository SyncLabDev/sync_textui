import {
  useEffect,
  useReducer,
  type ReactNode,
} from 'react'
import { initialState, nuiReducer } from './nuiReducer'
import { NuiContext } from './NuiContext'
import type { NuiMessage } from '../types/nui'
import { fetchNui } from '../utils/fetchNui'
import { isEnvBrowser } from '../utils/isEnvBrowser'

/**
 * Owns the single reducer consumed by FiveM messages and browser dev simulation.
 * A malformed/unknown action is ignored — the reducer only sees validated unions.
 */
export function NuiProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(nuiReducer, initialState)

  useEffect(() => {
    const listener = (event: MessageEvent) => {
      const data = event.data as { action?: string } | null
      if (!data || typeof data.action !== 'string') return
      dispatch(data as unknown as NuiMessage)
    }
    window.addEventListener('message', listener)

    // Announce readiness so the client can hydrate without timing races.
    if (!isEnvBrowser()) void fetchNui('init').catch(() => {})

    return () => window.removeEventListener('message', listener)
  }, [])

  return <NuiContext.Provider value={{ state, dispatch }}>{children}</NuiContext.Provider>
}
