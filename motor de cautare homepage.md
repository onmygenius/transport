# Motor de Căutare Homepage - Documentație Implementare

## 📋 Prezentare Generală

Acest document conține toate informațiile necesare pentru implementarea completă a motorului de căutare de pe homepage cu integrare în baza de date Supabase.

**Status actual:** ✅ UI implementat cu mock data (hardcoded)  
**Status țintă:** 🎯 Integrare completă cu baza de date reală

---

## 🎨 UI Implementat (Componente Existente)

### Fișiere create:
- **`src/components/home/freight-search.tsx`** - Componenta principală search widget
- **`src/app/page.tsx`** - Homepage cu search widget integrat

### Features UI:
- ✅ Toggle Client/Transporter mode
- ✅ 5 filtre: Origin, Destination, Date, Container Type, Shipping Type
- ✅ Mock results (5 rezultate hardcoded europene)
- ✅ Freemium UI (blur/lock pentru pricing și contact)
- ✅ CTA subscription card
- ✅ Responsive design (mobil, tablet, desktop)
- ✅ Sort options (Relevance, Price, Rating, Date)

---

## 🗄️ Schema Baza de Date (Supabase)

### ✅ Tabele Existente (GATA pentru search):

#### 1. **`shipments`** - Cereri transport de la clienți
```sql
Coloane relevante pentru search:
- origin_city TEXT NOT NULL
- origin_country TEXT NOT NULL
- origin_address TEXT
- destination_city TEXT NOT NULL
- destination_country TEXT NOT NULL
- destination_address TEXT
- container_type container_type NOT NULL (enum)
- transport_type transport_type NOT NULL (fcl/lcl)
- cargo_type cargo_type NOT NULL (general/dangerous/perishable/oversized)
- pickup_date DATE NOT NULL
- delivery_date DATE
- budget DECIMAL(10,2)
- budget_visible BOOLEAN DEFAULT true
- status shipment_status NOT NULL (pending/offer_received/confirmed/etc)
- special_instructions TEXT (poate conține stops în JSON)
- client_id UUID (FK către profiles)
```

#### 2. **`transporter_profiles`** - Profile transportatori
```sql
Coloane relevante pentru search:
- profile_id UUID (FK către profiles)
- fleet_size INTEGER
- equipment_types equipment_type[] (array)
- container_types container_type[] (array)
- operating_countries TEXT[] (array)
- operating_regions TEXT[] (array)
- rating_average DECIMAL(3,2)
- rating_count INTEGER
- completed_shipments INTEGER
```

#### 3. **`truck_availability`** - Disponibilitate camioane
```sql
Coloane relevante pentru search:
- transporter_id UUID (FK către profiles)
- origin_city TEXT NOT NULL
- origin_country TEXT NOT NULL
- destination_city TEXT
- destination_country TEXT
- available_from DATE NOT NULL
- available_until DATE
- equipment_type equipment_type NOT NULL
- container_types container_type[] (array)
- max_weight DECIMAL(10,2)
- fixed_price DECIMAL(10,2)
- is_active BOOLEAN DEFAULT true
```

#### 4. **`profiles`** - Info companii (client + transporter)
```sql
Coloane relevante pentru search:
- id UUID PRIMARY KEY
- role user_role (admin/transporter/client)
- company_name TEXT
- company_country TEXT
- kyc_status kyc_status (pending/approved/rejected)
- is_active BOOLEAN
```

#### 5. **`subscriptions`** - Verificare premium access
```sql
Coloane relevante pentru search:
- user_id UUID (FK către profiles)
- status subscription_status (active/expired/suspended/cancelled)
- expires_at TIMESTAMPTZ
```

#### 6. **`ratings`** - Reviews pentru transportatori/clienți
```sql
Coloane relevante pentru search:
- to_user_id UUID (FK către profiles)
- stars INTEGER (1-5)
- review_text TEXT
- created_at TIMESTAMPTZ
```

---

## 🔍 Indexes Necesare (Optimizare Performance)

