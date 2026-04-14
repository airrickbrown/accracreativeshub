// ── src/components/DesignerAgreementPage.tsx ──
// Designer Agreement — Accra Creatives Hub
// Platform-side participation terms for independent creative professionals.

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

const P = ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
  <Body style={{ fontSize: 13, lineHeight: 1.9, marginBottom: 0, ...style }}>{children}</Body>
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

export default function DesignerAgreementPage({ onClose }: Props) {
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
          <Lbl style={{ marginBottom: 12, color: S.gold }}>For Designers</Lbl>
          <Hl style={{ fontSize: isMobile ? 32 : 48, fontWeight: 300, marginBottom: 12, lineHeight: 1.1 }}>
            Designer Agreement
          </Hl>
          <GoldLine />
          <Body style={{ fontSize: 13, marginBottom: 8 }}>
            <strong style={{ color: S.text }}>Platform:</strong> Accra Creatives Hub
            &nbsp;·&nbsp;
            <strong style={{ color: S.text }}>Last Updated:</strong> {lastUpdated}
          </Body>
          <Body style={{ fontSize: 13, lineHeight: 1.9, marginBottom: 12 }}>
            This Designer Agreement ("Agreement") sets out the terms under which independent creative
            professionals ("Designers") may apply to list their services on and participate in the
            Accra Creatives Hub platform ("Platform"). By submitting a designer application or
            listing services on the Platform, you agree to be bound by this Agreement, our{' '}
            <span style={{ color: S.gold }}>Terms of Service</span>, and our{' '}
            <span style={{ color: S.gold }}>Payments, Refunds &amp; Disputes Policy</span>.
          </Body>
          <div style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.18)', borderRadius: 8, padding: '14px 18px' }}>
            <Body style={{ fontSize: 13, lineHeight: 1.8, margin: 0, color: S.textMuted }}>
              <strong style={{ color: S.text }}>Independent Contractor Notice:</strong> Designers on
              Accra Creatives Hub are independent service providers, not employees, agents, or
              partners of the Platform. The Platform does not direct or control the manner in which
              creative work is produced. Designers are responsible for their own taxes, business
              compliance, and professional conduct.
            </Body>
          </div>
        </div>

        <Divider />

        {/* 1. Eligibility */}
        <Section title="1. Eligibility &amp; Onboarding">
          <Clause n="1.1" title="Who May Apply">
            <P>
              The Platform is open to creative professionals based in Ghana or offering services
              to Ghanaian and international clients. To apply, you must:
            </P>
            <UL items={[
              'Be at least 18 years of age.',
              'Hold a valid government-issued Ghanaian identification (Ghana Card or Passport).',
              'Possess genuine skills and a portfolio demonstrating the category of service you intend to offer.',
              'Agree to this Agreement and our Terms of Service.',
            ]} />
          </Clause>
          <Clause n="1.2" title="Editorial Review">
            <P>
              All designer applications are reviewed by our editorial board before your profile goes
              live. The review process typically takes <strong style={{ color: S.text }}>3–5 business days</strong> and
              considers the quality and originality of your portfolio, your professional presentation,
              and your responsiveness during onboarding. We reserve the right to approve, reject, or
              defer any application at our sole discretion, without being required to give reasons.
            </P>
          </Clause>
          <Clause n="1.3" title="Profile Accuracy">
            <P>
              You agree that all information submitted in your application and profile — including your
              name, location, portfolio samples, stated skills, pricing, and availability — is accurate,
              current, and not misleading. You must promptly update your profile if any material
              information changes. Submitting false or misleading information may result in immediate
              account removal.
            </P>
          </Clause>
          <Clause n="1.4" title="Identity Verification">
            <P>
              Government-issued identification submitted for verification is encrypted, stored securely,
              and used solely for identity verification purposes. It is never shared with clients or
              third parties except as required by Ghanaian law or a valid court order.
            </P>
          </Clause>
        </Section>

        {/* 2. Portfolio & IP */}
        <Section title="2. Portfolio, Content &amp; Intellectual Property">
          <Clause n="2.1" title="Portfolio Rights">
            <P>
              By uploading portfolio samples to the Platform, you confirm that you are the original
              creator of the work (or have the necessary rights to display it), and you grant Accra
              Creatives Hub a limited, non-exclusive, royalty-free licence to display those samples on
              the Platform and in promotional materials (including social media, marketing campaigns,
              and press coverage) for the purpose of operating and promoting the marketplace. This
              licence does not affect your ownership of the underlying work.
            </P>
          </Clause>
          <Clause n="2.2" title="Originality Requirement">
            <P>
              You must only submit work that is your own original creation. Submitting plagiarised
              work, work created primarily by AI tools without disclosure, or work for which you do
              not hold the necessary rights is a serious violation of this Agreement and may result
              in permanent removal and legal referral.
            </P>
          </Clause>
          <Clause n="2.3" title="Rights in Completed Deliverables">
            <P>
              Subject to full payment being received and cleared, rights in the final approved
              deliverables created for a client are typically transferred to or licensed to that
              client in accordance with the project agreement. You retain:
            </P>
            <UL items={[
              'Ownership of all pre-existing materials, tools, processes, and creative frameworks used in producing the work.',
              'The right to display the completed work in your portfolio, unless the client has requested confidentiality in writing at the time of brief submission.',
              'All rights in any rejected concepts, drafts, or work not forming part of the final approved deliverable, unless otherwise agreed in writing.',
            ]} />
          </Clause>
          <Clause n="2.4" title="Third-Party Assets">
            <P>
              Where your work incorporates licensed third-party assets (stock images, fonts, icons, etc.),
              you are responsible for ensuring the licence covers the client's intended use. You must
              disclose any asset licensing requirements to the client through the project chat before
              delivery. Failure to do so may expose you to dispute claims.
            </P>
          </Clause>
        </Section>

        {/* 3. Service Standards */}
        <Section title="3. Service Standards &amp; Professional Conduct">
          <Clause n="3.1" title="Quality of Work">
            <P>
              You agree to deliver work that meets the written brief agreed at the time of project
              commencement, produced to a professional standard consistent with your listed portfolio.
              Submitting substantially lower quality work than your portfolio represents may constitute
              grounds for a client refund and may affect your standing on the Platform.
            </P>
          </Clause>
          <Clause n="3.2" title="Deadlines &amp; Responsiveness">
            <P>
              You are responsible for delivering work within the timeline agreed in the brief. If you
              foresee a delay, you must communicate this to the client promptly via the platform chat
              and agree a revised timeline. Repeated missed deadlines or unresponsiveness may result
              in account suspension. We expect a response to client messages within{' '}
              <strong style={{ color: S.text }}>24 hours</strong> during active project engagements.
            </P>
          </Clause>
          <Clause n="3.3" title="Revisions">
            <P>
              You agree to complete the number of revision rounds specified in the brief at no additional
              cost, provided revision requests are specific, in writing, and within the scope of the
              original brief. Additional revisions beyond the agreed number may be subject to a fee
              agreed between you and the client in the platform chat. You may decline revision requests
              that materially expand the project scope beyond the original brief.
            </P>
          </Clause>
          <Clause n="3.4" title="Professional Communication">
            <P>
              All client communication must take place through the Platform's messaging system. This
              protects both parties by maintaining a verifiable record of project instructions, approvals,
              and changes. Moving project communications off-platform may affect your ability to be
              supported in a dispute.
            </P>
          </Clause>
          <Clause n="3.5" title="Circumvention Prohibition">
            <P>
              You must not solicit or accept direct payment from clients met through the Platform,
              bypass the Platform's payment workflow, or encourage clients to engage you outside the
              Platform for projects that originated on it. Circumvention fees apply as set out in
              the Terms of Service.
            </P>
          </Clause>
        </Section>

        {/* 4. Fees, Commissions & Payouts */}
        <Section title="4. Fees, Commissions &amp; Payouts">
          <Clause n="4.1" title="Listing">
            <P>
              There is no fee to create a designer profile or apply to the Platform. Listing is free.
            </P>
          </Clause>
          <Clause n="4.2" title="Commission">
            <P>
              Upon completion of a project, the Platform deducts a commission of{' '}
              <strong style={{ color: S.text }}>10%</strong> from the total project payment before
              releasing the balance to you. This commission rate applies to all completed transactions.
              The Platform reserves the right to revise the commission rate with{' '}
              <strong style={{ color: S.text }}>30 days' notice</strong> to designers. The rate
              applicable at the time of project initiation governs that transaction.
            </P>
          </Clause>
          <Clause n="4.3" title="Payout Conditions">
            <P>Funds are released to you subject to the following conditions:</P>
            <UL items={[
              'The client has approved the final delivery, or',
              '7 calendar days have passed since delivery notification with no dispute raised.',
              'No active dispute or investigation is pending on your account.',
            ]} />
            <Body style={{ fontSize: 13, lineHeight: 1.9, marginTop: 8 }}>
              Payouts are typically processed within <strong style={{ color: S.text }}>3–5 business days</strong> via
              Mobile Money (MTN MoMo, Vodafone Cash, AirtelTigo Money) or bank transfer to your
              registered payout account. Payout timelines may vary subject to Paystack's processing
              schedules and your bank or mobile money provider.
            </Body>
          </Clause>
          <Clause n="4.4" title="Taxes &amp; Legal Compliance">
            <P>
              You are solely responsible for all taxes, levies, and statutory deductions applicable
              to your income from services provided through the Platform, including income tax under
              the Income Tax Act, 2015 (Act 896) and any VAT obligations where applicable. The Platform
              does not withhold tax on your behalf. You are encouraged to seek appropriate tax advice
              if you are unsure of your obligations.
            </P>
          </Clause>
          <Clause n="4.5" title="Referral Programme">
            <P>
              Designers may earn referral rewards for clients they refer to the Platform who complete
              their first order. Referral terms, reward amounts, and eligibility criteria are set by
              the Platform and may change at any time with reasonable notice. Current referral terms
              are displayed in your designer dashboard.
            </P>
          </Clause>
          <Clause n="4.6" title="Independent Contractor Status &amp; Tax Obligations">
            <P>
              The designer agrees they are an independent contractor and not an employee, agent, or
              partner of Accra Creatives Hub. The designer is solely responsible for their tax
              obligations under Ghana Revenue Authority requirements, including income tax filing
              and any applicable VAT registration. Accra Creatives Hub does not withhold or remit
              taxes on behalf of designers.
            </P>
          </Clause>
        </Section>

        {/* 5. Account, Suspension & Termination */}
        <Section title="5. Account Management, Suspension &amp; Removal">
          <Clause n="5.1" title="Ongoing Curation Rights">
            <P>
              The Platform reserves the right to review, curate, suspend, or remove any designer
              profile or listing at any time, including for reasons of quality, conduct, user reports,
              legal compliance, or to protect the integrity of the marketplace. We are not obligated
              to retain every approved designer indefinitely.
            </P>
          </Clause>
          <Clause n="5.2" title="Grounds for Suspension or Removal">
            <P>Your account may be suspended or removed for any of the following:</P>
            <UL items={[
              'Submitting false, misleading, or plagiarised portfolio content.',
              'Repeated failure to meet agreed deadlines or maintain responsive communication.',
              "Engaging in circumvention of the Platform's payment workflow.",
              'Fraudulent or abusive conduct towards clients or the platform team.',
              'Violation of Ghanaian law, including IP infringement or AML/fraud-related offences.',
              'Receiving a pattern of substantiated client complaints.',
              'Any activity that harms the reputation or integrity of the marketplace.',
            ]} />
          </Clause>
          <Clause n="5.3" title="Effect of Termination">
            <P>
              Upon account termination, any funds relating to active projects will be handled in
              accordance with the dispute resolution process in our Terms of Service. Completed
              and paid-out projects are not affected by account termination.
            </P>
          </Clause>
        </Section>

        {/* 6. Disputes */}
        <Section title="6. Disputes &amp; Cooperation">
          <Clause n="6.1" title="Dispute Participation">
            <P>
              In the event a client raises a dispute regarding your project, you are required to
              cooperate fully with the Platform's dispute process — including providing evidence,
              responding to requests within stated timeframes, and engaging in good faith. Failure
              to cooperate may result in the dispute being resolved in the client's favour.
            </P>
          </Clause>
          <Clause n="6.2" title="Platform Decision">
            <P>
              The Platform's dispute decision is binding within the platform. You retain the right
              to seek remedies through Ghanaian courts or arbitration under the Alternative Dispute
              Resolution Act, 2010 (Act 798) if you believe the decision was unreasonable or unlawful.
            </P>
          </Clause>
        </Section>

        {/* 7. Confidentiality */}
        <Section title="7. Confidentiality">
          <Clause n="7.1" title="Client Information">
            <P>
              You may receive confidential information from clients in the course of a project
              engagement. You agree to keep such information confidential and not to use it for
              any purpose other than completing the agreed project, unless the client gives you
              written permission to do otherwise.
            </P>
          </Clause>
          <Clause n="7.2" title="Platform Confidentiality">
            <P>
              You agree not to disclose any non-public information about the Platform's operations,
              pricing structure, editorial criteria, or internal processes that you may become aware
              of through your participation on the Platform.
            </P>
          </Clause>
        </Section>

        {/* 8. Amendments */}
        <Section title="8. Amendments &amp; Governing Law">
          <Clause n="8.1" title="Updates to this Agreement">
            <P>
              This Agreement may be updated from time to time. Designers will be notified of material
              changes via email at least 14 days before changes take effect. Continued participation
              on the Platform after the effective date constitutes acceptance of the updated Agreement.
            </P>
          </Clause>
          <Clause n="8.2" title="Governing Law">
            <P>
              This Agreement is governed by the laws of the Republic of Ghana. Any disputes arising
              under or in connection with this Agreement that cannot be resolved through the Platform's
              internal process may be referred to arbitration under the Alternative Dispute Resolution
              Act, 2010 (Act 798), with the seat of arbitration in Accra, Ghana.
            </P>
          </Clause>
        </Section>

        {/* Contact */}
        <div style={{ background: S.surface, border: `1px solid ${S.border}`, padding: isMobile ? '24px 20px' : '32px 36px', marginTop: 40 }}>
          <Lbl style={{ marginBottom: 12, color: S.gold }}>Designer Support</Lbl>
          <Hl style={{ fontSize: 18, fontWeight: 400, marginBottom: 12 }}>Questions about this Agreement?</Hl>
          <Body style={{ fontSize: 13, lineHeight: 1.9 }}>
            For designer-specific queries: <strong style={{ color: S.text }}>designers@accracreativeshub.com</strong>
            <br />
            For legal enquiries: <strong style={{ color: S.text }}>legal@accracreativeshub.com</strong>
            <br />
            For payment and payout queries: <strong style={{ color: S.text }}>support@accracreativeshub.com</strong>
            <br /><br />
            <em style={{ color: S.textFaint, fontSize: 12 }}>
              This Agreement has been drafted for use under the laws of the Republic of Ghana.
              Designers are encouraged to seek independent legal advice before accepting if they
              have questions about their rights or obligations. This document does not constitute
              legal advice.
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
