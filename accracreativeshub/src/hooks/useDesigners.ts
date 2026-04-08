// ── src/hooks/useDesigners.ts ──
// Fixes: TS2306 (supabase import) + TS7006 (parameter 'd' implicit any)

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

interface Designer {
  id:           any
  name:         string
  tagline:      string
  category:     string
  location:     string
  rating:       number
  reviews:      number
  orders:       number
  price:        number
  responseTime: string
  tags:         string[]
  badge:        string
  featured:     boolean
  verified:     boolean
  portrait:     string
  portfolio:    string[]
  earnings:     number
  views:        number
  referralCode: string
  referrals:    number
  avatar:       string
  color:        string
}

export function useDesigners() {
  const [designers, setDesigners] = useState<Designer[]>([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const { data, error: err } = await supabase
          .from('designers')
          .select(`
            id,
            badge,
            verified,
            public_visible,
            rating_average,
            rating_count,
            price_min,
            category,
            portfolio_urls,
            profiles:id (
              full_name,
              location,
              avatar_url,
              bio
            )
          `)
          .eq('public_visible', true)
          .order('rating_average', { ascending: false })

        if (err) { setError(err.message); return }

        // Fix TS7006: explicitly type d as any
        const shaped = (data || []).map((d: any) => ({
          id:           d.id,
          name:         d.profiles?.full_name  || 'Unknown Designer',
          tagline:      d.profiles?.bio         || '',
          category:     d.category              || '',
          location:     d.profiles?.location    || 'Accra, Ghana',
          rating:       d.rating_average        || 0,
          reviews:      d.rating_count          || 0,
          orders:       0,
          price:        d.price_min             || 0,
          responseTime: '< 4 hours',
          tags:         [],
          badge:        d.badge                 || 'new',
          featured:     false,
          verified:     d.verified              || false,
          portrait:     d.profiles?.avatar_url  || `https://picsum.photos/seed/${d.id}/400/500`,
          portfolio:    d.portfolio_urls        || [],
          earnings:     0,
          views:        0,
          referralCode: '',
          referrals:    0,
          avatar:       (d.profiles?.full_name || 'U').slice(0, 2).toUpperCase(),
          color:        '#1a2a1a',
        }))

        setDesigners(shaped)
      } catch (e: any) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  return { designers, loading, error }
}