### ⚠️ Indexes care TREBUIE adăugate:

```sql
-- Pentru search rapid pe orașe
CREATE INDEX idx_shipments_origin_city ON shipments(origin_city);
CREATE INDEX idx_shipments_destination_city ON shipments(destination_city);
CREATE INDEX idx_shipments_container_type ON shipments(container_type);
CREATE INDEX idx_shipments_transport_type ON shipments(transport_type);

-- Pentru truck availability
CREATE INDEX idx_truck_availability_origin_city ON truck_availability(origin_city);
CREATE INDEX idx_truck_availability_destination_city ON truck_availability(destination_city);
CREATE INDEX idx_truck_availability_available_from ON truck_availability(available_from);

-- Pentru full-text search (opțional, pentru fuzzy matching)
CREATE INDEX idx_shipments_origin_city_trgm ON shipments USING gin(origin_city gin_trgm_ops);
CREATE INDEX idx_shipments_destination_city_trgm ON shipments USING gin(destination_city gin_trgm_ops);
```

### ✅ Indexes care EXISTĂ deja:
- `idx_shipments_origin_country`
- `idx_shipments_destination_country`
- `idx_shipments_pickup_date`
- `idx_shipments_status`
- `idx_truck_availability_is_active`

---

## 🔧 Implementare Backend (Server Actions)

### Fișier nou: **`src/lib/actions/search.ts`**

