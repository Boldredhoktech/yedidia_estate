// config/ads.ts

/**
 * All third-party tracking, analytics, and advertising credentials.
 * IDs prefixed with NEXT_PUBLIC_ are readable client-side.
 * Never put secret keys here — use .env.local for those.
 */
export const adsConfig = {

    // ─────────────────────────────────────────────
    // GOOGLE
    // ─────────────────────────────────────────────
    google: {
        analyticsId:          process.env.NEXT_PUBLIC_GA_ID          ?? '',  // G-XXXXXXXXXX
        tagManagerId:         process.env.NEXT_PUBLIC_GTM_ID          ?? '',  // GTM-XXXXXXX
        adsId:                process.env.NEXT_PUBLIC_GOOGLE_ADS_ID   ?? '',  // AW-XXXXXXXXX
        searchConsoleVerify:  process.env.NEXT_PUBLIC_GSC_VERIFY      ?? '',  // meta tag content
        merchantId:           process.env.NEXT_PUBLIC_MERCHANT_ID     ?? '',  // Google Merchant Center
    },

    // ─────────────────────────────────────────────
    // META (Facebook & Instagram)
    // ─────────────────────────────────────────────
    meta: {
        pixelId:              process.env.NEXT_PUBLIC_META_PIXEL_ID   ?? '',  // Facebook Pixel
        adsAccountId:         process.env.NEXT_PUBLIC_META_ADS_ID     ?? '',
    },

    // ─────────────────────────────────────────────
    // TIKTOK
    // ─────────────────────────────────────────────
    tiktok: {
        pixelId:              process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID ?? '',
    },

    // ─────────────────────────────────────────────
    // LINKEDIN
    // ─────────────────────────────────────────────
    linkedin: {
        insightTagId:         process.env.NEXT_PUBLIC_LINKEDIN_TAG_ID ?? '',
        adsAccountId:         process.env.NEXT_PUBLIC_LINKEDIN_ADS_ID ?? '',
    },

    // ─────────────────────────────────────────────
    // MICROSOFT (Bing)
    // ─────────────────────────────────────────────
    bing: {
        uetTagId:             process.env.NEXT_PUBLIC_BING_UET_ID     ?? '',  // UET tag
        searchConsoleVerify:  process.env.NEXT_PUBLIC_BSC_VERIFY      ?? '',  // Bing Search Console
    },

    // ─────────────────────────────────────────────
    // PINTEREST
    // ─────────────────────────────────────────────
    pinterest: {
        tagId:                process.env.NEXT_PUBLIC_PINTEREST_TAG_ID ?? '',
    },

    // ─────────────────────────────────────────────
    // PRICERUNNER (if used)
    // ─────────────────────────────────────────────
    priceRunner: {
        merchantId:           process.env.NEXT_PUBLIC_PRICERUNNER_ID  ?? '',
    },

    // ─────────────────────────────────────────────
    // HOTJAR (optional — visitor heatmaps)
    // ─────────────────────────────────────────────
    hotjar: {
        siteId:               process.env.NEXT_PUBLIC_HOTJAR_ID       ?? '',
    },

} as const

/**
 * Returns true only if we are in production
 * and the relevant ID is set — prevents firing
 * tracking scripts in development.
 */
export function isTrackingEnabled(id: string): boolean {
    return process.env.NODE_ENV === 'production' && id.trim().length > 0
}