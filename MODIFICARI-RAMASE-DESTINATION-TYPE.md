# MODIFICĂRI RĂMASE - DESTINATION TYPE (PORT vs CLIENT)

## ✅ COMPLETAT:
1. ✅ Migrație SQL creată: `supabase-migration-add-destination-type.sql`
2. ✅ Interface CreateShipmentData actualizat cu `destination_type`
3. ✅ Submit logic în post page trimite `destination_type`
4. ✅ My Shipments (client) afișează corect PORT vs CLIENT
5. ✅ Available Shipments (transporter desktop) afișează corect PORT vs CLIENT

---

## ⚠️ MODIFICĂRI RĂMASE:

### 1. MOBILE CLIENT (transporter)
**Fișier:** `src/app/dashboard/transporter/shipments/mobile-client.tsx`

**Modificări necesare:**
- Adaugă `destination_type: string | null` în interface Shipment (linia ~76)
- Adaugă MapPin în imports
- La linia ~226: Parsare diferită pentru dropTerminal bazat pe destination_type
- La linia ~297-306: Afișare icon diferit (MapPin pentru client, Flag pentru port)

**Cod exemplu:**
```typescript
// Import
import { ..., MapPin } from 'lucide-react'

// Interface
interface Shipment {
  ...
  destination_type: string | null
  ...
}

// Parsare
const dropInfo = s.destination_type === 'client' 
  ? { address: s.destination_address?.split(' | ')[0] || '' }
  : { terminal: s.destination_address?.split(' | ')[0] || '' }

// Afișare
{s.destination_type === 'client' ? (
  <MapPin className="h-4 w-4 text-emerald-500" />
) : (
  <MapPin className="h-4 w-4 text-red-500" />
)}
```

---

### 2. SHIPMENT DETAILS PAGE (transporter)
**Fișier:** `src/app/dashboard/transporter/shipments/[id]/client.tsx`

**Modificări necesare:**
- Adaugă `destination_type: string | null` în interface Shipment (linia ~148)
- La linia ~219-221: Parsare diferită pentru drop bazat pe destination_type
- La linia ~262-266: Label diferit pentru hartă ("Drop-off Port" vs "Client Delivery")
- La linia ~478-505: Secțiune Drop-off cu titlu și câmpuri diferite

**Cod exemplu:**
```typescript
// Parsare
const dropInfo = shipment.destination_type === 'client'
  ? {
      address: shipment.destination_address?.split(' | ')[0] || '',
      clientDetails: shipment.destination_address?.split(' | ')[1] || '',
      containerRef: shipment.destination_address?.split(' | ')[2] || '',
      seal: shipment.destination_address?.split(' | ')[3]?.replace('Seal: ', '') || '',
      gps: shipment.destination_address?.split(' | ')[4]?.replace('GPS: ', '') || ''
    }
  : {
      terminal: shipment.destination_address?.split(' | ')[0] || '',
      containerRef: shipment.destination_address?.split(' | ')[1] || '',
      seal: shipment.destination_address?.split(' | ')[2]?.replace('Seal: ', '') || ''
    }

// Label hartă
label: shipment.destination_type === 'client' 
  ? `Client Delivery: ${shipment.destination_city}`
  : `Drop-off Port: ${shipment.destination_city}`

// Titlu secțiune
<span className="text-sm font-bold">
  {shipment.destination_type === 'client' ? 'Client Delivery' : 'Drop-off Port'}
</span>

// Afișare câmpuri
{shipment.destination_type === 'client' ? (
  <>
    <div className="flex items-center gap-2">
      <MapPin className="h-3.5 w-3.5 text-gray-400" />
      <span className="font-medium">{dropInfo.address}</span>
    </div>
    {dropInfo.clientDetails && (
      <div className="flex items-center gap-2 pl-5">
        <span className="text-gray-600">Client: {dropInfo.clientDetails}</span>
      </div>
    )}
  </>
) : (
  <>
    <div className="flex items-center gap-2">
      <MapPin className="h-3.5 w-3.5 text-gray-400" />
      <span className="font-medium">{shipment.destination_city}, {shipment.destination_country}</span>
    </div>
    {dropInfo.terminal && (
      <div className="flex items-center gap-2 pl-5">
        <Building2 className="h-3.5 w-3.5 text-cyan-400" />
        <span className="text-gray-600">{dropInfo.terminal}</span>
      </div>
    )}
  </>
)}
```

**Query update (page.tsx linia ~19):**
```typescript
destination_type,
```

---

### 3. EMAIL NOTIFICARE
**Fișier:** `src/emails/shipment-new-available.tsx`

**Modificări necesare:**
- Adaugă `destinationType?: string` în props (linia ~10)
- La linia ~46-53: Titlu și label diferit pentru secțiunea Destination

**Cod exemplu:**
```typescript
interface ShipmentNewAvailableEmailProps {
  ...
  destinationType?: string
  ...
}

// Secțiune Destination
<Section style={detailsBox}>
  <Text style={sectionTitle}>
    {props.destinationType === 'client' ? '🏢 Client Delivery' : '🎯 Drop Port'}
  </Text>
  <table style={detailsTable}>
    <tr>
      <td style={detailsLabel}>
        {props.destinationType === 'client' ? 'Address:' : 'City:'}
      </td>
      <td style={detailsValue}>{props.destinationCity}, {props.destinationCountry}</td>
    </tr>
    {props.destinationAddress && (
      <tr>
        <td style={detailsLabel}>
          {props.destinationType === 'client' ? 'Details:' : 'Terminal:'}
        </td>
        <td style={detailsValue}>{props.destinationAddress}</td>
      </tr>
    )}
    {props.deliveryDate && <tr><td>Delivery:</td><td>{props.deliveryDate}</td></tr>}
  </table>
</Section>
```

**Update în shipments.ts (linia ~110-130):**
```typescript
await sendTemplateEmail({
  ...
  destinationType: shipment.destination_type,
  ...
})
```

---

## 🔧 PAȘI URMĂTORI:

1. **Rulează migrația SQL în Supabase:**
   - Deschide Supabase Dashboard
   - SQL Editor
   - Rulează `supabase-migration-add-destination-type.sql`

2. **Completează modificările rămase** (mobile, details, email)

3. **Testează:**
   - Creează shipment nou cu DROP PORT
   - Creează shipment nou cu DROP CLIENT
   - Verifică afișare în My Shipments
   - Verifică afișare în Available Shipments (desktop + mobile)
   - Verifică detalii shipment
   - Verifică email notificare

---

## 📊 PROGRES:
- ✅ 60% completat (5/8 task-uri)
- ⚠️ 40% rămas (3/8 task-uri)
