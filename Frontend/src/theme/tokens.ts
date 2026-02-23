export type AppColors = {
  background: string;
  surface: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
  accent: string;
  danger: string;
};

export const THEME: AppColors = {
  background: '#121212',
  surface: '#1D1D1D',
  border: '#2C2C2C',
  textPrimary: '#FFFFFF',
  textSecondary: '#C4C4C4',
  accent: '#58E6D9',
  danger: '#CF6679',
};

export type AppTheme = {
  colors: AppColors;
};

export const appTheme: AppTheme = {
  colors: THEME,
};
