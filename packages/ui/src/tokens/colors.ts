export const colors = {
  ink: '#0F0E0C',
  paper: '#F5F0E8',
  cream: '#EDE8DC',
  accent: '#D4500A',
  accentGreen: '#2A6B3F',
  accentBlue: '#1A3A5C',
  muted: '#7A7060',
  highlight: '#F7C948',
  rule: '#C8BFA8',
} as const;

export type ColorToken = keyof typeof colors;
