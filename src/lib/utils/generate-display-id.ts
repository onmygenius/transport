/**
 * Generate display ID for various entities
 * Format: TC-[TYPE]-[NUMBER]
 * Example: TC-SHP-12345, TC-USR-67890
 */

import { createClient } from '@/lib/supabase/server'

type EntityType = 'SHP' | 'USR' | 'TRK' | 'OFF'

/**
 * Generate a unique display ID for an entity
 * @param type - Entity type (SHP, USR, TRK, OFF)
 * @param tableName - Database table name
 * @returns Promise<string> - Generated display ID (e.g., TC-SHP-12345)
 */
export async function generateDisplayId(
  type: EntityType,
  tableName: 'shipments' | 'profiles' | 'trucks' | 'offers'
): Promise<string> {
  const supabase = await createClient()
  const prefix = `TC-${type}-`
  
  // Generate random 6-digit number for uniqueness
  const maxRetries = 10
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    // Generate random number between 100000 and 999999
    const randomNumber = Math.floor(100000 + Math.random() * 900000)
    const displayId = `${prefix}${randomNumber}`
    
    // Check if this ID already exists
    const { data: existing } = await supabase
      .from(tableName)
      .select('id')
      .eq('display_id', displayId)
      .maybeSingle()
    
    // If doesn't exist, we found a unique ID
    if (!existing) {
      return displayId
    }
    
    // If exists, retry with new random number
  }
  
  // Fallback: use timestamp + random if all retries failed (extremely unlikely)
  const timestamp = Date.now().toString().slice(-6)
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return `${prefix}${timestamp}${random}`
}

/**
 * Client-side version for generating display IDs
 * Uses timestamp + random for uniqueness
 */
export function generateDisplayIdClient(type: EntityType): string {
  const timestamp = Date.now().toString().slice(-5)
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return `TC-${type}-${timestamp}${random}`
}