```typescript
'use server'

import { createClient } from '@/lib/supabase/server'

export interface SearchFilters {
  searchType: 'client' | 'transporter'
  origin?: string
  destination?: string
  date?: string
  containerType?: string
  shippingType?: string
}

export interface SearchResult {
  id: string
  type: 'transporter' | 'shipment'
  company: string
  rating: number
  reviews: number
  route: string
  available?: string
  pickup?: string
  delivery?: string
  containerType: string
  cargoType?: string
  price: number
  verified: boolean
  fleet?: string
  country: string
  terminal?: string
}

/**
 * Search pentru CLIENȚI - caută transportatori disponibili
 */
export async function searchTransporters(filters: SearchFilters): Promise<SearchResult[]> {
  const supabase = await createClient()
  
  let query = supabase
    .from('truck_availability')
    .select(`
      id,
      origin_city,
      origin_country,
      destination_city,
      destination_country,
      available_from,
      available_until,
      container_types,
      fixed_price,
      transporter:profiles!truck_availability_transporter_id_fkey(
        id,
        company_name,
        company_country,
        kyc_status,
        transporter_profile:transporter_profiles!transporter_profiles_profile_id_fkey(
          fleet_size,
          rating_average,
          rating_count,
          completed_shipments
        )
      )
    `)
    .eq('is_active', true)
  
  // Filtrare pe origin
  if (filters.origin) {
    query = query.ilike('origin_city', `%${filters.origin}%`)
  }
  
  // Filtrare pe destination
  if (filters.destination) {
    query = query.ilike('destination_city', `%${filters.destination}%`)
  }
  
  // Filtrare pe date
  if (filters.date) {
    query = query.gte('available_from', filters.date)
  }
  
  // Filtrare pe container type
  if (filters.containerType) {
    query = query.contains('container_types', [filters.containerType])
  }
  
  const { data, error } = await query.limit(50)
  
  if (error) throw error
  
  // Transform data în SearchResult format
  return (data || []).map(item => ({
    id: item.id,
    type: 'transporter',
    company: item.transporter?.company_name || 'Unknown',
    rating: item.transporter?.transporter_profile?.rating_average || 0,
    reviews: item.transporter?.transporter_profile?.rating_count || 0,
    route: `${item.origin_city} → ${item.destination_city || 'Flexible'}`,
    available: `${item.available_from}${item.available_until ? ' - ' + item.available_until : ''}`,
    containerType: item.container_types?.join(', ') || '',
    price: item.fixed_price || 0,
    verified: item.transporter?.kyc_status === 'approved',
    fleet: `${item.transporter?.transporter_profile?.fleet_size || 0} trucks`,
    country: item.transporter?.company_country || ''
  }))
}

/**
 * Search pentru TRANSPORTATORI - caută shipments disponibile
 */
export async function searchShipments(filters: SearchFilters): Promise<SearchResult[]> {
  const supabase = await createClient()
  
  let query = supabase
    .from('shipments')
    .select(`
      id,
      origin_city,
      origin_country,
      destination_city,
      destination_country,
      pickup_date,
      delivery_date,
      container_type,
      cargo_type,
      transport_type,
      budget,
      budget_visible,
      special_instructions,
      client:profiles!shipments_client_id_fkey(
        id,
        company_name,
        company_country,
        kyc_status,
        client_profile:client_profiles!client_profiles_profile_id_fkey(
          rating_average,
          rating_count
        )
      ),
      offers(count)
    `)
    .in('status', ['pending', 'offer_received'])
  
  // Filtrare pe origin
  if (filters.origin) {
    query = query.ilike('origin_city', `%${filters.origin}%`)
  }
  
  // Filtrare pe destination
  if (filters.destination) {
    query = query.ilike('destination_city', `%${filters.destination}%`)
  }
  
  // Filtrare pe date
  if (filters.date) {
    query = query.gte('pickup_date', filters.date)
  }
  
  // Filtrare pe container type
  if (filters.containerType) {
    query = query.eq('container_type', filters.containerType)
  }
  
  // Filtrare pe shipping type
  if (filters.shippingType) {
    query = query.eq('transport_type', filters.shippingType.toLowerCase())
  }
  
  const { data, error } = await query
    .order('created_at', { ascending: false })
    .limit(50)
  
  if (error) throw error
  
  // Transform data în SearchResult format
  return (data || []).map(item => ({
    id: item.id,
    type: 'shipment',
    company: item.client?.company_name || 'Unknown',
    rating: item.client?.client_profile?.rating_average || 0,
    reviews: item.client?.client_profile?.rating_count || 0,
    route: `${item.origin_city} → ${item.destination_city}`,
    pickup: item.pickup_date,
    delivery: item.delivery_date || 'TBD',
    containerType: item.container_type,
    cargoType: item.cargo_type,
    price: item.budget_visible ? item.budget : 0,
    verified: item.client?.kyc_status === 'approved',
    country: item.client?.company_country || ''
  }))
}

/**
 * Main search function - router bazat pe searchType
 */
export async function search(filters: SearchFilters): Promise<SearchResult[]> {
  if (filters.searchType === 'client') {
    return searchTransporters(filters)
  } else {
    return searchShipments(filters)
  }
}

/**
 * Check dacă user-ul are subscription activ (pentru unlock)
 */
export async function hasActiveSubscription(userId: string): Promise<boolean> {
  const supabase = await createClient()
  
  const { data } = await supabase
    .from('subscriptions')
    .select('id')
    .eq('user_id', userId)
    .eq('status', 'active')
    .gt('expires_at', new Date().toISOString())
    .single()
  
  return !!data
}
```

---

## 🎨 Update Frontend Component

### Modificări în **`src/components/home/freight-search.tsx`**:

```typescript
// Replace mock data cu API call
import { search, type SearchFilters, type SearchResult } from '@/lib/actions/search'

// În componenta FreightSearch:
const [results, setResults] = useState<SearchResult[]>([])
const [loading, setLoading] = useState(false)

const handleSearch = async () => {
  setLoading(true)
  try {
    const searchFilters: SearchFilters = {
      searchType,
      origin: filters.origin,
      destination: filters.destination,
      date: filters.date,
      containerType: filters.containerType,
      shippingType: filters.shippingType
    }
    
    const data = await search(searchFilters)
    setResults(data)
    setShowResults(true)
  } catch (error) {
    console.error('Search error:', error)
  } finally {
    setLoading(false)
  }
}

// Replace MOCK_RESULTS cu results în map:
{results.map((result) => (
  // ... existing result card code
))}
```

---

## 📊 Queries SQL Exemple (Pentru Referință)

