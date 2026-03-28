import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useDesigners() {
  const [designers, setDesigners] = useState<any[]>([])
  const [loading, setLoading]     = useState(true)

  useEffect(() => { fetchDesigners() }, [])

  const fetchDesigners = async () => {
    const { data, error } = await supabase
      .from('designers')
      .select(`
        *,
        profiles (
          id, full_name, location, avatar_url, bio
        )
      `)
      .eq('public_visible', true)
      .order('created_at', { ascending: false })

    if (!error && data) {
      const shaped = data.map(d => ({
        id:           d.id,
        name:         d.profiles?.full_name || 'Unknown',
        location:     d.profiles?.location  || 'Ghana',
        avatar:       d.profiles?.avatar_url,
        category:     d.category,
        tagline:      d.tagline || '',
        price:        d.starting_price || 0,
        responseTime: d.response_time  || 'Same day',
        badge:        d.badge          || 'new',
        verified:     d.verified,
        featured:     d.featured,
        tags:         d.tags           || [],
        rating:       d.rating_average || 0,
        reviews:      d.rating_count   || 0,
        orders:       d.completed_orders_count || 0,
        portrait:     d.profiles?.avatar_url   || 'https://picsum.photos/id/1005/400/500',
        portfolio:    [],
        earnings:     0,
        views:        0,
        referralCode: '',
        referrals:    0,
      }))
      setDesigners(shaped)
    }
    setLoading(false)
  }

  return { designers, loading, refetch: fetchDesigners }
}