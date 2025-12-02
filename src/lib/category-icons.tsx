import {
  Package,
  Plane,
  Monitor,
  Megaphone,
  Zap,
  Utensils,
  Laptop,
  Folder,
  CreditCard,
  Home,
  Car,
  Coffee,
  Gift,
  Heart,
  Music,
  Phone,
  ShoppingBag,
  Briefcase,
  type LucideIcon,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  package: Package,
  plane: Plane,
  monitor: Monitor,
  megaphone: Megaphone,
  zap: Zap,
  utensils: Utensils,
  laptop: Laptop,
  folder: Folder,
  "credit-card": CreditCard,
  home: Home,
  car: Car,
  coffee: Coffee,
  gift: Gift,
  heart: Heart,
  music: Music,
  phone: Phone,
  "shopping-bag": ShoppingBag,
  briefcase: Briefcase,
};

export function getCategoryIcon(iconName: string): LucideIcon {
  return iconMap[iconName] || Folder;
}

export const availableIcons = Object.keys(iconMap);

