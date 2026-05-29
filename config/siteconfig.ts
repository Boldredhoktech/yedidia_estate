// config/siteconfig.ts

export const siteConfig = {

    // ─────────────────────────────────────────────
    // IDENTITY
    // ─────────────────────────────────────────────
    name:        'Yedidia Estate',
    tagline:     'Your Trusted Real Estate Partner in Ghana',
    description: 'Yedidia Estate connects property buyers, renters, and sellers across Ghana. Browse parcels, furnished apartments, and houses for sale or rent.',
    url:         process.env.NEXT_PUBLIC_APP_URL ?? 'https://www.yedidia-estate.com',
    locale:      'en-GH',
    currency:    'GHS',
    country:     'Ghana',
    flag:        '🇬🇭',

    // ─────────────────────────────────────────────
    // CONTACT
    // ─────────────────────────────────────────────
    contact: {
        phoneMain:      '+233 50 484 3682',
        phoneSupport:   '+233 59 588 5449',
        whatsapp:       '+2330504843682',
        whatsappLink:   'https://wa.me/2330504843682',
        telegram:       'https://t.me/yedidia_estate',
        emailContact:   'contact@yedidia-estate.com',
        emailComplaints:'complaints@yedidia-estate.com',
        emailSupport:   'support@yedidia-estate.com',
        emailPartnership:'partnerships@yedidia-estate.com',
        emailNoreply:   'noreply@yedidia-estate.com',
    },

    // ─────────────────────────────────────────────
    // HEADQUARTERS
    // ─────────────────────────────────────────────
    address: {
        street:   'XX Independence Avenue',
        district: 'Accra Central',
        city:     'Accra',
        region:   'Greater Accra',
        country:  'Ghana',
        full:     'XX Independence Avenue, Accra Central, Accra, Ghana',
        googleMapsLink: 'https://maps.google.com/?q=Accra+Ghana',
    },

    // ─────────────────────────────────────────────
    // SOCIAL MEDIA
    // ─────────────────────────────────────────────
    social: {
        facebook:  'https://facebook.com/yedidia.estate',
        instagram: 'https://instagram.com/yedidia.estate',
        tiktok:    'https://tiktok.com/@yedidia.estate',
        linkedin:  'https://linkedin.com/company/yedidia-estate',
        youtube:   'https://youtube.com/@yedidia-estate',
        twitter:   'https://x.com/yedidia_estate',
        pinterest: 'https://pinterest.com/yedidia_estate',
    },

    // ─────────────────────────────────────────────
    // LEGAL
    // ─────────────────────────────────────────────
    legal: {
        companyName:        'Yedidia Estate Ltd',
        registrationNumber: 'GH-REG-',
        vatNumber:          'GH-VAT-',
        privacyPolicyUrl:   '/legal/privacy-policy',
        termsOfSaleUrl:     '/legal/terms-of-sale',
        legalNoticeUrl:     '/legal/legal-notice',
        deliveryUrl:        '/legal/delivery',
        cookiePolicyUrl:    '/legal/cookie-policy',
    },

    // ─────────────────────────────────────────────
    // MEDIA CONSTRAINTS
    // ─────────────────────────────────────────────
    media: {
        photo: {
            maxSizeMB:   5,
            maxSizeBytes: 5 * 1024 * 1024,
            maxPerListing: 6,
            acceptedFormats: ['image/jpeg', 'image/png', 'image/webp'],
        },
        video: {
            maxSizeMB:    10,
            maxSizeBytes: 10 * 1024 * 1024,
            maxDurationSeconds: 60,
            acceptedFormats: ['video/mp4', 'video/quicktime', 'video/webm'],
        },
    },

    // ─────────────────────────────────────────────
    // PROPERTY TYPES
    // ─────────────────────────────────────────────
    propertyTypes: [
        { value: 'parcelle',       label: 'Land / Parcel',        mediaType: 'video' },
        { value: 'maison_vente',   label: 'House for Sale',       mediaType: 'photo' },
        { value: 'maison_location',label: 'House for Rent',       mediaType: 'photo' },
        { value: 'airbnb',         label: 'Furnished Apartment',  mediaType: 'photo' },
    ] as const,

    // ─────────────────────────────────────────────
    // SUBSCRIPTION — FREE OFFER
    // ─────────────────────────────────────────────
    freeOffer: {
        publicationsCount:    4,
        publicationDurationDays: 60,  // 2 months
    },

    // ─────────────────────────────────────────────
    // SUBSCRIPTION — FORMULAS (prices set by SuperAdmin in DB)
    // Labels and structure only — prices come from database
    // ─────────────────────────────────────────────
    formulas: [
        {
            key:                  'F1',
            name:                 'Starter',
            pubCount:             10,
            pubDurationDays:      60,   // 2 months per publication
            validityDays:         180,  // 6 months
        },
        {
            key:                  'F2',
            name:                 'Business',
            pubCount:             25,
            pubDurationDays:      60,
            validityDays:         180,
        },
        {
            key:                  'F3',
            name:                 'Pro',
            pubCount:             100,
            pubDurationDays:      60,
            validityDays:         365,  // 12 months
        },
        {
            key:                  'F4',
            name:                 'Premium',
            pubCount:             150,
            pubDurationDays:      90,   // 3 months per publication
            validityDays:         365,
        },
        {
            key:                  'F5',
            name:                 'Elite',
            pubCount:             150,
            pubDurationDays:      150,  // 5 months per publication
            validityDays:         365,
        },
        {
            key:                  'F6',
            name:                 'Diamond',
            pubCount:             150,
            pubDurationDays:      180,  // 6 months per publication
            validityDays:         365,
        },
    ] as const,

    // ─────────────────────────────────────────────
    // ADMIN ROUTES (obfuscated)
    // ─────────────────────────────────────────────
    routes: {
        superadmin:       '/opoku',
        agentValidator:   '/kwaku',
        agentImmobilier:  '/agents',
        comptable:        '/comptable',
    },

    // ─────────────────────────────────────────────
    // FRAUD WARNING — shown on property cards
    // ─────────────────────────────────────────────
    fraudWarning: {
        general:
            'All land and property sales must be verified by your legal team before any transaction. Yedidia Estate is not responsible for any fraudulent acts.',
        airbnb:
            'Never send money to Airbnb contacts without first verifying their absolute reliability. Yedidia Estate is not liable for financial losses from unverified transfers.',
        legalPartnersLabel: 'Access our certified legal partners',
        complaintLabel:     'File a complaint',
        complaintUrl:       '/legal/complaint',
        legalPartnersUrl:   '/legal/partners',
    },

    // ─────────────────────────────────────────────
    // SEO DEFAULTS
    // ─────────────────────────────────────────────
    seo: {
        defaultTitle:       'Yedidia Estate — Real Estate in Ghana',
        titleTemplate:      '%s | Yedidia Estate',
        defaultDescription: 'Find parcels, houses for sale, houses for rent and furnished apartments across Ghana. Yedidia Estate — your trusted property platform.',
        keywords: [
            'real estate Ghana',
            'property Ghana',
            'land for sale Ghana',
            'houses for rent Accra',
            'furnished apartments Ghana',
            'Airbnb Ghana',
            'Yedidia Estate',
        ],
        ogImage: '/images/og-default.jpg',
        twitterHandle: '@yedidia_estate',
    },

    // ─────────────────────────────────────────────
    // NOTIFICATION TRIGGERS
    // ─────────────────────────────────────────────
    notifications: {
        expiryWarningDays:  7,   // J-7 before publication expires
        cronSchedule:       '0 8 * * *', // every day at 08:00
    },

    // ─────────────────────────────────────────────
    // PAYMENT
    // ─────────────────────────────────────────────
    payment: {
        providers: ['paystack', 'manual'] as const,
        manualSupportContact: 'support@yedidia-estate.com',
        manualSupportWhatsapp: 'https://wa.me/233XXXXXXXXX',
        receiptEmailEnabled: true,
    },

} as const

export type PropertyType   = typeof siteConfig.propertyTypes[number]['value']
export type FormulaKey     = typeof siteConfig.formulas[number]['key']
export type PaymentProvider = typeof siteConfig.payment.providers[number]