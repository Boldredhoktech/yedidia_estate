// app/(public)/legal/delivery/page.tsx

import type { Metadata }         from 'next'
import LegalPageWrapper          from '@/components/public/LegalPageWrapper'
import { Section, ContactBlock } from '@/app/(public)/legal/privacy-policy/page'
import { siteConfig }            from '@/config/siteconfig'

export const metadata: Metadata = {
    title:       'Delivery Conditions',
    description: `Delivery conditions for digital services provided by ${siteConfig.name}.`,
}

export default function DeliveryPage() {
    return (
        <LegalPageWrapper
            title="Delivery Conditions"
            subtitle="How our digital services are delivered"
            icon="truck"
        >

            <Section title="1. Nature of Services">
                <p>
                    {siteConfig.name} provides exclusively digital services in the form of
                    online property listing subscriptions. No physical goods are sold or
                    shipped through this Platform. All services are delivered electronically
                    and are available immediately upon successful payment.
                </p>
            </Section>

            <Section title="2. Delivery of Subscription Access">
                <p>
                    Upon successful payment confirmation by our payment provider (Paystack)
                    or manual validation by an administrator, the following are delivered
                    electronically and without delay:
                </p>
                <ul>
                    <li>
                        Activation of the chosen subscription formula on the Agent's account.
                    </li>
                    <li>
                        Credit of the corresponding number of publication slots in the Agent's
                        dashboard.
                    </li>
                    <li>
                        Automatic dispatch of a payment receipt to the Agent's registered
                        email address.
                    </li>
                </ul>
                <p>
                    In the case of manual payments, activation occurs within 24 to 48 business
                    hours of payment confirmation by our support team.
                </p>
            </Section>

            <Section title="3. Publication Delivery">
                <p>
                    Property listings submitted by Agents are reviewed by our Validation team.
                    Once validated, listings are immediately published and made visible to all
                    visitors of the Platform. The publication timer starts from the date of
                    validation, and the listing remains active for the duration defined by the
                    Agent's subscription formula.
                </p>
                <p>
                    Validation is typically completed within 24 business hours of submission.
                    {siteConfig.name} reserves the right to reject listings that do not comply
                    with our content standards, without refund of publication credits.
                </p>
            </Section>

            <Section title="4. Email Delivery">
                <p>
                    Transactional emails (receipts, account notifications, expiry alerts) are
                    sent via our email provider (Resend) to the email address registered on
                    the Agent's account. Delivery is typically immediate but may be subject
                    to delays caused by recipient email filters or provider outages.
                </p>
                <p>
                    If you do not receive an expected email, please check your spam folder or
                    contact us at{' '}
                    <a href={`mailto:${siteConfig.contact.emailSupport}`}
                       className="text-brand-600 underline underline-offset-2">
                        {siteConfig.contact.emailSupport}
                    </a>.
                </p>
            </Section>

            <Section title="5. Service Availability">
                <p>
                    {siteConfig.name} aims to maintain Platform availability 24 hours a day,
                    7 days a week. However, we do not guarantee uninterrupted service and
                    reserve the right to perform maintenance that may temporarily affect
                    access. We will endeavour to notify users of planned downtime in advance
                    where possible.
                </p>
            </Section>

            <Section title="6. Google Merchant Compliance">
                <p>
                    These Delivery Conditions are provided in accordance with Google Merchant
                    Center requirements for platforms listing services online. All services
                    offered on {siteConfig.name} are digital in nature and are delivered
                    electronically as described above. No physical delivery is involved.
                </p>
            </Section>

            <Section title="7. Contact">
                <ContactBlock />
            </Section>

        </LegalPageWrapper>
    )
}