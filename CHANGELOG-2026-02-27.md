# Changelog - 27 Februarie 2026

## 📋 Rezumat Sesiune de Lucru

**Data:** 27 Februarie 2026  
**Commits:** `9de80e2`, `9b1c278`  
**Status:** ✅ Toate fix-urile implementate și testate cu succes

---

## 🎯 Probleme Rezolvate

### 1. ✅ Parsing Corect Intermediate Stops și Destinations

**Problema:**
- Intermediate stops și destinations nu se afișau deloc sau apăreau toate pe o singură linie
- Parsing-ul nu funcționa corect pentru formatul cu pipe separator (`|`)

**Soluție:**
- Modificat funcțiile `parseIntermediateStops()` și `parseDestinations()` pentru a face split după `|` în loc de newline
- Adăugat suport pentru format cu/fără oră (ex: `2026-02-27 12:00` sau `2026-02-27`)
- Regex actualizat: `/(\d+)\.\s*([^\[]+)\s*\[([^\]]+)\]\s*(\d{4}-\d{2}-\d{2})(?:\s+(\d{2}:\d{2}))?/`

**Fișiere modificate:**
- `src/app/dashboard/client/shipments/[id]/client.tsx`
- `src/app/dashboard/transporter/shipments/[id]/client.tsx`

---

### 2. ✅ Afișare Corectă Weighbridge/Customs

**Problema:**
- În pagina transportatorului, intermediate stops afișau "Loading & Unloading" generic în loc de "Weighbridge" sau "Customs"

**Soluție:**
- Actualizat interfața `Stop` pentru a include `'weighbridge'` și `'customs'` ca tipuri valide de `operation`
- Modificat logica de rendering pentru a verifica explicit pentru `weighbridge` și `customs`:
  ```typescript
  {stop.operation === 'weighbridge' ? 'Weighbridge' : 
   stop.operation === 'customs' ? 'Customs' : 
   stop.operation}
  ```

**Fișiere modificate:**
- `src/app/dashboard/transporter/shipments/[id]/client.tsx`

---

### 3. ✅ Afișare Corectă Cargo Type

**Problema:**
- Când se selecta "General Cargo", se afișa "Reefer (Temperature Controlled)"

**Soluție:**
- Modificat logica de mapping pentru `cargo_type`:
  ```typescript
  {shipment.cargo_type === 'dangerous' ? 'Dangerous Goods' : 
   shipment.cargo_type === 'reefer' ? 'Reefer (Temperature Controlled)' : 
   'General Cargo'}
  ```

**Fișiere modificate:**
- `src/app/dashboard/transporter/shipments/[id]/client.tsx`

---

### 4. ✅ Nou Format "Route Stops" - Păstrează Ordinea Exactă

**Problema:**
- Stopurile erau salvate în două grupuri separate ("Intermediate Stops" și "Destinations")
- La afișare, toate intermediate stops apăreau primele, apoi toate destinations
- Nu se păstra ordinea exactă în care utilizatorul le-a adăugat în formular

**Exemplu problemă:**
```
User a creat: Int 1 → Dest 1 → Dest 2 → Int 2
Se afișa:     Int 1 → Int 2 → Dest 1 → Dest 2  ❌
```

**Soluție:**
- Implementat nou format de salvare "Route Stops" care păstrează ordinea exactă
- Format nou: `Route Stops: 1. Location [operation] date time {intermediate} | 2. Location [operation] date time {destination}`
- Adăugat tag-uri `{intermediate}` și `{destination}` pentru a identifica tipul fiecărui stop
- Implementat backward compatibility - shipment-urile vechi continuă să funcționeze cu formatul vechi

**Cod nou în pagina de creare:**
```typescript
stops.length > 0 ? `Route Stops: ${stops.map((s, i) => {
  if (s.type === 'intermediate') {
    return `${i + 1}. ${s.port} [${s.operation}...] ${s.date} ${s.time} {intermediate}`
  } else {
    return `${i + 1}. ${s.address} [${s.operationType}] ${s.date} ${s.time} {destination}`
  }
}).join(' | ')}` : ''
```

**Funcție nouă de parsing:**
```typescript
function parseRouteStops(instructions: string | null): Stop[] {
  // Try new format first: "Route Stops: ..."
  const newMatch = instructions.match(/Route Stops:\s*([\s\S]+?)(?=\n|$)/)
  if (newMatch) {
    // Parse with {intermediate} or {destination} tags
    // Returns stops in exact creation order
  }
  // Fallback to old format for backward compatibility
  return []
}
```

**Fișiere modificate:**
- `src/app/dashboard/client/post/page.tsx` (salvare nou format)
- `src/app/dashboard/client/shipments/[id]/client.tsx` (parsing + afișare)
- `src/app/dashboard/transporter/shipments/[id]/client.tsx` (parsing + afișare)
- `src/app/dashboard/transporter/shipments/client.tsx` (parsing + afișare listă)

---

### 5. ✅ Ordinea Corectă în Lista Available Shipments

**Problema:**
- În lista "Available Shipments" (`/dashboard/transporter/shipments`), stopurile erau afișate grupate (toate intermediate, apoi toate destinations) în loc de ordinea exactă

**Soluție:**
- Modificat rendering-ul pentru a folosi `allStops` direct în loc de `intermediateStops` + `destinations` separate
- Iconițe diferite pentru tipuri diferite:
  - Intermediate stops: 🟠 amber (`text-amber-500`)
  - Destinations: 🔵 cyan (`text-cyan-500`)

