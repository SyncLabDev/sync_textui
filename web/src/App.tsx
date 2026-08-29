import { lazy, Suspense } from 'react'
import { isEnvBrowser } from './utils/isEnvBrowser'
import { NuiProvider } from './stores/NuiProvider'
import { InteractionStack } from './components/InteractionStack/InteractionStack'
import { PlaygroundPanel } from './components/Playground/PlaygroundPanel'

const devEnabled = import.meta.env.DEV && isEnvBrowser()

// import.meta.env.DEV folds to false in production builds, eliminating the
// dynamic import entirely — dev components, state and CSS never ship to FiveM.
const DevProvider = devEnabled
  ? lazy(() => import('./dev/DevProvider').then((m) => ({ default: m.DevProvider })))
  : null

export default function App() {
  if (DevProvider) {
    return (
      <NuiProvider>
        <Suspense fallback={null}>
          <DevProvider>
            <InteractionStack />
            <PlaygroundPanel />
          </DevProvider>
        </Suspense>
      </NuiProvider>
    )
  }

  return (
    <NuiProvider>
      <InteractionStack />
      <PlaygroundPanel />
    </NuiProvider>
  )
}
