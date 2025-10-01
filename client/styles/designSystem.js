// Design System - Consistent styling across all modules
export const designTokens = {
  // Colors
  colors: {
    primary: {
      50: '#eff6ff',
      100: '#dbeafe', 
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8'
    },
    success: {
      50: '#f0fdf4',
      100: '#dcfce7',
      500: '#10b981',
      600: '#059669',
      700: '#047857'
    },
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309'
    },
    danger: {
      50: '#fef2f2',
      100: '#fee2e2',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c'
    },
    purple: {
      50: '#faf5ff',
      100: '#f3e8ff',
      500: '#8b5cf6',
      600: '#7c3aed',
      700: '#6d28d9'
    },
    gray: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a'
    }
  },

  // Typography
  typography: {
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem', 
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem'
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800'
    }
  },

  // Spacing
  spacing: {
    xs: '8px',
    sm: '12px',
    md: '16px',
    lg: '20px',
    xl: '24px',
    '2xl': '32px',
    '3xl': '40px',
    '4xl': '48px'
  },

  // Border Radius
  borderRadius: {
    sm: '6px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    '2xl': '20px',
    full: '50%'
  },

  // Shadows
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
  }
};

// Component Styles
export const componentStyles = {
  // Page Layout
  pageContainer: {
    padding: '0',
    maxWidth: '100%',
    fontFamily: designTokens.typography.fontFamily
  },

  // Page Header
  pageHeader: {
    marginBottom: designTokens.spacing['2xl']
  },
  
  pageTitle: {
    fontSize: designTokens.typography.fontSize['4xl'],
    fontWeight: designTokens.typography.fontWeight.bold,
    color: designTokens.colors.gray[800],
    margin: `0 0 ${designTokens.spacing.xs} 0`
  },

  pageSubtitle: {
    color: designTokens.colors.gray[500],
    margin: 0,
    fontSize: designTokens.typography.fontSize.base
  },

  // Cards
  card: {
    background: '#ffffff',
    borderRadius: designTokens.borderRadius.lg,
    padding: designTokens.spacing.xl,
    boxShadow: designTokens.shadows.md,
    border: `1px solid ${designTokens.colors.gray[200]}`
  },

  // Stat Cards
  statCard: {
    background: '#ffffff',
    borderRadius: designTokens.borderRadius.lg,
    padding: designTokens.spacing.xl,
    boxShadow: designTokens.shadows.md,
    border: `1px solid ${designTokens.colors.gray[200]}`,
    display: 'flex',
    alignItems: 'center',
    gap: designTokens.spacing.md
  },

  statIcon: {
    width: '48px',
    height: '48px',
    borderRadius: designTokens.borderRadius.lg,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },

  statValue: {
    margin: 0,
    fontSize: designTokens.typography.fontSize['4xl'],
    fontWeight: designTokens.typography.fontWeight.bold,
    color: designTokens.colors.gray[800]
  },

  statLabel: {
    margin: 0,
    fontSize: designTokens.typography.fontSize.sm,
    color: designTokens.colors.gray[500],
    fontWeight: designTokens.typography.fontWeight.medium
  },

  // Buttons
  button: {
    display: 'flex',
    alignItems: 'center',
    gap: designTokens.spacing.xs,
    padding: `${designTokens.spacing.sm} ${designTokens.spacing.xl}`,
    border: 'none',
    borderRadius: designTokens.borderRadius.lg,
    cursor: 'pointer',
    fontWeight: designTokens.typography.fontWeight.bold,
    fontSize: designTokens.typography.fontSize.sm,
    transition: 'all 0.2s ease',
    fontFamily: designTokens.typography.fontFamily
  },

  // Button Variants
  buttonPrimary: {
    background: `linear-gradient(135deg, ${designTokens.colors.primary[500]} 0%, ${designTokens.colors.primary[600]} 100%)`,
    color: '#ffffff',
    boxShadow: `0 4px 12px rgba(59, 130, 246, 0.3)`,
    transition: 'all 0.2s ease'
  },

  buttonSuccess: {
    background: `linear-gradient(135deg, ${designTokens.colors.success[500]} 0%, ${designTokens.colors.success[600]} 100%)`,
    color: '#ffffff',
    boxShadow: `0 4px 12px rgba(16, 185, 129, 0.3)`,
    transition: 'all 0.2s ease'
  },

  buttonWarning: {
    background: `linear-gradient(135deg, ${designTokens.colors.warning[500]} 0%, ${designTokens.colors.warning[600]} 100%)`,
    color: '#ffffff',
    boxShadow: `0 4px 12px rgba(245, 158, 11, 0.3)`,
    transition: 'all 0.2s ease'
  },

  buttonDanger: {
    background: `linear-gradient(135deg, ${designTokens.colors.danger[500]} 0%, ${designTokens.colors.danger[600]} 100%)`,
    color: '#ffffff',
    boxShadow: `0 4px 12px rgba(239, 68, 68, 0.3)`,
    transition: 'all 0.2s ease'
  },

  // Loading Spinner
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '400px'
  },

  loadingSpinner: {
    width: '40px',
    height: '40px',
    border: `4px solid ${designTokens.colors.gray[200]}`,
    borderTop: `4px solid ${designTokens.colors.primary[500]}`,
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },

  // Grid Layouts
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: designTokens.spacing.xl,
    marginBottom: designTokens.spacing['2xl']
  },

  twoColumnGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: designTokens.spacing.xl
  },

  // Status Indicators
  statusDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%'
  },

  // Empty States
  emptyState: {
    background: '#ffffff',
    borderRadius: designTokens.borderRadius.xl,
    padding: `${designTokens.spacing['4xl']} ${designTokens.spacing['3xl']}`,
    textAlign: 'center',
    boxShadow: designTokens.shadows.md,
    border: `1px solid ${designTokens.colors.gray[200]}`
  },

  emptyStateIcon: {
    width: '80px',
    height: '80px',
    background: designTokens.colors.gray[100],
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: `0 auto ${designTokens.spacing.xl}`,
    fontSize: '32px'
  },

  emptyStateTitle: {
    fontSize: designTokens.typography.fontSize.xl,
    fontWeight: designTokens.typography.fontWeight.semibold,
    color: designTokens.colors.gray[800],
    margin: `0 0 ${designTokens.spacing.xs} 0`
  },

  emptyStateText: {
    color: designTokens.colors.gray[500],
    fontSize: designTokens.typography.fontSize.base,
    margin: 0
  }
};

