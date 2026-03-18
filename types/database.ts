// Auto-generated Supabase types — keep in sync with migrations

export type SubscriptionStatus = 'trialing' | 'active' | 'past_due' | 'canceled' | 'incomplete'
export type AppointmentStatus = 'pending' | 'confirmed' | 'complete' | 'cancelled'
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6 // 0 = Sunday
export type NotificationChannel = 'sms' | 'email' | 'both'
export type VerificationCodeType = 'phone_signup' | 'phone_change' | '2fa' | 'email_change'

export interface Profile {
  id: string // uuid — matches auth.users.id
  first_name: string
  last_name: string
  email: string
  phone: string | null
  company_name: string | null
  slug: string // unique — e.g. "carlos-detail-co"
  tagline: string | null
  bio: string | null
  instagram_handle: string | null
  location: string | null
  avatar_url: string | null
  is_pro: boolean
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  subscription_status: SubscriptionStatus
  trial_ends_at: string | null // ISO timestamp
  two_factor_enabled: boolean
  created_at: string
  updated_at: string
}

export interface Service {
  id: string
  profile_id: string
  name: string
  description: string | null
  price: number
  icon: string // emoji
  color: string // hex
  is_active: boolean
  sort_order: number
  created_at: string
}

export interface WorkPhoto {
  id: string
  profile_id: string
  url: string
  sort_order: number
  created_at: string
}

export interface Client {
  id: string
  profile_id: string // detailer who owns this client record
  first_name: string
  last_name: string
  email: string | null
  phone: string | null
  vehicle_year: string | null
  vehicle_make: string | null
  vehicle_model: string | null
  vehicle_color: string | null
  source: string | null // how they found the detailer
  notes: string | null
  created_at: string
}

export interface Appointment {
  id: string
  profile_id: string // detailer
  client_id: string
  service_id: string
  status: AppointmentStatus
  scheduled_date: string // YYYY-MM-DD
  scheduled_time: string // HH:MM
  notes: string | null
  price: number
  created_at: string
  updated_at: string
  // joined
  client?: Client
  service?: Service
}

export interface AvailabilityBlock {
  id: string
  profile_id: string
  start_date: string // YYYY-MM-DD
  end_date: string   // YYYY-MM-DD
  reason: string | null
  created_at: string
}

export interface BusinessHours {
  id: string
  profile_id: string
  day_of_week: DayOfWeek
  is_open: boolean
  open_time: string  // HH:MM
  close_time: string // HH:MM
}

export interface NotificationSettings {
  profile_id: string
  booking_alerts_enabled: boolean
  booking_alerts_channel: NotificationChannel
  cancellation_alerts_enabled: boolean
  cancellation_alerts_channel: NotificationChannel
  reminder_24hr_enabled: boolean
  weekly_summary_enabled: boolean
  weekly_summary_day: DayOfWeek
  weekly_include_upcoming: boolean
  weekly_include_revenue: boolean
  weekly_include_new_clients: boolean
  weekly_include_cancellations: boolean
}

export interface AvailabilitySettings {
  profile_id: string
  max_appointments_per_day: number | null // null = unlimited
  advance_booking_days: number
  minimum_notice_hours: number
}

export interface VerificationCode {
  id: string
  identifier: string // phone or email
  code: string
  type: VerificationCodeType
  expires_at: string
  used_at: string | null
  created_at: string
}

// ─── Joined / View types ──────────────────────────────────────────────────────

export interface ClientWithStats extends Client {
  total_visits: number
  total_spent: number
  last_visit: string | null
  appointments?: Appointment[]
}

export interface ProfileWithRelations extends Profile {
  services?: Service[]
  work_photos?: WorkPhoto[]
  business_hours?: BusinessHours[]
  availability_settings?: AvailabilitySettings
}
