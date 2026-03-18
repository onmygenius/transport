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
  
  const baseNumber = startingNumbers[type]
  const prefix = `TC-${type}-`
  
  // Get the highest existing display_id for this type
  const { data: records } = await supabase
    .from(tableName)
    .select('display_id')
    .like('display_id', `${prefix}%`)
    .order('display_id', { ascending: false })
    .limit(1)
  
  let nextNumber = baseNumber
  
  if (records && records.length > 0 && records[0].display_id) {
    // Extract number from display_id (e.g., "TC-SHP-02205" -> 2205)
    const lastId = records[0].display_id
    const match = lastId.match(/TC-[A-Z]+-(\d+)/)
    if (match) {
      const lastNumber = parseInt(match[1], 10)
      nextNumber = lastNumber + 1
    }
  }
  
  // Format: TC-[TYPE]-[NUMBER] (padded to 5 digits)
  const displayId = `${prefix}${nextNumber.toString().padStart(5, '0')}`
  
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
