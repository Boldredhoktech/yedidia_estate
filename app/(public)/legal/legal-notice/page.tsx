// app/(public)/legal/legal-notice/page.tsx

import type { Metadata }         from 'next'
import LegalPageWrapper          from '@/components/public/LegalPageWrapper'
import { Section, ContactBlock } from '@/components/public/LegalSection'
import { siteConfig }            from '@/config/siteconfig'
import { agencyConfig }          from '@/config/agency'

export const metadata: Metadata = {
    title:       'Legal Notice',
    description: `Legal information and publisher details for ${siteConfig.name}.`,
}

export default function LegalNoticePage() {
    return (
        <LegalPageWrapper
            title="Legal Notice"
            subtitle="Publisher information and legal disclosures"
            icon="scale"
        >

            <Section title="1. Platform Publisher">
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-5
                        flex flex-col gap-2">
                    <Row label="Company name"     value={siteConfig.legal.companyName} />
                    <Row label="Registration no." value={siteConfig.legal.registrationNumber} />
                    <Row label="VAT number"       value={siteConfig.legal.vatNumber} />
                    <Row label="Headquarters"     value={siteConfig.address.full} />
                    <Row label="Email"            value={siteConfig.contact.emailContact} />
                    <Row label="Phone"            value={siteConfig.contact.phoneMain} />
                    <Row label="Website"          value={siteConfig.url} />
                    <Row label="Founded"          value={String(agencyConfig.foundedYear)} />
                </div>
            </Section>

            <Section title="2. Publication Director">
                <p>
                    The publication director of {siteConfig.name} is the legal representative
                    of {siteConfig.legal.companyName}, whose registered office is at{' '}
                    {siteConfig.address.full}, Ghana.
                </p>
            </Section>

            <Section title="3. Hosting">
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-5
                        flex flex-col gap-2">
                    <Row label="Hosting provider"  value="Vercel Inc." />
                    <Row label="Address"           value="440 N Barranca Ave #4133, Covina, CA 91723, USA" />
                    <Row label="Website"           value="https://vercel.com" />
                    <Row label="Database provider" value="Supabase Inc. (hosted on AWS)" />
                    <Row label="Email provider"    value="Resend (Resend Inc.)" />
                </div>
            </Section>

            <Section title="4. Intellectual Property">
                <p>
                    All content on this Platform — including but not limited to text, images,
                    logos, graphics, and software — is the property of{' '}
                    {siteConfig.legal.companyName} or its content providers and is protected
                    by Ghanaian and international intellectual property law.
                </p>
                <p>
                    Property listing content (photos, videos, descriptions) is provided by
                    registered Agents who retain ownership of their materials. By publishing
                    on our Platform, Agents grant {siteConfig.name} a non-exclusive,
                    royalty-free licence to display such content for the duration of the listing.
                </p>
                <p>
                    Any reproduction, distribution, or modification of Platform content without
                    prior written consent of {siteConfig.legal.companyName} is strictly prohibited.
                </p>
            </Section>

            <Section title="5. Disclaimer of Liability">
                <p>
                    {siteConfig.name} acts as a listing and advertisement platform only.
                    We do not participate in, endorse, or guarantee any transaction between
                    Agents and visitors. We are not responsible for:
                </p>
                <ul>
                    <li>The accuracy, legality, or authenticity of any listing content.</li>
                    <li>Any financial loss, damage, or dispute arising from a property transaction.</li>
                    <li>The conduct of any Agent or visitor using the Platform.</li>
                    <li>Temporary unavailability of the Platform due to technical maintenance.</li>
                </ul>
                <p>
                    Visitors and buyers are strongly advised to conduct thorough due diligence
                    and seek independent legal counsel before entering into any property agreement.
                </p>
            </Section>

            <Section title="6. Applicable Law">
                <p>
                    This Platform is operated in accordance with the laws of the Republic of Ghana.
                    Any dispute relating to the use of this Platform shall fall under the exclusive
                    jurisdiction of the competent courts of Accra, Ghana.
                </p>
            </Section>

            <Section title="7. Contact">
                <ContactBlock />
            </Section>

        </LegalPageWrapper>
    )
}

// ─────────────────────────────────────────────
// ROW helper — key/value display
// ─────────────────────────────────────────────

function Row({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex flex-wrap gap-2 text-sm">
            <span className="text-gray-500 font-medium min-w-[140px]">{label}:</span>
            <span className="text-gray-900 font-semibold">{value}</span>
        </div>
    )
}