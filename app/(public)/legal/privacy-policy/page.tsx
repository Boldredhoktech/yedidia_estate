// app/(public)/legal/privacy-policy/page.tsx

import type { Metadata }              from 'next'
import LegalPageWrapper               from '@/components/public/LegalPageWrapper'
import { Section, ContactBlock }      from '@/components/public/LegalSection'
import { siteConfig }                 from '@/config/siteconfig'

export const metadata: Metadata = {
    title:       'Privacy Policy',
    description: `Privacy Policy of ${siteConfig.name} — how we collect, use and protect your personal data.`,
}

export default function PrivacyPolicyPage() {
    return (
        <LegalPageWrapper
            title="Privacy Policy"
            subtitle={`Last updated: ${new Date().toLocaleDateString('en-GH', { day: 'numeric', month: 'long', year: 'numeric' })}`}
            icon="shield"
        >

            <Section title="1. Introduction">
                <p>
                    {siteConfig.legal.companyName} ("{siteConfig.name}", "we", "us", or "our") operates
                    the website {siteConfig.url} (the "Platform"). This Privacy Policy explains how we
                    collect, use, disclose, and safeguard your information when you visit our Platform.
                    Please read this policy carefully. If you disagree with its terms, please discontinue
                    use of the Platform.
                </p>
            </Section>

            <Section title="2. Information We Collect">
                <p>We may collect the following categories of information:</p>
                <ul>
                    <li>
                        <strong>Visitor data:</strong> When you browse our Platform, we automatically
                        collect your IP address (anonymised), browser type, operating system, referring
                        URLs, pages visited, and timestamps. This data is used solely for analytics
                        and platform improvement.
                    </li>
                    <li>
                        <strong>Contact data:</strong> When you submit a complaint or contact us via
                        email or WhatsApp, we collect your name, email address, phone number, and the
                        content of your message.
                    </li>
                    <li>
                        <strong>Agent data:</strong> Real estate agents who register on the Platform
                        provide their full name, email address, phone number(s), and payment information
                        processed by our payment provider (Paystack). We do not store card details
                        directly on our servers.
                    </li>
                </ul>
            </Section>

            <Section title="3. How We Use Your Information">
                <ul>
                    <li>To operate and improve the Platform and its features.</li>
                    <li>To respond to complaints and enquiries submitted through our forms.</li>
                    <li>To send transactional emails (payment receipts, account notifications).</li>
                    <li>To analyse visitor traffic and improve user experience.</li>
                    <li>To comply with our legal obligations under Ghanaian law.</li>
                    <li>To detect and prevent fraudulent activity on the Platform.</li>
                </ul>
            </Section>

            <Section title="4. Sharing of Information">
                <p>
                    We do not sell, trade, or rent your personal data to third parties.
                    We may share your information with:
                </p>
                <ul>
                    <li>
                        <strong>Service providers:</strong> Supabase (database hosting), Resend (email
                        delivery), Paystack (payment processing), Vercel (hosting), and ipinfo.io
                        (IP geolocation). These providers process your data only as necessary to
                        provide their services and are bound by data processing agreements.
                    </li>
                    <li>
                        <strong>Legal authorities:</strong> Where required by law, court order, or
                        governmental authority in Ghana or internationally.
                    </li>
                    <li>
                        <strong>Legal partners:</strong> With your explicit consent, when you request
                        referral to a notary, lawyer or bailiff listed on our Platform.
                    </li>
                </ul>
            </Section>

            <Section title="5. Data Retention">
                <p>
                    We retain personal data only for as long as necessary for the purposes outlined
                    in this policy, or as required by applicable law. Visitor analytics data is
                    retained for up to 24 months. Complaint records are retained for 5 years in
                    accordance with Ghanaian civil proceedings limitations.
                </p>
            </Section>

            <Section title="6. Cookies">
                <p>
                    Our Platform uses session cookies and local storage to remember your preferences
                    (such as dismissed popups). We do not use tracking cookies without your consent.
                    For more information, please see our{' '}
                    <a href={siteConfig.legal.cookiePolicyUrl}
                       className="text-brand-600 underline underline-offset-2 hover:text-brand-800">
                        Cookie Policy
                    </a>.
                </p>
            </Section>

            <Section title="7. Your Rights">
                <p>Under applicable data protection law, you have the right to:</p>
                <ul>
                    <li>Access the personal data we hold about you.</li>
                    <li>Request correction of inaccurate or incomplete data.</li>
                    <li>Request deletion of your personal data where no legal obligation requires retention.</li>
                    <li>Object to or restrict processing of your personal data.</li>
                    <li>Lodge a complaint with the relevant data protection authority in Ghana.</li>
                </ul>
                <p>
                    To exercise any of these rights, please contact us at{' '}
                    <a href={`mailto:${siteConfig.contact.emailContact}`}
                       className="text-brand-600 underline underline-offset-2 hover:text-brand-800">
                        {siteConfig.contact.emailContact}
                    </a>.
                </p>
            </Section>

            <Section title="8. Security">
                <p>
                    We implement industry-standard security measures including password hashing
                    (Argon2id), HTTPS encryption, and restricted access controls to protect your
                    personal data. However, no method of transmission over the internet is 100%
                    secure, and we cannot guarantee absolute security.
                </p>
            </Section>

            <Section title="9. Third-Party Links">
                <p>
                    Our Platform may contain links to third-party websites (such as WhatsApp, social
                    media, or agent websites). We are not responsible for the privacy practices of
                    those websites and encourage you to review their privacy policies.
                </p>
            </Section>

            <Section title="10. Changes to This Policy">
                <p>
                    We reserve the right to update this Privacy Policy at any time. Changes will be
                    posted on this page with an updated revision date. Your continued use of the
                    Platform after changes constitutes acceptance of the revised policy.
                </p>
            </Section>

            <Section title="11. Contact">
                <p>
                    For any questions about this Privacy Policy, please contact us at:
                </p>
                <ContactBlock />
            </Section>

        </LegalPageWrapper>
    )
}

