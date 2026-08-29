import type { Interaction, UiConfig } from '../types/interaction'

/** Deterministic fixtures for the DESIGN tab preset selector. */
export interface Preset {
  key: string
  label: string
  interaction: Partial<Interaction> & { text: string }
}

export const PRESETS: Preset[] = [
  {
    key: 'garage',
    label: 'Garage',
    interaction: {
      id: 'dev_garage',
      channel: 'vehicle',
      priority: 10,
      key: 'E',
      icon: 'car',
      text: 'Open Garage',
      description: 'Legion Parking — Level 2',
    },
  },
  {
    key: 'armory',
    label: 'Armory',
    interaction: {
      id: 'dev_armory',
      channel: 'police',
      priority: 8,
      key: 'E',
      icon: 'shield',
      text: 'Open Armory',
      description: 'Vespucci PD — Authorized personnel only',
    },
  },
  {
    key: 'door',
    label: 'Door',
    interaction: {
      id: 'dev_door',
      channel: 'world',
      priority: 5,
      key: 'G',
      icon: 'door-open',
      text: 'Enter Apartment',
      description: 'Morningwood Blvd, Apt 4',
    },
  },
  {
    key: 'repair',
    label: 'Vehicle Repair',
    interaction: {
      id: 'dev_repair',
      channel: 'vehicle',
      priority: 9,
      key: 'H',
      icon: 'wrench',
      text: 'Repair Vehicle',
      description: 'Hold to repair the engine',
    },
  },
  {
    key: 'shop',
    label: 'Shop',
    interaction: {
      id: 'dev_shop',
      channel: 'world',
      priority: 3,
      key: 'E',
      icon: 'shop',
      text: 'Browse Shop',
      description: '24/7 Supermarket',
    },
  },
  {
    key: 'fuel',
    label: 'Fuel',
    interaction: {
      id: 'dev_fuel',
      channel: 'vehicle',
      priority: 7,
      key: 'E',
      icon: 'fuel',
      text: 'Refuel Vehicle',
      description: 'Hold to refuel',
    },
  },
  {
    key: 'evidence',
    label: 'Evidence Locker',
    interaction: {
      id: 'dev_evidence',
      channel: 'police',
      priority: 6,
      key: 'E',
      icon: 'lock',
      text: 'Evidence Locker',
      description: 'Badge required',
    },
  },
  {
    key: 'medical',
    label: 'Medical',
    interaction: {
      id: 'dev_medical',
      channel: 'world',
      priority: 9,
      key: 'F',
      icon: 'heart',
      text: 'Revive Patient',
      description: 'Hold to stabilize',
    },
  },
  {
    key: 'police',
    label: 'Police Radar',
    interaction: {
      id: 'dev_police',
      channel: 'police',
      priority: 4,
      key: 'C',
      icon: 'cpu',
      text: 'Toggle Radar',
      description: 'Vehicle mounted unit',
    },
  },
  {
    key: 'crafting',
    label: 'Crafting Bench',
    interaction: {
      id: 'dev_crafting',
      channel: 'world',
      priority: 2,
      key: 'E',
      icon: 'hammer',
      text: 'Use Crafting Bench',
      description: 'Craft tools and attachments',
    },
  },
  {
    key: 'custom',
    label: 'Custom',
    interaction: {
      id: 'dev_custom',
      channel: 'interaction',
      priority: 5,
      key: 'E',
      icon: 'info',
      text: 'Custom Interaction',
      description: 'Describe the interaction here',
    },
  },
]

export const DEFAULT_DEV_CONFIG: UiConfig = {
  theme: 'sync',
  position: 'center-left',
  animation: 'expand',
  mode: 'auto',
  scale: 1,
  reduceMotion: false,
  highContrast: false,
  maxVisible: 5,
  stackDirection: 'vertical',
  stackSpacing: 8,
}
