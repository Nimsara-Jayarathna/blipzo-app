import { Colors } from '@/constants/theme';
import { useAppTheme } from '@/context/ThemeContext';

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  const { resolvedTheme } = useAppTheme();
  const colorFromProps = resolvedTheme === 'dark' ? props.dark : props.light;

  if (colorFromProps) {
    return colorFromProps;
  }

  return Colors[resolvedTheme][colorName];
}
