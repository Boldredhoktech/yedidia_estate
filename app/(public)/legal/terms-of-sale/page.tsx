// app/(public)/legal/terms-of-sale/page.tsx

import type { Metadata }              from 'next'
import LegalPageWrapper               from '@/components/public/LegalPageWrapper'
import { Section, ContactBlock }      from '@/components/public/LegalSection'
import { siteConfig }                 from '@/config/siteconfig'

export const metadata: Metadata = {
    title:       'Terms of Sale',
    description: `Terms and conditions governing subscriptions and transactions on ${siteConfig.name}.`,
}

export default function TermsOfSalePage() {
    return (
        <LegalPageWrapper
            title="Terms of Sale"
            subtitle={`Last updated: ${new Date().toLocaleDateString('en-GH', { day: 'numeric', month: 'long', year: 'numeric' })}`}
            icon="document"
        >

            <Section title="1. Scope">
                <p>
                    These Terms of Sale govern all commercial transactions between{' '}
                    {siteConfig.legal.companyName} and real estate agents ("Agents") who
                    purchase subscription formulas on the {siteConfig.name} platform
                    ({siteConfig.url}). By purchasing a subscription, you agree to these terms
                    in full.
                </p>
            </Section>

            <Section title="2. Subscription Formulas">
                <p>
                    {siteConfig.name} offers the following subscription plans, each granting
                    a defined number of property listing publications and a validity period:
                </p>
                <ul>
                    {siteConfig.formulas.map(f => (
                        <li key={f.key}>
                            <strong>{f.key} — {f.name}:</strong>{' '}
                            {f.pubCount} publications · {f.pubDurationDays / 30} month(s) per
                            publication · valid for {f.validityDays / 30} month(s).
                        </li>
                    ))}
                </ul>
                <p>
                    All new agents also benefit from a complimentary free offer of{' '}
                    {siteConfig.freeOffer.publicationsCount} publications valid for{' '}
                    {siteConfig.freeOffer.publicationDurationDays / 30} months, activated
                    automatically upon account approval.
                </p>
            </Section>

            <Section title="3. Pricing">
                <p>
                    All prices are displayed in Ghanaian Cedis (GHS) and are inclusive of
                    applicable taxes. Prices are set by {siteConfig.name} administration and
                    may be updated at any time. The price applicable to your purchase is the
                    price displayed at the time of transaction confirmation.
                </p>
            </Section>

            <Section title="4. Payment">
                <p>
                    Payments are accepted via the following methods:
                </p>
                <ul>
                    <li>
                        <strong>Paystack:</strong> Online payment via mobile money, card, or
                        bank transfer through the Paystack secure gateway. Payment is processed
                        immediately upon confirmation.
                    </li>
                    <li>
                        <strong>Manual payment:</strong> In cases where the online gateway is
                        unavailable, Agents may contact our support team to arrange payment by
                        alternative means. Manual subscriptions are activated by an administrator
                        upon confirmed receipt of payment.
                    </li>
                </ul>
                <p>
                    A payment receipt is automatically emailed to the Agent's registered email
                    address upon successful transaction.
                </p>
            </Section>

            <Section title="5. Subscription Activation & Publication Rules">
                <ul>
                    <li>
                        A subscription is activated immediately upon successful payment and
                        remains valid for the duration defined in the chosen formula.
                    </li>
                    <li>
                        An Agent may hold only one active subscription at a time. A new
                        subscription may be purchased only after the current one expires.
                    </li>
                    <li>
                        Each publication activated during a valid subscription runs for its
                        full duration even if the subscription itself expires before the
                        publication's end date.
                    </li>
                    <li>
                        Unused publication credits expire at the end of the subscription
                        validity period and are not refundable or transferable.
                    </li>
                    <li>
                        Once a publication is validated and made visible on the platform, it
                        cannot be modified by the Agent. Any modification requires intervention
                        by a Validation Agent.
                    </li>
                </ul>
            </Section>

            <Section title="6. Cancellation & Refund Policy">
                <p>
                    Due to the digital nature of our service and the immediate activation of
                    subscription credits, all sales are final. No refunds are issued once a
                    subscription has been activated and publication credits have been made
                    available, whether or not they have been used.
                </p>
                <p>
                    In exceptional circumstances (platform error, duplicate charge), refund
                    requests may be submitted to{' '}
                    <a href={`mailto:${siteConfig.contact.emailSupport}`}
                       className="text-brand-600 underline underline-offset-2">
                        {siteConfig.contact.emailSupport}
                    </a>{' '}
                    within 48 hours of the transaction. Each request is reviewed individually.
                </p>
            </Section>

            <Section title="7. Agent Obligations">
                <ul>
                    <li>
                        Agents must ensure all published listings are accurate, legal, and
                        belong to properties they are authorised to market.
                    </li>
                    <li>
                        Agents must not publish fraudulent, misleading, or illegal content.
                    </li>
                    <li>
                        Agents are solely responsible for any transactions or agreements made
                        with clients who contact them via the platform.
                    </li>
                    <li>
                        {siteConfig.name} reserves the right to suspend or terminate an Agent's
                        account and remove their listings without refund in cases of verified
                        fraudulent activity or breach of these terms.
                    </li>
                </ul>
            </Section>

            <Section title="8. Platform Liability">
                <p>
                    {siteConfig.name} acts solely as a listing platform and is not a party to
                    any transaction between Agents and their clients. We are not responsible
                    for the accuracy of listing content, the outcome of any property transaction,
                    or any loss, damage, or dispute arising between Agents and clients.
                </p>
            </Section>

            <Section title="9. Governing Law">
                <p>
                    These Terms of Sale are governed by the laws of the Republic of Ghana.
                    Any dispute arising from these terms shall be subject to the exclusive
                    jurisdiction of the courts of Accra, Ghana.
                </p>
            </Section>

            <Section title="10. Contact">
                <ContactBlock />
            </Section>

        </LegalPageWrapper>
    )
}