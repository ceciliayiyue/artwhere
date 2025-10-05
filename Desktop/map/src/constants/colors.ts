export const COLORS = {
  CREAM_WHITE: '#FFFFEB',
  SUCCESS_GREEN: '#10B981',
  DARK_TEXT: '#111827',
  LIGHT_TEXT: '#6B7280',
} as const;

// Re-export for use in CSS modules
export const colorVars = {
  '--color-cream-white': COLORS.CREAM_WHITE,
  '--color-success-green': COLORS.SUCCESS_GREEN,
  '--color-dark-text': COLORS.DARK_TEXT,
  '--color-light-text': COLORS.LIGHT_TEXT,
} as const;