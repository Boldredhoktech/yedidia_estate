// app/(public)/legal/cookie-policy/page.tsx

import type { Metadata }         from 'next'
import LegalPageWrapper          from '@/components/public/LegalPageWrapper'
import { Section, ContactBlock } from '@/app/(public)/legal/privacy-policy/page'
import { siteConfig }            from '@/config/siteconfig'

export const metadata: Metadata = {
    title:       'Cookie Policy',
    description: `Cookie policy for ${siteConfig.name} — how we use cookies and local storage.`,
}

export default function CookiePolicyPage() {
    return (
        <LegalPageWrapper
            title="Cookie Policy"
            subtitle={`Last updated: ${new Date().toLocaleDateString('en-GH', { day: 'numeric', month: 'long', year: 'numeric' })}`}
            icon="cookie"
        >

            <Section title="1. What Are Cookies?">
                <p>
                    Cookies are small text files placed on your device by a website when you
                    visit it. They help the website remember your preferences and improve your
                    browsing experience. {siteConfig.name} also uses browser session storage,
                    a similar technology, for certain features.
                </p>
            </Section>

            <Section title="2. How We Use Cookies & Storage">
                <p>We use the following types of cookies and storage mechanisms:</p>
                <ul>
                    <li>
                        <strong>Session cookie (ye_session):</strong> Used exclusively for
                        authenticated users (real estate agents and administrators) to maintain
                        secure login sessions. This cookie is HttpOnly, meaning it cannot be
                        accessed by JavaScript. It expires after 8 hours of inactivity. Visitors
                        browsing listings are not issued this cookie.
                    </li>
                    <li>
                        <strong>Session storage (ye_popup_dismissed):</strong> Stored in your
                        browser's session storage to remember whether you have dismissed the
                        welcome popup during your current browsing session. This data is
                        automatically deleted when you close your browser tab and is never
                        transmitted to our servers.
                    </li>
                    <li>
                        <strong>Analytics (third-party):</strong> If enabled, we may use
                        Google Analytics or similar tools to collect anonymised data about
                        how visitors use our Platform (pages visited, time spent, geographic
                        region). These tools may set their own cookies. You can opt out via
                        your browser settings or a browser extension such as Google Analytics
                        Opt-out Add-on.
                    </li>
                </ul>
            </Section>

            <Section title="3. Cookies We Do NOT Use">
                <ul>
                    <li>We do not use advertising tracking cookies on visitor-facing pages.</li>
                    <li>We do not use cookies to build visitor profiles for commercial purposes.</li>
                    <li>We do not sell cookie data to third parties.</li>
                    <li>
                        Third-party advertising pixels (Meta, TikTok, LinkedIn, etc.) are loaded
                        only in production and only when the relevant platform IDs are configured.
                        These pixels are subject to the respective platforms' privacy policies.
                    </li>
                </ul>
            </Section>

            <Section title="4. Managing Cookies">
                <p>
                    You can control and delete cookies through your browser settings. Note that
                    disabling cookies may affect certain features of the Platform, particularly
                    if you are a registered Agent or administrator.
                </p>
                <p>Popular browser cookie controls:</p>
                <ul>
                    <li>
                        <strong>Chrome:</strong> Settings → Privacy and security → Cookies and
                        other site data
                    </li>
                    <li>
                        <strong>Firefox:</strong> Settings → Privacy & Security → Cookies and
                        Site Data
                    </li>
                    <li>
                        <strong>Safari:</strong> Preferences → Privacy → Manage Website Data
                    </li>
                    <li>
                        <strong>Edge:</strong> Settings → Cookies and site permissions
                    </li>
                </ul>
            </Section>

            <Section title="5. Changes to This Policy">
                <p>
                    We may update this Cookie Policy from time to time. Updates will be
                    reflected on this page with a revised date. Continued use of the Platform
                    constitutes acceptance of the updated policy.
                </p>
            </Section>

            <Section title="6. Contact">
                <p>
                    For any questions regarding our use of cookies, please contact us at:
                </p>
                <ContactBlock />
            </Section>

        </LegalPageWrapper>
    )
}