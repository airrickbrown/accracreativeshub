// ── src/components/ErrorBoundary.tsx ──
// Catches runtime JavaScript errors so users see a helpful message
// instead of a black screen. Also logs errors for debugging.

import React from 'react'

interface Props   { children: React.ReactNode }
interface State   { hasError: boolean; message: string }

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, message: '' }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error?.message || 'Unknown error' }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Log for debugging — never show raw error to user
    console.error('[ErrorBoundary]', error, info)
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div style={{
        position: 'fixed', inset: 0, background: '#080808',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: 24, fontFamily: 'Georgia, serif',
      }}>
        <div style={{ color: '#c9a84c', fontSize: 32, marginBottom: 20 }}>◈</div>
        <h1 style={{ color: '#f5f5f5', fontWeight: 400, fontSize: 22, marginBottom: 12, textAlign: 'center' }}>
          Something went wrong.
        </h1>
        <p style={{ color: '#888', fontSize: 14, marginBottom: 28, textAlign: 'center', maxWidth: 380, lineHeight: 1.7 }}>
          We're sorry for the inconvenience. Please refresh the page or contact us at{' '}
          <a href="mailto:hello@accracreativeshub.com" style={{ color: '#c9a84c' }}>
            hello@accracreativeshub.com
          </a>
        </p>
        <button
          onClick={() => window.location.reload()}
          style={{
            background: '#c9a84c', color: '#131313', border: 'none',
            padding: '13px 32px', borderRadius: 8, cursor: 'pointer',
            fontFamily: 'Arial', fontSize: 11, fontWeight: 700,
            letterSpacing: '0.18em', textTransform: 'uppercase',
          }}
        >
          Refresh Page →
        </button>
      </div>
    )
  }
}