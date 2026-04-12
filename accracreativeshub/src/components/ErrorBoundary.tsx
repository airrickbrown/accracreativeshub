// ── src/components/ErrorBoundary.tsx ──
// Catches runtime JavaScript errors so users see a helpful message
// instead of a black screen. Also logs errors for debugging.

import React from 'react'
import { NotFoundPage } from './LoadingSpinner'


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
      <NotFoundPage
        onHome={() => {
          window.history.replaceState({}, '', '/')
          window.location.reload()
        }}
      />
    )
  }
}