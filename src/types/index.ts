export type UserRole = 'admin' | 'transporter' | 'client'

export type KycStatus = 'pending' | 'approved' | 'rejected'

export type SubscriptionStatus = 'active' | 'expired' | 'suspended' | 'cancelled'

export type SubscriptionPlan = 'monthly' | 'annual'

export type ShipmentStatus =
  | 'pending'
  | 'offer_received'
  | 'confirmed'
  | 'picked_up'
  | 'in_transit'
  | 'delivered'
  | 'completed'
  | 'disputed'
  | 'cancelled'

export type OfferStatus = 'pending' | 'accepted' | 'rejected' | 'expired' | 'withdrawn'

export type ContainerType =
  | '20ft'
  | '40ft'
  | '40ft_hc'
  | '45ft'
  | 'reefer_20ft'
  | 'reefer_40ft'
  | 'open_top'
  | 'flat_rack'

export type EquipmentType =
  | 'flatbed'
  | 'curtainsider'
  | 'reefer'
  | 'tank'
  | 'lowbed'
  | 'mega_trailer'
  | 'other'

export type TransportType = 'full' | 'empty'

export type CargoType = 'general' | 'dangerous' | 'perishable' | 'oversized'

export type DisputeStatus = 'open' | 'in_review' | 'resolved' | 'closed'

export type DocumentType =
  | 'cmr'
  | 'invoice'
  | 'proof_of_pickup'
  | 'proof_of_delivery'
  | 'kyc_registration'
  | 'kyc_license'
  | 'kyc_insurance'
  | 'other'

export interface Profile {
  id: string
  role: UserRole
  email: string
  full_name: string
  company_name: string
  company_cif: string
  company_country: string
  company_address: string
  phone: string
  contact_person: string
  kyc_status: KycStatus
  kyc_rejection_reason?: string
  avatar_url?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface TransporterProfile {
  id: string
  profile_id: string
  fleet_size: number
  equipment_types: EquipmentType[]
  container_types: ContainerType[]
  operating_countries: string[]
  operating_regions: string[]
  rating_average: number
  rating_count: number
  completed_shipments: number
  avg_delivery_days: number
  stripe_account_id?: string
  wallet_balance: number
  wallet_escrow: number
  iban?: string
}

export interface ClientProfile {
  id: string
  profile_id: string
  rating_average: number
  rating_count: number
  total_shipments: number
  stripe_customer_id?: string
}

export interface Subscription {
  id: string
  user_id: string
  plan: SubscriptionPlan
  status: SubscriptionStatus
  price: number
  currency: string
  stripe_subscription_id?: string
  starts_at: string
  expires_at: string
  created_at: string
}

export interface Shipment {
  id: string
  client_id: string
  transporter_id?: string
  origin_city: string
  origin_country: string
  origin_address?: string
  destination_city: string
  destination_country: string
  destination_address?: string
  container_type: ContainerType
  container_count: number
  cargo_weight: number
  cargo_type: CargoType
  transport_type: TransportType
  pickup_date: string
  delivery_date?: string
  budget?: number
  budget_visible: boolean
  currency: string
  special_instructions?: string
  status: ShipmentStatus
  distance_km?: number
  agreed_price?: number
  platform_commission?: number
  created_at: string
  updated_at: string
  client?: Profile
  transporter?: Profile
  offers?: Offer[]
}

export interface TruckAvailability {
  id: string
  transporter_id: string
  origin_city: string
  origin_country: string
  destination_city?: string
  destination_country?: string
  radius_km: number
  available_from: string
  available_until?: string
  equipment_type: EquipmentType
  container_types: ContainerType[]
  max_weight: number
  price_per_km?: number
  fixed_price?: number
  currency: string
  notes?: string
  is_active: boolean
  expires_at: string
  created_at: string
  transporter?: Profile
}

export interface Offer {
  id: string
  shipment_id: string
  transporter_id: string
  price: number
  currency: string
  price_breakdown?: string
  estimated_days: number
  available_from: string
  message?: string
  valid_until: string
  status: OfferStatus
  created_at: string
  transporter?: Profile
}

export interface Document {
  id: string
  shipment_id?: string
  user_id: string
  type: DocumentType
  file_name: string
  file_url: string
  file_size: number
  mime_type: string
  is_verified: boolean
  created_at: string
}

export interface Rating {
  id: string
  shipment_id: string
  from_user_id: string
  to_user_id: string
  stars: number
  review_text?: string
  punctuality: number
  communication: number
  cargo_care: number
  documentation: number
  reply?: string
  created_at: string
  from_user?: Profile
}

export interface Dispute {
  id: string
  shipment_id: string
  opened_by: string
  reason: string
  description: string
  status: DisputeStatus
  admin_notes?: string
  resolution?: string
  resolved_by?: string
  resolved_at?: string
  created_at: string
  shipment?: Shipment
}

export interface ChatMessage {
  id: string
  shipment_id: string
  sender_id: string
  content: string
  attachment_url?: string
  attachment_name?: string
  is_read: boolean
  created_at: string
  sender?: Profile
}

export interface Notification {
  id: string
  user_id: string
  type: string
  title: string
  message: string
  link?: string
  is_read: boolean
  created_at: string
}

export interface SystemSettings {
  id: string
  key: string
  value: string
  updated_at: string
}

export interface AuditLog {
  id: string
  admin_id: string
  action: string
  entity_type: string
  entity_id: string
  details?: Record<string, unknown>
  ip_address?: string
  created_at: string
  admin?: Profile
}
