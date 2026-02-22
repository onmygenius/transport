export type UserRole = 'admin' | 'transporter' | 'client'
export type KycStatus = 'pending' | 'approved' | 'rejected'
export type SubscriptionStatus = 'active' | 'expired' | 'suspended' | 'cancelled'
export type ShipmentStatus = 'pending' | 'offer_received' | 'confirmed' | 'picked_up' | 'in_transit' | 'delivered' | 'completed' | 'disputed' | 'cancelled'
export type OfferStatus = 'pending' | 'accepted' | 'rejected' | 'expired' | 'withdrawn'
export type ContainerType = '20ft' | '30ft' | '40ft' | '45ft' | 'other'
export type CargoType = 'general' | 'dangerous' | 'perishable' | 'oversized'
export type TransportType = 'full' | 'empty'
export type DisputeStatus = 'open' | 'in_review' | 'resolved' | 'closed'

export interface Profile {
  id: string
  role: UserRole
  email: string
  full_name: string | null
  company_name: string | null
  company_cif: string | null
  company_country: string | null
  company_address: string | null
  phone: string | null
  contact_person: string | null
  kyc_status: KycStatus
  kyc_rejection_reason: string | null
  avatar_url: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Shipment {
  id: string
  client_id: string
  transporter_id: string | null
  origin_city: string
  origin_country: string
  origin_address: string | null
  destination_city: string
  destination_country: string
  destination_address: string | null
  container_type: ContainerType
  container_count: number
  cargo_weight: number
  cargo_type: CargoType
  transport_type: TransportType
  pickup_date: string
  delivery_date: string | null
  budget: number | null
  budget_visible: boolean
  currency: string
  special_instructions: string | null
  status: ShipmentStatus
  distance_km: number | null
  agreed_price: number | null
  expires_at: string | null
  created_at: string
  updated_at: string
  client?: Profile
  transporter?: Profile
  offers?: Offer[]
  _count?: { offers: number }
}

export interface Offer {
  id: string
  shipment_id: string
  transporter_id: string
  price: number
  currency: string
  price_breakdown: string | null
  estimated_days: number
  available_from: string
  message: string | null
  valid_until: string
  status: OfferStatus
  created_at: string
  updated_at: string
  transporter?: Profile
  shipment?: Shipment
}

export interface TruckAvailability {
  id: string
  transporter_id: string
  origin_city: string
  origin_country: string
  destination_city: string | null
  destination_country: string | null
  radius_km: number
  available_from: string
  available_until: string | null
  equipment_type: string
  container_types: ContainerType[]
  max_weight: number
  price_per_km: number | null
  fixed_price: number | null
  currency: string
  notes: string | null
  is_active: boolean
  expires_at: string | null
  created_at: string
  updated_at: string
  transporter?: Profile
}

export interface TransporterProfile {
  id: string
  profile_id: string
  fleet_size: number
  equipment_types: string[]
  container_types: ContainerType[]
  operating_countries: string[]
  rating_average: number
  rating_count: number
  completed_shipments: number
  avg_delivery_days: number
  iban: string | null
}

export interface ActionResult<T = null> {
  success: boolean
  data?: T
  error?: string
}
