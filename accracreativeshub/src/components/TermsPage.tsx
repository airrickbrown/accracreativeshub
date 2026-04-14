// ── TERMS & CONDITIONS PAGE ──
// Accra Creatives Hub — Ghana marketplace T&C
// Covers: payments, disputes, refunds, liability, user conduct

import React, { useState, useEffect } from 'react'
import { S } from '../styles/tokens'
import { Hl, Body, Lbl, GoldLine, Divider } from './UI'
import Nav from './Nav'

interface TermsPageProps {
  onClose: () => void
}

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

export default function TermsPage({ onClose }: TermsPageProps) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const effective = 'January 1, 2025'
  const lastUpdated = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 210, background: S.bgDeep, overflowY: 'auto' }}>
      <Nav
        scrolled={true}
        user={null}
        onAdmin={() => {}}
        onSignup={() => {}}
        onMessages={() => {}}
        onMarketplace={onClose}
        onHowItWorks={onClose}
        onForDesigners={onClose}
        onLogin={() => {}}
        onSignOut={() => {}}
      />

      <div style={{ maxWidth: 820, margin: '0 auto', padding: isMobile ? '88px 20px 60px' : '100px 40px 80px' }}>

        {/* Header */}
        <div style={{ marginBottom: 48 }}>
          <Lbl style={{ marginBottom: 12, color: S.gold }}>Legal</Lbl>
          <Hl style={{ fontSize: isMobile ? 32 : 48, fontWeight: 300, marginBottom: 12, lineHeight: 1.1 }}>
            Terms &amp; Conditions
          </Hl>
          <GoldLine />
          <Body style={{ fontSize: 13, marginBottom: 8 }}>
            <strong style={{ color: S.text }}>Platform:</strong> Accra Creatives Hub
            &nbsp;·&nbsp;
            <strong style={{ color: S.text }}>Effective:</strong> {effective}
            &nbsp;·&nbsp;
            <strong style={{ color: S.text }}>Last Updated:</strong> {lastUpdated}
          </Body>
          <Body style={{ fontSize: 13, lineHeight: 1.9 }}>
            These Terms &amp; Conditions ("Terms") govern your access to and use of the Accra Creatives Hub
            platform ("Platform"), operated by Accra Creatives Hub ("we", "us", "our"). By accessing or using
            the Platform, you agree to be bound by these Terms. If you do not agree, you must not use the Platform.
            The Platform operates under the laws of the Republic of Ghana.
          </Body>
        </div>

        <Divider />

        {/* 1. Definitions */}
        <Section title="1. Definitions">
          <Body style={{ fontSize: 13, lineHeight: 1.9, marginBottom: 12 }}>
            In these Terms, the following definitions apply:
          </Body>
          {[
            ['"Platform"', 'The Accra Creatives Hub website, web application, and associated services at accracreativeshub.com.'],
            ['"Client"', 'Any registered user who engages a Designer through the Platform to obtain design services.'],
            ['"Designer"', 'Any verified creative professional who has been approved by our editorial board and lists services on the Platform.'],
            ['"Project"', 'Any agreed engagement between a Client and Designer facilitated through the Platform.'],
            ['"Payment Hold"', 'The platform-managed process by which funds paid by a Client are held pending successful delivery and approval of a Project, facilitated through Paystack and released according to these Terms.'],
            ['"Commission"', 'The Platform\'s fee (currently 10%) deducted from each completed transaction.'],
            ['"GH₵"', 'Ghana Cedis — the currency used for all transactions on the Platform.'],
          ].map(([term, def]) => (
            <div key={term} style={{ display: 'flex', gap: 12, marginBottom: 8 }}>
              <Body style={{ fontSize: 12, margin: 0, color: S.gold, flexShrink: 0, fontWeight: 600 }}>{term}</Body>
              <Body style={{ fontSize: 12, margin: 0, lineHeight: 1.8 }}>{def}</Body>
            </div>
          ))}
        </Section>

        {/* 2. Eligibility & Registration */}
        <Section title="2. Eligibility &amp; Account Registration">
          <Clause n="2.1" title="Eligibility">
            <Body style={{ fontSize: 13, lineHeight: 1.9 }}>
              You must be at least 18 years of age and legally capable of entering into binding contracts under
              Ghanaian law to use the Platform. By registering, you represent that all information you provide
              is accurate, current, and complete.
            </Body>
          </Clause>
          <Clause n="2.2" title="Account Security">
            <Body style={{ fontSize: 13, lineHeight: 1.9 }}>
              You are responsible for maintaining the confidentiality of your login credentials. You agree to
              notify us immediately at support@accracreativeshub.com if you suspect unauthorised access to your
              account. We are not liable for any loss resulting from unauthorised use of your account.
            </Body>
          </Clause>
          <Clause n="2.3" title="Designer Verification">
            <Body style={{ fontSize: 13, lineHeight: 1.9 }}>
              Designer accounts are subject to editorial review and identity verification. Government-issued
              identification (Ghana Card or Passport) is required. We reserve the right to approve, reject,
              or suspend Designer accounts at our sole discretion. Verification does not constitute an
              employment relationship.
            </Body>
          </Clause>
        </Section>

        {/* 3. Payments */}
        <Section title="3. Payments">
          <Clause n="3.1" title="Payment Processing">
            <Body style={{ fontSize: 13, lineHeight: 1.9 }}>
              All payments are processed through Paystack, a licensed payment service provider operating in
              Ghana. By making a payment, you agree to Paystack's terms of service. The Platform does not
              store credit card details. All transactions are denominated in Ghana Cedis (GH₵).
            </Body>
          </Clause>
          <Clause n="3.2" title="Payment Protection Workflow">
            <Body style={{ fontSize: 13, lineHeight: 1.9 }}>
              Upon project initiation, the agreed Project fee is processed by Paystack and held through
              the Platform's payment workflow pending delivery and approval. Funds are released to the
              Designer only upon the Client's explicit written approval of the final deliverable, or
              automatically after 7 days if no dispute has been raised following delivery notification.
              The Platform is not a licensed deposit-taking institution or regulated escrow agent; funds
              are managed operationally by the Platform in accordance with these Terms and Paystack's
              payment services.
            </Body>
          </Clause>
          <Clause n="3.3" title="Platform Commission">
            <Body style={{ fontSize: 13, lineHeight: 1.9 }}>
              The Platform deducts a commission of 10% from each completed Project payment before releasing
              funds to the Designer. This commission covers platform maintenance, payment processing,
              verification services, and customer support. The commission rate may be revised with 30 days'
              written notice.
            </Body>
          </Clause>
          <Clause n="3.4" title="Designer Payouts">
            <Body style={{ fontSize: 13, lineHeight: 1.9 }}>
              Approved funds are released to Designers within 3–5 business days via Mobile Money (MTN MoMo,
              Vodafone Cash, AirtelTigo Money) or bank transfer. Designers are responsible for any taxes,
              levies, or withholdings required under Ghanaian law, including income tax obligations under the
              Internal Revenue Act, 2000 (Act 592) and its amendments.
            </Body>
          </Clause>
          <Clause n="3.5" title="Currency & Taxes">
            <Body style={{ fontSize: 13, lineHeight: 1.9 }}>
              All listed prices are in GH₵ and are exclusive of any applicable taxes. Where VAT or other
              levies apply under Ghanaian law, these will be displayed at checkout. The Platform collects
              applicable taxes where legally required.
            </Body>
          </Clause>
          <Clause n="3.6" title="Paystack as Payment Custodian">
            <Body style={{ fontSize: 13, lineHeight: 1.9 }}>
              All payments are processed through Paystack, a licensed payment service provider. Client
              funds are held by Paystack until the client approves delivery. Accra Creatives Hub does not
              hold client funds directly. Paystack's own terms of service govern the custody and release
              of these funds.
            </Body>
          </Clause>
        </Section>

        {/* 4. Refunds */}
        <Section title="4. Refund Policy">
          <Clause n="4.1" title="Eligibility for Refunds">
            <Body style={{ fontSize: 13, lineHeight: 1.9 }}>
              A Client may request a full refund in the following circumstances only:
            </Body>
            <ul style={{ paddingLeft: 20, marginTop: 8 }}>
              {[
                'The Designer fails to deliver the agreed work within the agreed timeframe and does not respond within 48 hours of a formal delivery request.',
                'The delivered work materially fails to meet the written brief agreed at project commencement.',
                'The Designer is found to have submitted plagiarised, AI-generated (without disclosure), or third-party work as original.',
              ].map((item, i) => (
                <li key={i} style={{ marginBottom: 6 }}>
                  <Body style={{ fontSize: 13, lineHeight: 1.8, margin: 0 }}>{item}</Body>
                </li>
              ))}
            </ul>
          </Clause>
          <Clause n="4.2" title="Partial Refunds">
            <Body style={{ fontSize: 13, lineHeight: 1.9 }}>
              Where a project is partially completed at the time of a valid dispute, the Platform may at its
              sole discretion issue a partial refund proportional to the work completed and approved.
            </Body>
          </Clause>
          <Clause n="4.3" title="Non-Refundable Circumstances">
            <Body style={{ fontSize: 13, lineHeight: 1.9 }}>
              Refunds will not be issued where: (a) the Client has approved the final delivery; (b) the Client
              has changed the original project brief after work commenced without the Designer's agreement;
              (c) the Client is dissatisfied with creative style or personal preference alone, where the work
              meets the technical brief; (d) the refund request is made more than 14 days after delivery.
            </Body>
          </Clause>
          <Clause n="4.4" title="Refund Processing Time">
            <Body style={{ fontSize: 13, lineHeight: 1.9 }}>
              Approved refunds are processed within 5–10 business days to the original payment method. The
              Platform's commission (10%) is non-refundable except in cases of Platform error.
            </Body>
          </Clause>
        </Section>

        {/* 5. Disputes */}
        <Section title="5. Dispute Resolution">
          <Clause n="5.1" title="Raising a Dispute">
            <Body style={{ fontSize: 13, lineHeight: 1.9 }}>
              Either party may raise a formal dispute within 14 days of project delivery via the Platform's
              messaging interface or by emailing disputes@accracreativeshub.com. Disputes must include:
              the project ID, a written description of the issue, and supporting evidence (screenshots,
              files, written communication).
            </Body>
          </Clause>
          <Clause n="5.2" title="Platform Mediation">
            <Body style={{ fontSize: 13, lineHeight: 1.9 }}>
              Upon receiving a dispute, the Platform will: (a) notify both parties within 24 hours;
              (b) review all submitted evidence within 5 business days; (c) issue a binding decision
              within 10 business days. The Platform's decision regarding payment release or refund is final
              and binding on both parties, subject to any rights available under Ghanaian law.
            </Body>
          </Clause>
          <Clause n="5.3" title="Governing Law & Arbitration">
            <Body style={{ fontSize: 13, lineHeight: 1.9 }}>
              These Terms are governed by the laws of the Republic of Ghana. Any disputes not resolved
              through Platform mediation shall be referred to arbitration under the Alternative Dispute
              Resolution Act, 2010 (Act 798) of Ghana. The seat of arbitration shall be Accra, Ghana.
              Nothing herein prevents either party from seeking urgent injunctive relief from the High
              Court of Ghana.
            </Body>
          </Clause>
          <Clause n="5.4" title="Dispute Window">
            <Body style={{ fontSize: 13, lineHeight: 1.9 }}>
              Disputes must be raised within 48 hours of delivery notification through the Platform's
              messaging interface. Our team will review the project brief, submission, and communication
              logs. Decisions by our dispute resolution team are final within the Platform, subject to
              the arbitration rights in clause 5.3. For unresolved disputes, the parties agree to submit
              to the jurisdiction of the courts of Ghana.
            </Body>
          </Clause>
        </Section>

        {/* 6. User Conduct */}
        <Section title="6. User Conduct">
          <Clause n="6.1" title="Prohibited Activities">
            <Body style={{ fontSize: 13, lineHeight: 1.9, marginBottom: 8 }}>
              Users must not engage in any of the following activities:
            </Body>
            <ul style={{ paddingLeft: 20 }}>
              {[
                'Circumventing the Platform to transact directly with Designers or Clients met through the Platform (circumvention fee: GH₵500 or 20% of the transaction value, whichever is greater).',
                'Submitting false, misleading, or fraudulent information including fake reviews.',
                'Harassing, threatening, or discriminating against any other user.',
                'Using the Platform for money laundering, fraud, or any activity in violation of Ghanaian law including the Anti-Money Laundering Act, 2008 (Act 749).',
                'Uploading content that infringes third-party intellectual property rights.',
                'Attempting to access accounts, systems, or data not belonging to you.',
                'Using automated bots, scrapers, or scripts to access the Platform.',
              ].map((item, i) => (
                <li key={i} style={{ marginBottom: 8 }}>
                  <Body style={{ fontSize: 13, lineHeight: 1.8, margin: 0 }}>{item}</Body>
                </li>
              ))}
            </ul>
          </Clause>
          <Clause n="6.2" title="Reviews & Feedback">
            <Body style={{ fontSize: 13, lineHeight: 1.9 }}>
              Reviews must be honest, based on genuine experience, and not contain defamatory content.
              We reserve the right to remove reviews that violate these standards. Incentivising positive
              reviews is prohibited.
            </Body>
          </Clause>
          <Clause n="6.3" title="Consequences of Violations">
            <Body style={{ fontSize: 13, lineHeight: 1.9 }}>
              Violation of these conduct rules may result in: warning, temporary suspension, permanent
              account termination, withholding of funds pending investigation, or referral to law
              enforcement authorities in Ghana.
            </Body>
          </Clause>
        </Section>

        {/* 7. Intellectual Property */}
        <Section title="7. Intellectual Property">
          <Clause n="7.1" title="Ownership of Deliverables">
            <Body style={{ fontSize: 13, lineHeight: 1.9 }}>
              Upon full payment and approval of a Project, the Client receives full commercial rights to
              the final deliverables. The Designer retains the right to display the work in their portfolio
              unless the Client requests confidentiality in writing at the time of brief submission.
            </Body>
          </Clause>
          <Clause n="7.2" title="Platform Content">
            <Body style={{ fontSize: 13, lineHeight: 1.9 }}>
              All Platform branding, design, code, and content (excluding user-submitted work) is owned
              by Accra Creatives Hub and protected under Ghanaian and international intellectual property
              law. Unauthorised reproduction is prohibited.
            </Body>
          </Clause>
          <Clause n="7.3" title="IP Transfer on Completion">
            <Body style={{ fontSize: 13, lineHeight: 1.9 }}>
              Upon full payment and project completion, all intellectual property rights in the
              commissioned work transfer to the client. The designer retains the right to display
              the completed work in their portfolio unless the client requests confidentiality in
              writing.
            </Body>
          </Clause>
        </Section>

        {/* 8. Liability */}
        <Section title="8. Limitation of Liability">
          <Clause n="8.1" title="Platform Role">
            <Body style={{ fontSize: 13, lineHeight: 1.9 }}>
              Accra Creatives Hub is a marketplace facilitator. We are not a party to agreements between
              Clients and Designers and are not liable for the quality, legality, or fitness of design
              services provided.
            </Body>
          </Clause>
          <Clause n="8.2" title="Liability Cap">
            <Body style={{ fontSize: 13, lineHeight: 1.9 }}>
              To the maximum extent permitted by Ghanaian law, the Platform's total liability to any user
              for any claim arising from these Terms or Platform use shall not exceed the total Platform
              commission earned from the transaction in dispute, or GH₵500, whichever is lower.
            </Body>
          </Clause>
          <Clause n="8.3" title="Exclusions">
            <Body style={{ fontSize: 13, lineHeight: 1.9 }}>
              We are not liable for: indirect, incidental, or consequential losses; loss of revenue or
              profits; data loss; service interruptions caused by third-party infrastructure (including
              payment processors or hosting providers); or Force Majeure events including acts of God,
              strikes, or government action.
            </Body>
          </Clause>
          <Clause n="8.4" title="Transaction-Based Liability Limit">
            <Body style={{ fontSize: 13, lineHeight: 1.9 }}>
              To the maximum extent permitted under Ghana law, Accra Creatives Hub shall not be liable
              for any indirect, incidental, or consequential damages arising from use of the Platform.
              Our total liability for any claim shall not exceed the amount paid for the specific
              transaction giving rise to the claim.
            </Body>
          </Clause>
        </Section>

        {/* 9. Privacy */}
        <Section title="9. Privacy & Data Protection">
          <Clause n="9.1" title="Data Processing">
            <Body style={{ fontSize: 13, lineHeight: 1.9 }}>
              We collect and process personal data in accordance with the Data Protection Act, 2012
              (Act 843) of Ghana. By using the Platform, you consent to our collection and use of data
              as described in our Privacy Policy. We do not sell personal data to third parties.
            </Body>
          </Clause>
          <Clause n="9.2" title="Verification Data">
            <Body style={{ fontSize: 13, lineHeight: 1.9 }}>
              Government-issued ID submitted for Designer verification is encrypted, stored securely,
              and used solely for identity verification. It is never shared with Clients or third parties
              except where required by Ghanaian law or court order.
            </Body>
          </Clause>
        </Section>

        {/* 10. Changes & Termination */}
        <Section title="10. Changes to Terms &amp; Termination">
          <Clause n="10.1" title="Amendments">
            <Body style={{ fontSize: 13, lineHeight: 1.9 }}>
              We reserve the right to update these Terms at any time. Users will be notified of material
              changes via email and an in-platform notice at least 14 days before the changes take effect.
              Continued use after the effective date constitutes acceptance.
            </Body>
          </Clause>
          <Clause n="10.2" title="Account Termination">
            <Body style={{ fontSize: 13, lineHeight: 1.9 }}>
              Either party may terminate an account at any time. Upon termination, any funds held
              through the Platform's payment workflow will be handled in accordance with the dispute
              resolution process in Section 5. The Platform
              may terminate accounts immediately for serious violations of these Terms without prior notice.
            </Body>
          </Clause>
        </Section>

        {/* 11. Platform Role */}
        <Section title="11. Platform Role">
          <Clause n="11.1" title="Marketplace Only">
            <Body style={{ fontSize: 13, lineHeight: 1.9 }}>
              Accra Creatives Hub is a marketplace platform only. We do not provide design services.
              All designers on this platform are independent contractors. Accra Creatives Hub is not
              responsible for the quality, delivery, or outcome of any design work.
            </Body>
          </Clause>
        </Section>

        {/* 12. Acceptable Use Policy */}
        <Section title="12. Acceptable Use Policy">
          <Clause n="12.1" title="Prohibited Uses">
            <Body style={{ fontSize: 13, lineHeight: 1.9, marginBottom: 8 }}>
              Users may not use this platform to:
            </Body>
            <ul style={{ paddingLeft: 20 }}>
              {[
                'Submit false or misleading information.',
                'Infringe on intellectual property rights.',
                'Engage in fraudulent transactions.',
                'Harass or abuse other users.',
                'Violate any applicable Ghanaian law.',
              ].map((item, i) => (
                <li key={i} style={{ marginBottom: 8 }}>
                  <Body style={{ fontSize: 13, lineHeight: 1.8, margin: 0 }}>{item}</Body>
                </li>
              ))}
            </ul>
          </Clause>
        </Section>

        {/* 13. Governing Law */}
        <Section title="13. Governing Law">
          <Clause n="13.1" title="Jurisdiction">
            <Body style={{ fontSize: 13, lineHeight: 1.9 }}>
              These Terms are governed by the laws of the Republic of Ghana. Any disputes shall be
              resolved under Ghanaian jurisdiction.
            </Body>
          </Clause>
        </Section>

        {/* Contact */}
        <div
          style={{
            background: S.surface,
            border: `1px solid ${S.border}`,
            padding: isMobile ? '24px 20px' : '32px 36px',
            marginTop: 40,
          }}
        >
          <Lbl style={{ marginBottom: 12, color: S.gold }}>Contact &amp; Legal Notices</Lbl>
          <Hl style={{ fontSize: 18, fontWeight: 400, marginBottom: 12 }}>Questions about these Terms?</Hl>
          <Body style={{ fontSize: 13, lineHeight: 1.9 }}>
            For legal enquiries, contact us at:
            <br /><strong style={{ color: S.text }}>legal@accracreativeshub.com</strong>
            <br />For disputes: <strong style={{ color: S.text }}>disputes@accracreativeshub.com</strong>
            <br />For support: <strong style={{ color: S.text }}>support@accracreativeshub.com</strong>
            <br /><br />
            <em style={{ color: S.textFaint, fontSize: 12 }}>
              These Terms have been drafted for use under the laws of the Republic of Ghana and should be
              reviewed by a qualified Ghanaian legal practitioner before enforcement.
            </em>
          </Body>
        </div>

        {/* Back button */}
        <div style={{ marginTop: 32, textAlign: 'center' }}>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: `1px solid ${S.borderFaint}`,
              color: S.textMuted,
              fontFamily: S.headline,
              fontSize: 10,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              padding: '10px 24px',
              cursor: 'pointer',
              borderRadius: 8,
            }}
          >
            ← Back
          </button>
        </div>
      </div>
    </div>
  )
}