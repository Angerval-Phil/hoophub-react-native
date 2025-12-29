// Theme configuration for HoopHub
// NBA-inspired dark theme with team colors

export const colors = {
  // Primary Colors
  primary: '#0C2340',        // Deep Navy
  secondary: '#F05E23',      // Basketball Orange
  accent: '#C9082A',         // NBA Red

  // Background Colors
  background: '#0A0A0A',     // Near Black
  surface: '#1A1A1A',        // Dark Gray
  surfaceElevated: '#252525', // Elevated Surface

  // Text Colors
  textPrimary: '#FFFFFF',
  textSecondary: '#8E8E93',
  textTertiary: '#636366',

  // Status Colors
  live: '#FF3B30',           // Live Game Red
  success: '#34C759',
  warning: '#FF9500',

  // Utility
  border: '#2C2C2E',
  transparent: 'transparent',
};

export const spacing = {
  xs: 4,
  s: 8,
  m: 16,
  l: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  s: 8,
  m: 12,
  l: 16,
  xl: 24,
  full: 9999,
};

export const typography = {
  largeTitle: {
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: 0.37,
  },
  title1: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: 0.36,
  },
  title2: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 0.35,
  },
  title3: {
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: 0.38,
  },
  headline: {
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: -0.41,
  },
  body: {
    fontSize: 17,
    fontWeight: '400',
    letterSpacing: -0.41,
  },
  callout: {
    fontSize: 16,
    fontWeight: '400',
    letterSpacing: -0.32,
  },
  subhead: {
    fontSize: 15,
    fontWeight: '400',
    letterSpacing: -0.24,
  },
  footnote: {
    fontSize: 13,
    fontWeight: '400',
    letterSpacing: -0.08,
  },
  caption1: {
    fontSize: 12,
    fontWeight: '400',
    letterSpacing: 0,
  },
  caption2: {
    fontSize: 11,
    fontWeight: '400',
    letterSpacing: 0.07,
  },
};

// NBA Team Colors
export const teamColors = {
  ATL: { primary: '#E03A3E', secondary: '#C1D32F' }, // Hawks
  BOS: { primary: '#007A33', secondary: '#BA9653' }, // Celtics
  BKN: { primary: '#000000', secondary: '#FFFFFF' }, // Nets
  CHA: { primary: '#1D1160', secondary: '#00788C' }, // Hornets
  CHI: { primary: '#CE1141', secondary: '#000000' }, // Bulls
  CLE: { primary: '#860038', secondary: '#FDBB30' }, // Cavaliers
  DAL: { primary: '#00538C', secondary: '#002B5E' }, // Mavericks
  DEN: { primary: '#0E2240', secondary: '#FEC524' }, // Nuggets
  DET: { primary: '#C8102E', secondary: '#1D42BA' }, // Pistons
  GSW: { primary: '#1D428A', secondary: '#FFC72C' }, // Warriors
  HOU: { primary: '#CE1141', secondary: '#000000' }, // Rockets
  IND: { primary: '#002D62', secondary: '#FDBB30' }, // Pacers
  LAC: { primary: '#C8102E', secondary: '#1D428A' }, // Clippers
  LAL: { primary: '#552583', secondary: '#FDB927' }, // Lakers
  MEM: { primary: '#5D76A9', secondary: '#12173F' }, // Grizzlies
  MIA: { primary: '#98002E', secondary: '#F9A01B' }, // Heat
  MIL: { primary: '#00471B', secondary: '#EEE1C6' }, // Bucks
  MIN: { primary: '#0C2340', secondary: '#236192' }, // Timberwolves
  NOP: { primary: '#0C2340', secondary: '#C8102E' }, // Pelicans
  NYK: { primary: '#006BB6', secondary: '#F58426' }, // Knicks
  OKC: { primary: '#007AC1', secondary: '#EF3B24' }, // Thunder
  ORL: { primary: '#0077C0', secondary: '#C4CED4' }, // Magic
  PHI: { primary: '#006BB6', secondary: '#ED174C' }, // 76ers
  PHX: { primary: '#1D1160', secondary: '#E56020' }, // Suns
  POR: { primary: '#E03A3E', secondary: '#000000' }, // Trail Blazers
  SAC: { primary: '#5A2D81', secondary: '#63727A' }, // Kings
  SAS: { primary: '#C4CED4', secondary: '#000000' }, // Spurs
  TOR: { primary: '#CE1141', secondary: '#000000' }, // Raptors
  UTA: { primary: '#002B5C', secondary: '#00471B' }, // Jazz
  WAS: { primary: '#002B5C', secondary: '#E31837' }, // Wizards
};

export const getTeamColor = (abbreviation) => {
  return teamColors[abbreviation?.toUpperCase()] || { primary: colors.primary, secondary: colors.secondary };
};

export default {
  colors,
  spacing,
  borderRadius,
  typography,
  teamColors,
  getTeamColor,
};