### Query 1: Client caută Transportatori
```sql
SELECT 
  ta.id,
  ta.origin_city,
  ta.origin_country,
  ta.destination_city,
  ta.destination_country,
  ta.available_from,
  ta.available_until,
  ta.container_types,
  ta.fixed_price,
  p.company_name,
  p.company_country,
  p.kyc_status,
  tp.fleet_size,
  tp.rating_average,
  tp.rating_count,
  tp.completed_shipments
FROM truck_availability ta
JOIN profiles p ON p.id = ta.transporter_id
LEFT JOIN transporter_profiles tp ON tp.profile_id = p.id
WHERE 
  ta.is_active = true
  AND p.kyc_status = 'approved'
  AND ta.origin_city ILIKE '%Rotterdam%'
  AND ta.destination_city ILIKE '%Hamburg%'
  AND ta.available_from >= '2024-03-15'
  AND '40ft_hc' = ANY(ta.container_types)
ORDER BY tp.rating_average DESC, tp.completed_shipments DESC
LIMIT 50;
```

### Query 2: Transporter caută Shipments
```sql
SELECT 
  s.id,
  s.origin_city,
  s.origin_country,
  s.destination_city,
  s.destination_country,
  s.pickup_date,
  s.delivery_date,
  s.container_type,
  s.cargo_type,
  s.transport_type,
  s.budget,
  s.budget_visible,
  p.company_name,
  p.company_country,
  p.kyc_status,
  cp.rating_average,
  cp.rating_count,
  (SELECT COUNT(*) FROM offers WHERE shipment_id = s.id) as offer_count
FROM shipments s
JOIN profiles p ON p.id = s.client_id
LEFT JOIN client_profiles cp ON cp.profile_id = p.id
WHERE 
  s.status IN ('pending', 'offer_received')
  AND s.origin_city ILIKE '%Rotterdam%'
  AND s.destination_city ILIKE '%Hamburg%'
  AND s.pickup_date >= '2024-03-15'
  AND s.container_type = '40ft_hc'
  AND s.transport_type = 'fcl'
ORDER BY s.created_at DESC
LIMIT 50;
```

---

## 🚀 Plan Implementare (Step-by-Step)

### **Nivel 1 - Funcționalitate Minimă (1-2 ore)**

#### Step 1: Adaugă Indexes în Supabase (5 min)
```bash
# Conectează-te la Supabase Dashboard → SQL Editor
# Rulează queries din secțiunea "Indexes Necesare"
```

#### Step 2: Creează Server Action (30 min)
```bash
# Creează fișier nou:
touch src/lib/actions/search.ts

# Copiază codul din secțiunea "Implementare Backend"
```

#### Step 3: Update Frontend Component (15 min)
```bash
# Modifică src/components/home/freight-search.tsx
# Replace mock data cu API call (vezi secțiunea "Update Frontend Component")
```

#### Step 4: Test & Debug (10 min)
```bash
# Test search cu filtre diferite
# Verifică că rezultatele sunt corecte
# Verifică blur/lock pentru non-premium users
```

---

### **Nivel 2 - Optimizări (3-4 ore)**

#### Step 5: Adaugă Geocoding (opțional)
```sql
-- Adaugă coloane pentru lat/lng
ALTER TABLE shipments ADD COLUMN origin_lat DECIMAL(10,8);
ALTER TABLE shipments ADD COLUMN origin_lng DECIMAL(11,8);
ALTER TABLE shipments ADD COLUMN destination_lat DECIMAL(10,8);
ALTER TABLE shipments ADD COLUMN destination_lng DECIMAL(11,8);

-- Adaugă coloane pentru port/terminal
ALTER TABLE shipments ADD COLUMN origin_port TEXT;
ALTER TABLE shipments ADD COLUMN destination_port TEXT;
ALTER TABLE shipments ADD COLUMN origin_terminal TEXT;
ALTER TABLE shipments ADD COLUMN destination_terminal TEXT;
```

