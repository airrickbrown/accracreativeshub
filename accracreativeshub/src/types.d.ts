// ── Global type declarations ──
// Domain types for Accra Creatives Hub

// ── Domain types ─────────────────────────────────────────────────────────────

export interface Profile {
  id:                          string
  role:                        'admin' | 'designer' | 'client'
  full_name:                   string | null
  email:                       string | null
  phone:                       string | null
  location:                    string | null
  avatar_url:                  string | null
  bio:                         string | null
  tagline:                     string | null
  designer_agreement_accepted: boolean
  created_at:                  string
}

export interface Designer {
  // Primary key — same as profiles.id
  id:             string
  badge:          'verified' | 'new' | 'top_rated' | 'under_review'
  verified:       boolean
  featured:       boolean
  public_visible: boolean
  rating_average: number
  rating_count:   number
  price_min:      number
  response_time:  string | null
  category:       string | null
  portfolio_urls: string[]
  id_uploaded:    boolean
  id_url:         string | null   // storage PATH in id-uploads bucket (not a public URL)
  created_at:     string
}

export type OrderStatus =
  | 'pending'
  | 'in_progress'
  | 'delivered'
  | 'revision'
  | 'completed'
  | 'disputed'
  | 'declined'
  | 'refunded'

export type PayoutStatus =
  | 'held'
  | 'pending_transfer'
  | 'transferred'
  | 'refunded'

export interface Order {
  id:              string
  client_id:       string
  designer_id:     string
  project_name:    string
  brief:           string | null
  amount:          number
  status:          OrderStatus
  payout_status:   PayoutStatus
  rush:            boolean
  revisions_used:  number
  revisions_total: number
  delivered_at:    string | null
  approved_at:     string | null
  created_at:      string
}

export interface Review {
  id:          string
  order_id:    string
  designer_id: string
  client_id:   string
  rating:      number           // 1–5
  comment:     string | null
  created_at:  string
}

export interface Dispute {
  id:                    string
  order_id:              string
  client_id:             string
  designer_id:           string
  reason:                string
  status:                'open' | 'resolved_release' | 'resolved_refund'
  evidence_requested:    boolean
  evidence_requested_at: string | null
  resolved_at:           string | null
  created_at:            string
}

export interface Message {
  id:         string
  order_id:   string
  sender_id:  string
  body:       string
  created_at: string
}
