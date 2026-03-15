export const colors = {
    background: '#09090B',       // Near-black zinc
    backgroundSecondary: '#18181B', // Zinc-900
    backgroundTertiary: '#27272A',  // Zinc-800
    primary: '#F59E0B',          // Amber-500 — gold accent
    primaryVariant: '#D97706',   // Amber-600
    accent: '#8B5CF6',           // Violet-500
    text: '#FAFAFA',             // Zinc-50
    textSecondary: '#A1A1AA',    // Zinc-400
    textMuted: '#71717A',        // Zinc-500
    border: '#27272A',           // Zinc-800
    borderLight: '#3F3F46',      // Zinc-700
    success: '#22C55E',          // Green-500
    warning: '#F59E0B',          // Amber-500
    error: '#EF4444',            // Red-500
    transparent: 'transparent',
    overlay: 'rgba(0,0,0,0.7)',
    overlayLight: 'rgba(0,0,0,0.4)',
    card: '#18181B',             // Zinc-900
    cardHover: '#1F1F23',
    gold: '#F59E0B',
    goldDark: '#B45309',
};

export const typography = {
    fontFamily: {
        regular: 'System',
        medium: 'System',
        bold: 'System',
    },
    fontSize: {
        xxs: 10,
        xs: 12,
        sm: 14,
        md: 16,
        lg: 18,
        xl: 22,
        xxl: 28,
        hero: 36,
    },
};

export const spacing = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
};

export const borderRadius = {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
};

export const shadows = {
    sm: {
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.3)',
    },
    md: {
        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.4)',
    },
    lg: {
        boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.5)',
    },
    glow: {
        boxShadow: `0px 0px 20px ${colors.primary}44`,
    },
    goldGlow: {
        boxShadow: `0px 0px 12px ${colors.primary}66`,
    },
};

export const textShadows = {
    sm: {
        textShadow: '0px 1px 2px rgba(0,0,0,0.6)',
    },
    md: {
        textShadow: '0px 1px 4px rgba(0,0,0,0.8)',
    },
};