#### Step 6: Relevance Scoring Algorithm
```typescript
// În search.ts, adaugă sorting logic pentru "Relevance":
function calculateRelevanceScore(result: SearchResult, filters: SearchFilters): number {
  let score = 0
  
  // Exact match origin/destination = +10
  if (result.route.includes(filters.origin || '')) score += 10
  if (result.route.includes(filters.destination || '')) score += 10
  
  // Rating = +5 per star
  score += result.rating * 5
  
  // Verified = +15
  if (result.verified) score += 15
  
  // Completed shipments (pentru transportatori) = +1 per 10 shipments
  if (result.type === 'transporter') {
    score += Math.floor((result.reviews || 0) / 10)
  }
  
  return score
}

// Sort by relevance:
results.sort((a, b) => calculateRelevanceScore(b, filters) - calculateRelevanceScore(a, filters))
```

---

### **Nivel 3 - Features Avansate (5+ ore)**

#### Step 7: Saved Searches & Alerts
```typescript
// Folosește tabelul existent saved_filters
export async function saveSearch(userId: string, name: string, filters: SearchFilters) {
  const supabase = await createClient()
  
  await supabase.from('saved_filters').insert({
    user_id: userId,
    name,
    filters: filters as any,
    notify_email: true,
    notify_inapp: true,
    is_active: true
  })
}

// Cron job pentru notificări (Supabase Edge Function sau Vercel Cron)
// Check saved_filters și trimite email când apar rezultate noi
```

#### Step 8: Map View pentru Results
```typescript
// Integrare Google Maps cu markers pentru fiecare rezultat
// Similar cu ShipmentRouteMap existent
```

---

## 🔒 Subscription Check (Freemium Model)

### Verificare Premium Access:

```typescript
// În freight-search.tsx:
const [user, setUser] = useState<User | null>(null)
const [isPremium, setIsPremium] = useState(false)

useEffect(() => {
  async function checkSubscription() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      setUser(user)
      const premium = await hasActiveSubscription(user.id)
      setIsPremium(premium)
    }
  }
  
  checkSubscription()
}, [])

// În result card:
{isPremium ? (
  // Show full details (price, contact, etc)
  <div>
    <p>€{result.price}</p>
    <Button>Contact</Button>
  </div>
) : (
  // Show blurred/locked
  <div className="relative blur-sm">
    <p>€{result.price}</p>
    <div className="absolute inset-0">
      <Lock /> Locked
    </div>
  </div>
)}
```

---

## 📝 Checklist Final

### ✅ Înainte de implementare:
- [ ] Schema DB verificată (toate tabelele există)
- [ ] Indexes adăugate în Supabase
- [ ] `.env.local` conține Supabase credentials

### ✅ După implementare:
- [ ] Server action `search.ts` creat și testat
- [ ] Frontend component conectat la API
- [ ] Subscription check funcționează
- [ ] Blur/lock UI funcționează pentru non-premium
- [ ] Responsive design verificat pe mobil
- [ ] Performance test cu 50+ rezultate

---

## 🐛 Troubleshooting

### Problema: "No results found"
**Soluție:** Verifică că există date în `shipments` sau `truck_availability` cu `is_active = true`

### Problema: "Slow search (>2s)"
**Soluție:** Verifică că indexes sunt create corect cu `EXPLAIN ANALYZE` în SQL Editor

### Problema: "Blur/lock nu funcționează"
**Soluție:** Verifică `hasActiveSubscription()` returnează corect și că `subscriptions.status = 'active'`

### Problema: "Rating nu se afișează"
**Soluție:** Verifică join-urile cu `transporter_profiles` și `client_profiles` în query

---

## 📚 Resurse Suplimentare

- **Supabase Docs:** https://supabase.com/docs/guides/database/joins
- **PostgreSQL Full-Text Search:** https://www.postgresql.org/docs/current/textsearch.html
- **React Server Actions:** https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions

---

**Documentație creată:** 23 Feb 2026  
**Ultima actualizare:** 23 Feb 2026  
**Versiune:** 1.0