// Status Colors
export const statusColors = {
  assigned: designTokens.colors.primary[500],
  pending: designTokens.colors.warning[500],
  approved: designTokens.colors.success[500],
  rejected: designTokens.colors.danger[500],
  completed: designTokens.colors.success[500],
  active: designTokens.colors.success[500],
  inactive: designTokens.colors.gray[400]
};

// Text Background Utilities
export const textBackgrounds = {
  primary: '#ffffff',
  secondary: '#f8fafc',
  card: '#ffffff',
  modal: '#ffffff'
};

// Text Styles with Backgrounds
export const textStyles = {
  heading: {
    background: textBackgrounds.primary,
    fontWeight: designTokens.typography.fontWeight.bold
  },
  subheading: {
    background: textBackgrounds.primary,
    fontWeight: designTokens.typography.fontWeight.semibold
  },
  body: {
    background: textBackgrounds.primary,
    fontWeight: designTokens.typography.fontWeight.normal
  },
  caption: {
    background: textBackgrounds.primary,
    fontSize: designTokens.typography.fontSize.sm,
    color: designTokens.colors.gray[500]
  }
};

// Hover Effects
export const hoverEffects = {
  // Standard card hover
  cardHover: {
    onMouseEnter: (e) => {
      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
      e.currentTarget.style.transform = 'translateY(-2px)';
    },
    onMouseLeave: (e) => {
      e.currentTarget.style.boxShadow = 'none';
      e.currentTarget.style.transform = 'translateY(0)';
    }
  },
  
  // Button hover
  buttonHover: {
    onMouseEnter: (e) => {
      e.currentTarget.style.transform = 'translateY(-1px)';
    },
    onMouseLeave: (e) => {
      e.currentTarget.style.transform = 'translateY(0)';
    }
  }
};