// config/agency.ts

/**
 * Agency identity config.
 * Import from here whenever you need logo path, brand name,
 * or visual identity details in components.
 */
export const agencyConfig = {

    name:       'Yedidia Estate',
    shortName:  'YE',

    // Logo paths (place files in /public/images/)
    logo: {
        light:    '/images/logo-light.png',   // logo on dark background
        dark:     '/images/logo-dark.png',    // logo on light background
        favicon:  '/favicon.ico',
        ogImage:  '/images/og-default.jpg',
    },

    // Brand colours (mirrored from tailwind config for use in inline styles if needed)
    brand: {
        primary:    '#e23d76',   // brand-500 rose
        primaryDark:'#a8154a',   // brand-700
        primaryLight:'#f9c8de',  // brand-200
        white:      '#ffffff',
        dark:       '#1a1a2e',
    },

    // Ghana identity elements
    ghana: {
        flagEmoji:   '🇬🇭',
        flagColors:  ['#006B3F', '#FCD116', '#CE1126', '#000000'],
        // Kente-inspired accent strip used in header/footer decorative elements
        kenteStripe: ['#CE1126', '#FCD116', '#006B3F'],
    },

    // Business hours (displayed in footer / contact page)
    businessHours: {
        weekdays:  'Monday – Friday : 08:00 – 17:00',
        saturday:  'Saturday        : 09:00 – 13:00',
        sunday:    'Closed',
        timezone:  'GMT+0 (Accra)',
    },

    // Year founded — used in footer copyright
    foundedYear: 2025,

} as const