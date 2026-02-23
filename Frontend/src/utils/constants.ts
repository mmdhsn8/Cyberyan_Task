import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export { SCREEN_WIDTH, SCREEN_HEIGHT };

export const vw = (ratio: number) => SCREEN_WIDTH * ratio;
export const vh = (ratio: number) => SCREEN_HEIGHT * ratio;

export const TAB_ACTIVE_SELECTED_BG = '#92579C';
export const TAB_ACTIVE_SELECTED_BORDER = '#92579C';

export const APP_LAYOUT = {
  windowWidth: SCREEN_WIDTH,
  windowHeight: SCREEN_HEIGHT,
  contentMaxWidth: Math.min(vw(0.94), 520),
};

  
export const SPACE = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
};

export const BORDER_RADIUS = {
  sm: SPACE.xs,
  md: SPACE.sm,
  lg: SPACE.lg,
} as const;

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
