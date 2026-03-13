import { useAppStore, FontSizeLevel } from '../store/appStore';

const FONT_MULTIPLIERS: Record<FontSizeLevel, number> = {
  normal: 1.0,
  large: 1.25,
  extraLarge: 1.5,
};

export function useFontSize() {
  const { settings } = useAppStore();
  const multiplier = FONT_MULTIPLIERS[settings.fontSize] || 1.25;

  return {
    scale: (size: number) => Math.round(size * multiplier),
    multiplier,
    fontSize: settings.fontSize,
  };
}