**Cod nou:**
```typescript
{allStops.map((stop, idx) => (
  <div key={`stop-${idx}`} className="flex items-center gap-2">
    <Truck className={`h-3.5 w-3.5 ${stop.type === 'intermediate' ? 'text-amber-500' : 'text-cyan-500'} shrink-0`} />
    <span className="text-gray-600">{stop.address}</span>
  </div>
))}
```

**Fișiere modificate:**
- `src/app/dashboard/transporter/shipments/client.tsx`

---

## 📦 Commits

### Commit `9de80e2`
**Mesaj:** `fix: preserve exact route stops order and correct cargo type display`

**Modificări:**
- Implementat nou format "Route Stops" pentru păstrarea ordinii exacte
- Fix parsing intermediate stops și destinations (split după `|`)
- Fix afișare Weighbridge/Customs în loc de "Loading & Unloading"
- Fix afișare cargo type (General Cargo/Dangerous/Reefer)
- Backward compatibility pentru shipment-uri vechi

**Fișiere:** 4 files changed, 197 insertions(+), 79 deletions(-)

---

### Commit `9b1c278`
**Mesaj:** `fix: display route stops in correct order in available shipments list`

**Modificări:**
- Fix ordinea stopurilor în lista Available Shipments
- Folosește `allStops` în loc de grupare separate
- Iconițe diferite pentru intermediate (amber) și destinations (cyan)

**Fișiere:** 1 file changed, 2 insertions(+), 8 deletions(-)

---

## 🧪 Testare

### Scenarii Testate

1. ✅ **Shipment nou cu ordine complexă:**
   - Creat: Pick-up → Int 1 → Dest 1 → Dest 2 → Int 2 → Drop-off
   - Verificat afișare în pagina de detalii client
   - Verificat afișare în pagina de detalii transportator
   - Verificat afișare în lista Available Shipments

2. ✅ **Cargo Type:**
   - Selectat "General Cargo" → afișează corect "General Cargo"
   - Selectat "Dangerous Goods" → afișează corect "Dangerous Goods"
   - Selectat "Reefer" → afișează corect "Reefer (Temperature Controlled)"

3. ✅ **Operation Types:**
   - Weighbridge → afișează "Weighbridge"
   - Customs → afișează "Customs"
   - Loading → afișează "Loading"
   - Unloading → afișează "Unloading"

4. ✅ **Backward Compatibility:**
   - Shipment-uri vechi (format "Intermediate Stops" + "Destinations") continuă să funcționeze
   - Se afișează grupate (toate intermediate, apoi toate destinations)

---

## 🔄 Backward Compatibility

**Shipment-uri vechi (înainte de 27 Feb 2026):**
- Format: `Intermediate Stops: ... | Destinations: ...`
- Afișare: Grupate (toate intermediate stops, apoi toate destinations)
- Funcționează normal cu funcțiile `parseIntermediateStops()` și `parseDestinations()`

**Shipment-uri noi (după 27 Feb 2026):**
- Format: `Route Stops: ... {intermediate} ... {destination}`
- Afișare: Ordinea exactă de creare
- Parsate cu funcția `parseRouteStops()`

---

## 📊 Impact

### Pagini Afectate

1. **`/dashboard/client/post`** - Pagina de creare shipment
   - Salvează în noul format "Route Stops"

2. **`/dashboard/client/shipments/[id]`** - Detalii shipment (client view)
   - Afișează stopurile în ordinea exactă
   - Suportă ambele formate (vechi și nou)

3. **`/dashboard/transporter/shipments/[id]`** - Detalii shipment (transporter view)
   - Afișează stopurile în ordinea exactă
   - Afișează corect Weighbridge/Customs
   - Afișează corect cargo type
   - Suportă ambele formate (vechi și nou)

4. **`/dashboard/transporter/shipments`** - Lista Available Shipments
   - Afișează stopurile în ordinea exactă în coloana "Locations"
   - Iconițe diferite pentru intermediate (amber) și destinations (cyan)
   - Suportă ambele formate (vechi și nou)

---

## 🚀 Deployment

**GitHub Repository:** https://github.com/onmygenius/transport  
**Branch:** main  
**Status:** ✅ Pushed successfully

**Commits pushed:**
- `9de80e2` - Fix principal (Route Stops, cargo type, parsing)
- `9b1c278` - Fix listă Available Shipments

---

## 📝 Note Tehnice

### Interfață Stop Actualizată

```typescript
interface Stop {
  number?: number
  location: string  // sau address (depinde de context)
  operation: 'loading' | 'unloading' | 'both' | 'weighbridge' | 'customs' | string
  date: string
  time: string
  type?: 'intermediate' | 'destination'  // NOU - pentru identificare tip
}
```

### Regex pentru Parsing

**Format nou:**
```typescript
/(\d+)\.\s*([^\[]+)\s*\[([^\]]+)\]\s*(\d{4}-\d{2}-\d{2})(?:\s+(\d{2}:\d{2}))?\s*\{(intermediate|destination)\}/
```

**Format vechi:**
```typescript
/(\d+)\.\s*([^\[]+)\s*\[([^\]]+)\]\s*(\d{4}-\d{2}-\d{2})(?:\s+(\d{2}:\d{2}))?/
```

---

## ✅ Checklist Final

- [x] Parsing corect intermediate stops și destinations
- [x] Afișare corectă Weighbridge/Customs
- [x] Afișare corectă Cargo Type
- [x] Nou format Route Stops implementat
- [x] Backward compatibility asigurată
- [x] Ordinea corectă în toate paginile
- [x] Testare completă
- [x] Push la GitHub
- [x] Documentație creată

---

**Sesiune completată cu succes! 🎉**
