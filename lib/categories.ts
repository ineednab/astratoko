import {
  Droplets,
  Shield,
  Wrench,
  Wind,
  Settings,
  Circle,
  Gem,
  Zap,
  ShoppingBag,
  Package,
  type LucideIcon,
} from 'lucide-react'

export type CategoryStyle = { color: string; Icon: LucideIcon }

export const CATEGORY_STYLE: Record<string, CategoryStyle> = {
  Oli:       { color: '#2F9E44', Icon: Droplets },
  Helm:      { color: '#F08C00', Icon: Shield },
  Rem:       { color: '#3B5BDB', Icon: Wrench },
  Filter:    { color: '#7048E8', Icon: Wind },
  Mesin:     { color: '#0C8599', Icon: Settings },
  Transmisi: { color: '#C92A2A', Icon: Circle },
  Aksesoris: { color: '#D6336C', Icon: Gem },
  Elektrik:  { color: '#E67700', Icon: Zap },
  Ban:       { color: '#495057', Icon: ShoppingBag },
}

export function getCategoryStyle(category: string): CategoryStyle {
  return CATEGORY_STYLE[category] ?? { color: '#3B5BDB', Icon: Package }
}
