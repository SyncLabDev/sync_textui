import { type Dispatch, createContext, useContext } from 'react'
import type { NuiMessage } from '../types/nui'
import type { NuiState } from './nuiReducer'

export interface NuiContextValue {
  state: NuiState
  dispatch: Dispatch<NuiMessage>
}

export const NuiContext = createContext<NuiContextValue | null>(null)

export function useNui(): NuiContextValue {
  const ctx = useContext(NuiContext)
  if (!ctx) throw new Error('useNui must be used within NuiProvider')
  return ctx
}
