import { memo } from 'react'
import {
  AlertTriangle,
  BatteryCharging,
  Car,
  CheckCircle2,
  Cpu,
  Crosshair,
  DoorOpen,
  Fuel,
  Hammer,
  HeartPulse,
  Info,
  KeyRound,
  Lock,
  LockOpen,
  MapPin,
  Package,
  Shield,
  Smartphone,
  Store,
  Wrench,
  XCircle,
  type LucideIcon,
} from 'lucide-react'

/**
 * Explicit local icon registry — only whitelisted Lucide icons are bundled.
 * Remote fetches are impossible by construction.
 */
const registry: Record<string, LucideIcon> = {
  car: Car,
  wrench: Wrench,
  'door-open': DoorOpen,
  lock: Lock,
  'lock-open': LockOpen,
  fuel: Fuel,
  shop: Store,
  heart: HeartPulse,
  shield: Shield,
  hammer: Hammer,
  package: Package,
  key: KeyRound,
  cpu: Cpu,
  info: Info,
  alert: AlertTriangle,
  check: CheckCircle2,
  x: XCircle,
  weapon: Crosshair,
  phone: Smartphone,
  map: MapPin,
  battery: BatteryCharging,
} as const

export type IconName = keyof typeof registry

export const ICON_NAMES = Object.keys(registry) as IconName[]

interface IconProps {
  name?: string
  size?: number
}

export const Icon = memo(function Icon({ name, size = 16 }: IconProps) {
  if (!name) return null
  const Component = registry[name as IconName]
  if (!Component) return null
  return <Component size={size} strokeWidth={2} aria-hidden="true" />
})
