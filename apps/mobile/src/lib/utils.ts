import { Colors } from '@/theme/colors';

export const formatPrice = (price: number): string => {
  if (price >= 10000) return `${(price / 1000).toFixed(1)}k€`;
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(price);
};

export const formatPct = (pct: number): string => {
  const sign = pct >= 0 ? '+' : '';
  return `${sign}${pct.toFixed(2)}%`;
};

export const getPctColor = (pct: number): string => {
  if (pct > 0) return Colors.positive;
  if (pct < 0) return Colors.negative;
  return Colors.textSecondary;
};

export const getColorDot = (color: string): string => {
  switch (color) {
    case 'rouge': return Colors.rouge;
    case 'blanc': return Colors.blanc;
    case 'champagne': return Colors.champagne;
    case 'rosé': return Colors.rose;
    default: return Colors.textMuted;
  }
};

export const getAvailabilityLabel = (a: string) => {
  if (a === 'in_stock') return 'En stock';
  if (a === 'limited') return 'Limité';
  return 'Épuisé';
};

export const getAvailabilityColor = (a: string) => {
  if (a === 'in_stock') return Colors.positive;
  if (a === 'limited') return Colors.warning;
  return Colors.negative;
};