// ── src/components/PaymentsDisputesPage.tsx ──
// Payments, Refunds & Disputes Policy
// Accra Creatives Hub — Ghana marketplace
// Explains the platform payment workflow, refund rules, and dispute process.

import React, { useState, useEffect } from 'react'
import { S } from '../styles/tokens'
import { Hl, Body, Lbl, GoldLine, Divider, Btn } from './UI'
import Nav from './Nav'

interface Props { onClose: () => void }

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div style={{ marginBottom: 40 }}>
    <Hl style={{ fontSize: 18, fontWeight: 500, marginBottom: 12, color: S.text }}>{title}</Hl>
    <div style={{ borderLeft: `2px solid rgba(201,168,76,0.2)`, paddingLeft: 20 }}>
      {children}
    </div>
  </div>
)

const Clause = ({ n, title, children }: { n: string; title: string; children: React.ReactNode }) => (
  <div style={{ marginBottom: 18 }}>
    <div style={{ display: 'flex', gap: 10, marginBottom: 6, alignItems: 'baseline' }}>
      <span style={{ color: S.gold, fontFamily: S.headline, fontSize: 11, flexShrink: 0 }}>{n}</span>
      <Body style={{ fontSize: 13, fontWeight: 600, color: S.text, margin: 0 }}>{title}</Body>
    </div>
    <div style={{ paddingLeft: 22 }}>{children}</div>
  </div>
)

const P = ({ children }: { children: React.ReactNode }) => (
  <Body style={{ fontSize: 13, lineHeight: 1.9, marginBottom: 0 }}>{children}</Body>
)

const UL = ({ items }: { items: string[] }) => (
  <ul style={{ paddingLeft: 20, marginTop: 8, marginBottom: 0 }}>
    {items.map((item, i) => (
      <li key={i} style={{ marginBottom: 6 }}>
        <Body style={{ fontSize: 13, lineHeight: 1.8, margin: 0 }}>{item}</Body>
      </li>
    ))}
  </ul>
)

