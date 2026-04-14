import React, { useEffect, useState } from 'react'
import { S } from '../styles/tokens'
import { Hl, Body, Lbl, GoldLine, Divider } from './UI'
import Nav from './Nav'

const Section = ({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) => (
  <div style={{ marginBottom: 40 }}>
    <Hl style={{ fontSize: 18, fontWeight: 500, marginBottom: 12, color: S.text }}>
      {title}
    </Hl>
    <div style={{ borderLeft: `2px solid rgba(201,168,76,0.2)`, paddingLeft: 20 }}>
      {children}
    </div>
  </div>
)

const Clause = ({
  n,
  title,
  children,
}: {
  n: string
  title: string
  children: React.ReactNode
}) => (
  <div style={{ marginBottom: 18 }}>
    <div style={{ display: 'flex', gap: 10, marginBottom: 6, alignItems: 'baseline' }}>
      <span
        style={{
          color: S.gold,
          fontFamily: S.headline,
          fontSize: 11,
          flexShrink: 0,
        }}
      >
        {n}
      </span>
      <Body style={{ fontSize: 13, fontWeight: 600, color: S.text, margin: 0 }}>
        {title}
      </Body>
    </div>
    <div style={{ paddingLeft: 22 }}>{children}</div>
  </div>
)

interface Props { onClose?: () => void }

export default function PrivacyPage({ onClose }: Props = {}) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const effective = 'January 1, 2025'
  const lastUpdated = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const goHome = () => {
    if (onClose) { onClose(); return }
    window.location.href = '/'
  }

  return (
    <div
      style={{
        position: onClose ? 'fixed' : undefined,
        inset: onClose ? 0 : undefined,
        zIndex: onClose ? 210 : undefined,
        minHeight: '100vh',
        background: S.bgDeep,
        color: S.text,
        overflowX: 'hidden',
        overflowY: onClose ? 'auto' : undefined,
      }}
    >
      <Nav
        scrolled={true}
        user={null}
        onAdmin={goHome}
        onSignup={goHome}
        onMessages={goHome}
        onMarketplace={goHome}
        onHowItWorks={goHome}
        onForDesigners={goHome}
        onLogin={goHome}
        onSignOut={() => {}}
      />

      <main
        style={{
          maxWidth: 820,
          margin: '0 auto',
          padding: isMobile ? '96px 20px 60px' : '110px 40px 80px',
        }}
      >
        <div style={{ marginBottom: 48 }}>
          <Lbl style={{ marginBottom: 12, color: S.gold }}>Legal</Lbl>
          <Hl
            style={{
              fontSize: isMobile ? 32 : 48,
              fontWeight: 300,
              marginBottom: 12,
              lineHeight: 1.1,
            }}
          >
            Privacy Policy
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
            This Privacy Policy explains how Accra Creatives Hub (&quot;we&quot;,
            &quot;us&quot;, &quot;our&quot;) collects, uses, stores, and protects your
            personal information when you access or use our website, products, and
            services at accracreativeshub.com (the &quot;Platform&quot;). By using the
            Platform, you agree to the practices described in this Privacy Policy.
          </Body>
        </div>

        <Divider />

        <Section title="1. Information We Collect">
          <Clause n="1.1" title="Information you provide directly">
            <Body style={{ fontSize: 13, lineHeight: 1.9 }}>
              We may collect personal information that you provide when you create an
              account, submit a brief, apply as a designer, contact support, or
              communicate through the Platform. This may include your full name, email
              address, phone number, payment details, business details, project
              information, and any files or messages you upload.
            </Body>
          </Clause>
          <Clause n="1.2" title="Verification information">
            <Body style={{ fontSize: 13, lineHeight: 1.9 }}>
              Designers may be required to submit identity verification materials such as
              a Ghana Card, passport, mobile money details, business registration
              information, and portfolio samples. This information is used only for
              onboarding, verification, fraud prevention, and platform trust.
            </Body>
          </Clause>
          <Clause n="1.3" title="Automatically collected information">
            <Body style={{ fontSize: 13, lineHeight: 1.9 }}>
              We may automatically collect technical data such as your IP address, browser
              type, device type, referring pages, usage behavior, approximate location,
              session activity, and error logs to help us improve platform performance and
              security.
            </Body>
          </Clause>
          <Clause n="1.4" title="Summary of Data Collected">
            <Body style={{ fontSize: 13, lineHeight: 1.9 }}>
              We collect: your name, email address, payment information (processed and held by
              Paystack), project briefs, and communications on the Platform.
            </Body>
          </Clause>
        </Section>

        <Section title="2. How We Use Your Information">
          <Clause n="2.1" title="To provide the Platform">
            <Body style={{ fontSize: 13, lineHeight: 1.9 }}>
              We use your information to create and manage accounts, process
              transactions, manage payment flows, enable messaging between Clients and
              Designers, facilitate project delivery, and provide customer support.
            </Body>
          </Clause>
          <Clause n="2.2" title="To verify trust and safety">
            <Body style={{ fontSize: 13, lineHeight: 1.9 }}>
              We use submitted data to verify designer identities, detect fraud, monitor
              suspicious activity, enforce our Terms &amp; Conditions, and protect users
              from abuse, impersonation, or unlawful conduct.
            </Body>
          </Clause>
          <Clause n="2.3" title="To improve the Platform">
            <Body style={{ fontSize: 13, lineHeight: 1.9 }}>
              We may use analytics and behavioral information to improve the
              Platform&apos;s features, usability, conversion flow, communication tools,
              payment experience, and marketplace quality.
            </Body>
          </Clause>
          <Clause n="2.4" title="To communicate with you">
            <Body style={{ fontSize: 13, lineHeight: 1.9 }}>
              We may send you service emails, account notifications, verification
              requests, dispute updates, marketing communications, and product
              announcements. You may opt out of non-essential marketing emails at any
              time.
            </Body>
          </Clause>
        </Section>

        <Section title="3. Legal Basis and Consent">
          <Clause n="3.1" title="Consent and legitimate interests">
            <Body style={{ fontSize: 13, lineHeight: 1.9 }}>
              By using the Platform, you consent to the collection and use of your data as
              outlined in this Policy. We may also process data where necessary to perform
              a contract, comply with legal obligations, protect legitimate business
              interests, or safeguard users and the Platform.
            </Body>
          </Clause>
          <Clause n="3.2" title="Ghana data protection law">
            <Body style={{ fontSize: 13, lineHeight: 1.9 }}>
              We seek to handle personal data in accordance with the Data Protection Act,
              2012 (Act 843) of Ghana, together with any applicable regulations and
              guidelines.
            </Body>
          </Clause>
          <Clause n="3.3" title="Data Protection Commission">
            <Body style={{ fontSize: 13, lineHeight: 1.9 }}>
              Accra Creatives Hub complies with the Data Protection Act, 2012 (Act 843) of
              Ghana. We are registered with the Data Protection Commission of Ghana. We collect
              only the data necessary to operate the Platform and do not sell user data to
              third parties.
            </Body>
          </Clause>
        </Section>

        <Section title="4. Sharing of Information">
          <Clause n="4.1" title="With other users">
            <Body style={{ fontSize: 13, lineHeight: 1.9 }}>
              Certain profile information may be visible to other users, such as a
              designer&apos;s name, portfolio, category, public bio, ratings, and
              reviews. Private verification documents and payment details are not
              displayed publicly.
            </Body>
          </Clause>
          <Clause n="4.2" title="With service providers">
            <Body style={{ fontSize: 13, lineHeight: 1.9 }}>
              We may share information with trusted third-party providers who help us
              operate the Platform, including payment processors such as Paystack, hosting
              providers, analytics providers, email delivery tools, and authentication
              providers. These parties may only use your data for services connected to
              the Platform.
            </Body>
          </Clause>
          <Clause n="4.3" title="For legal reasons">
            <Body style={{ fontSize: 13, lineHeight: 1.9 }}>
              We may disclose information where required by law, court order, regulatory
              authority, law enforcement, or where necessary to protect our legal rights,
              investigate fraud, or enforce our Terms.
            </Body>
          </Clause>
          <Clause n="4.4" title="No sale of personal information">
            <Body style={{ fontSize: 13, lineHeight: 1.9 }}>
              We do not sell personal data to third parties.
            </Body>
          </Clause>
        </Section>

        <Section title="5. Payments and Financial Data">
          <Clause n="5.1" title="Payment processing">
            <Body style={{ fontSize: 13, lineHeight: 1.9 }}>
              All payments are processed through third-party providers such as Paystack.
              We do not store your full card details on our servers. Payment providers may
              collect and process financial data according to their own privacy policies
              and compliance obligations.
            </Body>
          </Clause>
          <Clause n="5.2" title="Payout details">
            <Body style={{ fontSize: 13, lineHeight: 1.9 }}>
              Designers may provide mobile money numbers, bank details, and payout
              instructions so that funds can be disbursed after successful project
              completion. This information is treated as confidential and used only for
              payout processing and compliance.
            </Body>
          </Clause>
        </Section>

        <Section title="6. Cookies and Tracking">
          <Clause n="6.1" title="Cookies">
            <Body style={{ fontSize: 13, lineHeight: 1.9 }}>
              We may use cookies, local storage, and similar tracking technologies to keep
              users signed in, remember preferences, improve performance, measure traffic,
              and understand how users interact with the Platform.
            </Body>
          </Clause>
          <Clause n="6.2" title="Browser controls">
            <Body style={{ fontSize: 13, lineHeight: 1.9 }}>
              You may disable cookies through your browser settings. However, some parts
              of the Platform may not function properly if essential cookies are blocked.
            </Body>
          </Clause>
        </Section>

        <Section title="7. Data Retention">
          <Clause n="7.1" title="How long we keep data">
            <Body style={{ fontSize: 13, lineHeight: 1.9 }}>
              We retain personal data only for as long as reasonably necessary to provide
              services, maintain account records, resolve disputes, comply with legal
              obligations, process refunds, enforce our rights, and protect the Platform
              against abuse.
            </Body>
          </Clause>
          <Clause n="7.2" title="Account closure">
            <Body style={{ fontSize: 13, lineHeight: 1.9 }}>
              If you close your account, we may retain limited records where necessary for
              tax, accounting, anti-fraud, dispute resolution, audit, or legal compliance
              purposes.
            </Body>
          </Clause>
        </Section>

        <Section title="8. Data Security">
          <Clause n="8.1" title="Security measures">
            <Body style={{ fontSize: 13, lineHeight: 1.9 }}>
              We use reasonable administrative, technical, and organizational safeguards
              to protect your data against unauthorised access, misuse, alteration,
              disclosure, or destruction. These may include encrypted connections, secure
              authentication flows, access control, and monitored infrastructure.
            </Body>
          </Clause>
          <Clause n="8.2" title="No absolute guarantee">
            <Body style={{ fontSize: 13, lineHeight: 1.9 }}>
              While we take security seriously, no internet-based platform can guarantee
              absolute security. You are responsible for protecting your login credentials
              and notifying us if you suspect a breach.
            </Body>
          </Clause>
        </Section>

        <Section title="9. Your Rights">
          <Clause n="9.1" title="Access and correction">
            <Body style={{ fontSize: 13, lineHeight: 1.9 }}>
              You may request access to the personal data we hold about you and may ask us
              to correct inaccurate, outdated, or incomplete information.
            </Body>
          </Clause>
          <Clause n="9.2" title="Deletion and objection">
            <Body style={{ fontSize: 13, lineHeight: 1.9 }}>
              Subject to legal and operational limitations, you may request deletion of
              your data or object to certain processing activities. Some information may
              still need to be retained for legal compliance, dispute handling, fraud
              prevention, or financial recordkeeping.
            </Body>
          </Clause>
          <Clause n="9.3" title="Marketing preferences">
            <Body style={{ fontSize: 13, lineHeight: 1.9 }}>
              You may opt out of promotional communications by using the unsubscribe link
              in our emails or by contacting us directly.
            </Body>
          </Clause>
          <Clause n="9.4" title="Rights under Act 843">
            <Body style={{ fontSize: 13, lineHeight: 1.9 }}>
              Under the Data Protection Act, 2012 (Act 843), you have the right to access,
              correct, or request deletion of your personal data. To exercise these rights,
              contact us at{' '}
              <strong style={{ color: S.text }}>hello@accracreativeshub.com</strong>.
            </Body>
          </Clause>
        </Section>

        <Section title="10. Children&apos;s Privacy">
          <Clause n="10.1" title="Age restriction">
            <Body style={{ fontSize: 13, lineHeight: 1.9 }}>
              The Platform is not intended for persons under the age of 18. We do not
              knowingly collect personal data from children. If we become aware that such
              data has been submitted, we may delete it and suspend the associated
              account.
            </Body>
          </Clause>
        </Section>

        <Section title="11. International Transfers">
          <Clause n="11.1" title="Cross-border services">
            <Body style={{ fontSize: 13, lineHeight: 1.9 }}>
              Some of our service providers may store or process data outside Ghana. Where
              this occurs, we aim to ensure that appropriate safeguards are in place and
              that such transfers are reasonably necessary for the operation of the
              Platform.
            </Body>
          </Clause>
        </Section>

        <Section title="12. Changes to this Privacy Policy">
          <Clause n="12.1" title="Updates">
            <Body style={{ fontSize: 13, lineHeight: 1.9 }}>
              We may update this Privacy Policy from time to time to reflect legal,
              operational, or product changes. Material updates may be communicated by
              email, account notice, or an in-platform banner. Continued use of the
              Platform after changes take effect means you accept the revised Policy.
            </Body>
          </Clause>
        </Section>

        <div
          style={{
            background: S.surface,
            border: `1px solid ${S.border}`,
            padding: isMobile ? '24px 20px' : '32px 36px',
            marginTop: 40,
          }}
        >
          <Lbl style={{ marginBottom: 12, color: S.gold }}>Privacy Contact</Lbl>
          <Hl style={{ fontSize: 18, fontWeight: 400, marginBottom: 12 }}>
            Questions about privacy?
          </Hl>
          <Body style={{ fontSize: 13, lineHeight: 1.9 }}>
            For privacy-related enquiries, contact us at:
            <br />
            <strong style={{ color: S.text }}>privacy@accracreativeshub.com</strong>
            <br />
            For support: <strong style={{ color: S.text }}>support@accracreativeshub.com</strong>
            <br />
            For legal matters: <strong style={{ color: S.text }}>legal@accracreativeshub.com</strong>
            <br />
            <br />
            <em style={{ color: S.textFaint, fontSize: 12 }}>
              This Privacy Policy should be reviewed by a qualified Ghanaian legal
              practitioner before formal enforcement or regulatory submission.
            </em>
          </Body>
        </div>

        <div style={{ marginTop: 32, textAlign: 'center' }}>
          <button
            onClick={goHome}
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
            ← Back Home
          </button>
        </div>
      </main>
    </div>
  )
}