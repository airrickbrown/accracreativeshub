// ── src/lib/orderStatus.ts ──
// Single source of truth for the order lifecycle.
// Every status transition must go through these constants.
//
// Flow:
//   pending → in_progress (designer accepts)
//   in_progress → delivered (designer marks done)
//   delivered → completed (client approves, funds release queued)
//   delivered → revision  (client requests revision)
//   revision  → in_progress (designer re-opens work)
//   in_progress → disputed (client raises dispute)
//   pending → declined (designer declines brief)

export const ORDER_STATUS = {
  PENDING:     'pending',      // Brief submitted — awaiting designer acceptance
  IN_PROGRESS: 'in_progress',  // Designer accepted, work underway
  DELIVERED:   'delivered',    // Designer marked complete, awaiting client approval
  REVISION:    'revision',     // Client requested changes
  COMPLETED:   'completed',    // Client approved — payout queued
  DISPUTED:    'disputed',     // Active dispute — funds frozen
  DECLINED:    'declined',     // Designer declined the brief
} as const

export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS]

export const STATUS_LABELS: Record<OrderStatus, string> = {
  pending:     'Awaiting Acceptance',
  in_progress: 'In Progress',
  delivered:   'Delivered — Awaiting Approval',
  revision:    'Revision Requested',
  completed:   'Completed',
  disputed:    'Disputed',
  declined:    'Declined',
}

export const STATUS_COLORS: Record<OrderStatus, string> = {
  pending:     '#fbbf24',
  in_progress: '#c9a84c',
  delivered:   '#4ade80',
  revision:    '#fb923c',
  completed:   '#4a9a4a',
  disputed:    '#e05555',
  declined:    '#666',
}

// Statuses where the order is still active (not terminated)
export const ACTIVE_STATUSES: OrderStatus[] = [
  ORDER_STATUS.PENDING,
  ORDER_STATUS.IN_PROGRESS,
  ORDER_STATUS.DELIVERED,
  ORDER_STATUS.REVISION,
]

// Can the client send messages in this status?
export const CLIENT_CAN_MESSAGE: OrderStatus[] = [
  ORDER_STATUS.PENDING,
  ORDER_STATUS.IN_PROGRESS,
  ORDER_STATUS.DELIVERED,
  ORDER_STATUS.REVISION,
  ORDER_STATUS.DISPUTED,
]

// Can the designer send messages in this status?
export const DESIGNER_CAN_MESSAGE: OrderStatus[] = [
  ORDER_STATUS.IN_PROGRESS,
  ORDER_STATUS.DELIVERED,
  ORDER_STATUS.REVISION,
  ORDER_STATUS.DISPUTED,
]
