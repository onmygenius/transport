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
  
  // Starting numbers for each entity type
  const startingNumbers: Record<EntityType, number> = {
    'SHP': 2200,
    'USR': 1000,
    'TRK': 1000,
    'OFF': 1000,
  }
  
  // Get count of existing records to generate next number
  const { count } = await supabase
    .from(tableName)
    .select('*', { count: 'exact', head: true })
  
  // Generate sequential number starting from configured base (padded to 5 digits)
  const baseNumber = startingNumbers[type]
  const nextNumber = (baseNumber + (count || 0)).toString().padStart(5, '0')
  
  // Format: TC-[TYPE]-[NUMBER]
  const displayId = `TC-${type}-${nextNumber}`
  
  // Check if display_id already exists (collision check)
  const { data: existing } = await supabase
    .from(tableName)
    .select('id')
    .eq('display_id', displayId)
    .single()
  
  // If collision, add random suffix
  if (existing) {
    const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    return `TC-${type}-${nextNumber}${randomSuffix}`
  }
  
  return displayId
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