export default function PaymentsDisputesPage({ onClose }: Props) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const lastUpdated = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 210, background: S.bgDeep, overflowY: 'auto' }}>
      <Nav
        scrolled={true} user={null}
        onAdmin={() => {}} onSignup={() => {}} onMessages={() => {}}
        onMarketplace={onClose} onHowItWorks={onClose} onForDesigners={onClose}
        onLogin={() => {}} onSignOut={() => {}}
      />

      <div style={{ maxWidth: 820, margin: '0 auto', padding: isMobile ? '88px 20px 60px' : '100px 40px 80px' }}>

        {/* Header */}
        <div style={{ marginBottom: 48 }}>
          <Lbl style={{ marginBottom: 12, color: S.gold }}>Legal</Lbl>
          <Hl style={{ fontSize: isMobile ? 32 : 48, fontWeight: 300, marginBottom: 12, lineHeight: 1.1 }}>
            Payments, Refunds &amp; Disputes
          </Hl>
          <GoldLine />
          <Body style={{ fontSize: 13, marginBottom: 8 }}>
            <strong style={{ color: S.text }}>Platform:</strong> Accra Creatives Hub
            &nbsp;·&nbsp;
            <strong style={{ color: S.text }}>Last Updated:</strong> {lastUpdated}
          </Body>
          <Body style={{ fontSize: 13, lineHeight: 1.9 }}>
            This policy explains how payments work on Accra Creatives Hub, when refunds may be issued,
            and how disputes between clients and designers are handled. All payments on the platform are
            processed by <strong style={{ color: S.text }}>Paystack</strong>, a licensed payment service
            provider. By using the platform, you agree to this policy alongside our{' '}
            <span style={{ color: S.gold }}>Terms of Service</span>.
          </Body>
        </div>

        <Divider />

        {/* 1. How Payments Work */}
        <Section title="1. How Payments Work">
          <Clause n="1.1" title="Payment Processor">
            <P>
              All payments on the Accra Creatives Hub platform are processed by <strong style={{ color: S.text }}>Paystack</strong>,
              a licensed payment service provider operating in Ghana and across Africa. By making a payment,
              you also agree to Paystack's terms of service. Accra Creatives Hub does not store card details
              or act as a licensed deposit-taking institution.
            </P>
          </Clause>
          <Clause n="1.2" title="Supported Payment Methods">
            <P>Payments may be made via the methods supported by Paystack at the time of checkout, which typically include:</P>
            <UL items={[
              'Debit and credit cards (Visa, Mastercard)',
              'Mobile Money (MTN MoMo, Vodafone Cash, AirtelTigo Money)',
              'Bank transfers (where available)',
              'USSD (where available)',
            ]} />
            <Body style={{ fontSize: 13, lineHeight: 1.9, marginTop: 8 }}>
              Available methods may vary and are subject to Paystack's current offerings.
            </Body>
          </Clause>
          <Clause n="1.3" title="Currency">
            <P>
              All transactions are denominated in Ghana Cedis (GH₵). Prices displayed on the platform
              are in GH₵ unless otherwise stated. The platform does not currently support multi-currency checkout.
            </P>
          </Clause>
          <Clause n="1.4" title="When Funds Are Considered Received">
            <P>
              Funds are considered received by the platform upon successful confirmation from Paystack.
              You will receive an email confirmation of your payment. Work on your project may begin once
              the designer accepts the brief and payment is confirmed.
            </P>
          </Clause>
          <Clause n="1.5" title="Platform Commission">
            <P>
              The platform deducts a commission of <strong style={{ color: S.text }}>10%</strong> from
              each completed project payment before releasing the balance to the designer. This commission
              covers platform operations, payment processing, verification services, and customer support.
              The commission rate applicable at the time of project initiation governs that transaction.
            </P>
          </Clause>
        </Section>

        {/* 2. Project Flow & Delivery */}
        <Section title="2. Project Flow &amp; Delivery">
          <Clause n="2.1" title="When Work Begins">
            <P>
              Work on a project begins after: (a) the client has submitted the project brief; (b) the
              designer has accepted the engagement; and (c) payment has been confirmed. Designers are
              responsible for commencing work within the agreed timeline.
            </P>
          </Clause>
          <Clause n="2.2" title="Delivery Notification">
            <P>
              When a designer marks a project as delivered, the client receives a notification via the
              platform and by email. The client then enters a review window to inspect the work.
            </P>
          </Clause>
          <Clause n="2.3" title="Review &amp; Acceptance Window">
            <P>
              Upon receiving a delivery notification, the client has <strong style={{ color: S.text }}>7 calendar days</strong> to:
            </P>
            <UL items={[
              'Approve the delivery — triggering immediate payment release to the designer.',
              'Request a revision (subject to the revision rounds agreed in the brief).',
              'Raise a formal dispute — which pauses any automatic release.',
            ]} />
            <Body style={{ fontSize: 13, lineHeight: 1.9, marginTop: 8 }}>
              If no action is taken within 7 calendar days and no dispute has been raised, funds are
              released to the designer automatically. This constitutes deemed acceptance of the delivery.
            </Body>
          </Clause>
          <Clause n="2.4" title="Revisions">
            <P>
              The number of revision rounds is agreed at the time of brief submission. Additional revisions
              beyond the agreed rounds may be subject to additional charges, to be agreed between the
              client and designer directly through the platform chat. Revision requests must be specific,
              written, and related to the original brief.
            </P>
          </Clause>
          <Clause n="2.5" title="Designer Payouts">
            <P>
              Upon project approval (or automatic release), funds are released to the designer within{' '}
              <strong style={{ color: S.text }}>3–5 business days</strong> via Mobile Money or bank
              transfer, subject to the designer's registered payout method. Designers are solely
              responsible for any taxes, levies, or withholdings applicable to their earnings under
              Ghanaian law.
            </P>
          </Clause>
        </Section>

        {/* 3. Refund Policy */}
        <Section title="3. Refund Policy">
          <Clause n="3.1" title="Refund Eligibility">
            <P>
              A client may request a full refund only in the following circumstances:
            </P>
            <UL items={[
              'The designer fails to deliver the agreed work within the agreed timeframe and does not respond to a formal delivery request within 48 hours.',
              'The delivered work materially fails to meet the written brief agreed at project commencement — not merely a difference in creative preference.',
              'The designer is found to have submitted plagiarised, AI-generated (without prior disclosure), or third-party work as their own original output.',
            ]} />
          </Clause>
          <Clause n="3.2" title="Partial Refunds">
            <P>
              Where a project is partially completed at the time of a valid dispute, the platform may,
              at its sole discretion, issue a partial refund proportional to the work completed and
              approved by the client up to that point. The platform's assessment of completion level
              will be based on available evidence including chat records, deliverable files, and
              the original brief.
            </P>
          </Clause>
          <Clause n="3.3" title="Non-Refundable Circumstances">
            <P>Refunds will not be issued where:</P>
            <UL items={[
              'The client has explicitly approved the final delivery.',
              'The client has materially changed the project brief after work commenced, without the designer\'s written agreement.',
              'The client is dissatisfied with the creative style or personal aesthetic preference alone, where the work technically meets the agreed brief.',
              'The refund request is made more than 14 calendar days after the delivery notification date.',
              'The client fails to engage with the revision process in good faith.',
            ]} />
          </Clause>
          <Clause n="3.4" title="Refund Processing">
            <P>
              Approved refunds are processed within <strong style={{ color: S.text }}>5–10 business days</strong> to
              the original payment method via Paystack. The platform's 10% commission is non-refundable
              except in cases of demonstrated platform error. Paystack's own processing timelines and
              policies may also apply.
            </P>
          </Clause>
          <Clause n="3.5" title="Chargebacks">
            <P>
              Initiating a chargeback through your bank or card provider without first engaging the
              platform's dispute process may result in account suspension. We encourage all users to
              resolve issues through the platform before contacting their payment provider. Fraudulent
              or abusive chargeback activity may be reported to relevant Ghanaian authorities.
            </P>
          </Clause>
        </Section>

        {/* 4. Dispute Process */}
        <Section title="4. Dispute Process">
          <Clause n="4.1" title="How to Raise a Dispute">
            <P>
              Either party may raise a formal dispute within <strong style={{ color: S.text }}>14 calendar days</strong> of
              the project delivery notification. To raise a dispute:
            </P>
            <UL items={[
              'Use the "Raise Dispute" option within the order chat on the platform, or',
              'Email disputes@accracreativeshub.com with your order ID, a written description of the issue, and any supporting evidence.',
            ]} />
            <Body style={{ fontSize: 13, lineHeight: 1.9, marginTop: 8 }}>
              Raising a dispute pauses any automatic payment release until the matter is resolved.
            </Body>
          </Clause>
          <Clause n="4.2" title="Evidence Submission">
            <P>
              Both parties will be invited to submit evidence to support their position. Relevant evidence
              may include: the original project brief, screenshots of chat conversations, submitted files
              and deliverables, revision requests, and any written agreements made through the platform.
              Evidence must be submitted within <strong style={{ color: S.text }}>5 business days</strong> of
              being requested by the platform team.
            </P>
          </Clause>
          <Clause n="4.3" title="Platform Review">
            <P>
              The platform will review all submitted evidence and aim to issue a decision within{' '}
              <strong style={{ color: S.text }}>10 business days</strong> of receiving complete submissions
              from both parties. The platform team will:
            </P>
            <UL items={[
              'Notify both parties within 24 hours of a dispute being raised.',
              'Review all available evidence objectively.',
              'Consider the original brief, chat history, deliverables, and revision records.',
              'Issue a binding decision on payment release, partial release, or refund.',
            ]} />
          </Clause>
          <Clause n="4.4" title="Platform Authority">
            <P>
              The platform reserves the right to make a final determination on disputes based on the
              available evidence. This determination is binding on both parties within the platform.
              Neither party is prevented from seeking remedies through Ghanaian courts or arbitration
              under the Alternative Dispute Resolution Act, 2010 (Act 798) if they believe the
              platform's decision was unreasonable or unlawful.
            </P>
          </Clause>
          <Clause n="4.5" title="Cooperation Requirement">
            <P>
              Both clients and designers are required to cooperate with the dispute process in good
              faith, respond to requests within the stated timeframes, and provide accurate information.
              Failure to cooperate, provide false evidence, or attempt to manipulate the dispute process
              may result in account suspension and forfeiture of the disputed funds.
            </P>
          </Clause>
          <Clause n="4.6" title="Timeframes Summary">
            <Body style={{ fontSize: 13, lineHeight: 1.9 }}>
              The following timelines apply to the dispute process:
            </Body>
            <div style={{ background: S.bgLow, border: `1px solid ${S.borderFaint}`, borderRadius: 6, padding: '14px 18px', marginTop: 10 }}>
              {[
                ['Dispute window', '14 days from delivery notification'],
                ['Platform acknowledgement', 'Within 24 hours of dispute raised'],
                ['Evidence submission deadline', '5 business days from request'],
                ['Platform decision', 'Within 10 business days of complete evidence'],
                ['Refund processing (if approved)', '5–10 business days via Paystack'],
              ].map(([label, value]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, padding: '6px 0', borderBottom: `1px solid ${S.borderFaint}` }}>
                  <Body style={{ fontSize: 12, color: S.textMuted, margin: 0 }}>{label}</Body>
                  <Body style={{ fontSize: 12, color: S.text, margin: 0, fontWeight: 600 }}>{value}</Body>
                </div>
              ))}
            </div>
          </Clause>
        </Section>

        {/* 5. General */}
        <Section title="5. General">
          <Clause n="5.1" title="Policy Updates">
            <P>
              This policy may be updated from time to time. Where changes are material, users will be
              notified by email and via an in-platform notice at least 14 days before the change takes
              effect. Continued use of the platform after the effective date constitutes acceptance
              of the updated policy.
            </P>
          </Clause>
          <Clause n="5.2" title="Governing Law">
            <P>
              This policy is governed by and construed in accordance with the laws of the Republic of
              Ghana. Any disputes not resolved through the platform's dispute process may be referred
              to arbitration under the Alternative Dispute Resolution Act, 2010 (Act 798) of Ghana,
              with the seat of arbitration in Accra.
            </P>
          </Clause>
          <Clause n="5.3" title="Contact">
            <P>
              For payment queries: <strong style={{ color: S.text }}>clients@accracreativeshub.com</strong>
              <br />
              For disputes: <strong style={{ color: S.text }}>disputes@accracreativeshub.com</strong>
              <br />
              For legal enquiries: <strong style={{ color: S.text }}>legal@accracreativeshub.com</strong>
            </P>
          </Clause>
        </Section>

        {/* Legal note */}
        <div style={{ background: S.surface, border: `1px solid ${S.border}`, padding: isMobile ? '24px 20px' : '28px 32px', marginTop: 8 }}>
          <Body style={{ fontSize: 12, color: S.textFaint, lineHeight: 1.8, margin: 0 }}>
            <em>
              This policy has been drafted for use under the laws of the Republic of Ghana and should be
              reviewed by a qualified Ghanaian legal practitioner before enforcement. The platform aims to
              operate fairly and transparently; this document does not constitute legal advice.
              {/* TODO: Review payment hold mechanics with legal counsel once Paystack integration is finalised */}
            </em>
          </Body>
        </div>

        <div style={{ marginTop: 32, textAlign: 'center' }}>
          <Btn variant="ghost" size="sm" onClick={onClose}>← Back</Btn>
        </div>
      </div>
    </div>
  )
}
