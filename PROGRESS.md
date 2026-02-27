# Trade Container — European Freight Exchange
## Progress Log

**Live URL:** https://transport-nine-mauve.vercel.app  
**GitHub:** https://github.com/onmygenius/transport  
**Stack:** Next.js 15 · Supabase · Tailwind CSS · shadcn/ui · TypeScript

---

## Sesiunea 1 — Branding & Auth

### Modificări
- `src/app/layout.tsx` — titlu pagină: `Trade Container — European Freight Exchange`
- `src/app/page.tsx` — înlocuit `FreightEx Europe` cu `Trade Container` peste tot; buton `Get Started NOW`; eliminat referințe escrow/comisioane
- `src/app/(auth)/login/page.tsx` — logo `logo.png` în loc de icon Truck; video background `hero_login.mp4`; text vizibil pe inputuri (color fix)
- `src/app/(auth)/register/page.tsx` — logo `logo.png`; text `Pan-European route coverage`; buton `Register`
- `src/app/dashboard/transporter/subscription/page.tsx` — text `Direct payment from clients (no middleman)`
- `src/components/ui/input.tsx` — `text-gray-900` adăugat pentru vizibilitate
- `src/components/ui/label.tsx` — `text-gray-700` adăugat pentru vizibilitate

---

## Sesiunea 2 — Post Shipment Form (Client)

### Fișiere noi
- `src/components/ui/places-autocomplete.tsx` — Google Maps Places Autocomplete cu returnare `lat/lng`
- `src/components/ui/port-select.tsx` — `PortSelect` + `TerminalSelect` cu date statice

### `PortSelect`
- 57 porturi maritime europene (Rotterdam, Hamburg, Antwerp, etc.)
- Căutare după nume sau țară
- Afișare: `Nume · Țară · LOCODE`

### `TerminalSelect`
- Terminale filtrate per port (bazat pe LOCODE)
- Opțiune **"✏️ Other (enter manually)"** → input text liber + buton `← List` revenire
- Dacă portul nu are terminale definite → input text liber direct

### `src/app/dashboard/client/post/page.tsx` — rescris complet
**Structura nouă:**
1. **Pick-up** — Port (PortSelect) · Terminal (TerminalSelect) · Container/Ref · Dată · Oră
2. **Destination** (1–4 dinamice) — Adresă (Google Maps Autocomplete) · Tip operație (Loading/Unloading) · Dată · Oră · **Mini-map Google Maps** după selectarea adresei
3. **Drop Container** — Port · Terminal · Container/Ref · Dată · Oră
4. **Cargo Details** — Container Type · Nr. containere · Greutate · Tip marfă · Tip transport
5. **Budget & Notes** — Buget · Vizibilitate buget · Instrucțiuni speciale

**Validare:** port pick-up, dată pick-up, port drop, dată drop, tip container, greutate  
**Submit:** `createShipment()` → Supabase → confirmare "Shipment Posted!"

### Google Maps
- API Key: `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` configurat în Vercel + `.env.local`
- Autocomplete pentru adrese Destination (geocode + establishment)
- Mini-map embed `iframe` afișat după selectarea adresei (zoom 14)

---

## Sesiunea 3 — UI Fixes & Bug Fixes

### Fix-uri UI
- `src/components/ui/textarea.tsx` — `bg-white text-gray-900` explicit (fix background negru)
- `src/components/ui/button.tsx` — variant `outline` → `text-gray-900` explicit (fix buton Cancel invizibil)

### Fix Admin Sign Out (HTTP 405)
- `src/components/admin/sidebar.tsx` — înlocuit `<form action="/api/auth/signout" method="POST">` cu `supabase.auth.signOut()` + `router.push('/login')` (același pattern ca client/transporter)

---

## Sesiunea 4 — My Shipments & Truck Form

### My Shipments (Client) — `src/app/dashboard/client/shipments/client.tsx`
- Coloana **Route** → înlocuită cu **Pick-up Port** + **Drop Port** separate
- Iconițe ancoră: albastru pentru pick-up, portocaliu pentru drop
- Afișare terminal sub portul selectat (din `origin_address`)
- Coloana **Container / Date** — tip container + dată pe 2 rânduri
- Interfața `Shipment` extinsă cu `origin_address` și `destination_address`
- Query Supabase actualizat să selecteze câmpurile noi

### Truck Form — `src/app/dashboard/transporter/trucks/new/page.tsx`
- **Container Type** → înlocuit cu **Chassis Type**
- Opțiuni chassis:
  - Standard 20ft Chassis
  - Standard 40ft Chassis
  - Extendable 20ft–40ft Chassis
  - 45ft Chassis
  - Genset Chassis (Reefer power)
  - Triaxle Chassis (Heavy load)
  - Tanktainer Chassis
  - Flatbed Container Chassis
  - Swap Body Chassis
  - Bimodal Chassis (Road + Rail)

---

## Configurare Vercel — Environment Variables

| Variabilă | Valoare |
|-----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://helnlbwxlrwemrowhklo.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGci...` |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGci...` |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | `AIzaSyBRhZDFpokHxZYTOHRdxaLeP9bIOoD6fg4` |

---

## Deploy Workflow

```bash
# 1. Push pe GitHub (auto-deploy Vercel)
git add -A && git commit -m "mesaj" && git push origin main
```

> Vercel face deploy automat la fiecare push pe `main`.

---

## Conturi de test

| Rol | Email | Parolă |
|-----|-------|--------|
| Client | client@firma.ro | 12345 |
| Transporter | transporter@firma.ro | 12345 |
| Admin | admin@tradecontainer.eu | admin123 |

Vezi `TEST-ACCOUNTS.md` pentru detalii complete.

---

## Sesiunea 5 — Messaging System (25 februarie 2026)

### Backend — Server Actions (`src/lib/actions/messages.ts`)
- ✅ **`sendMessage()`** — trimite mesaj nou cu autentificare și validare
- ✅ **`getMessages()`** — obține toate mesajele pentru un shipment cu info sender
- ✅ **`markMessagesAsRead()`** — marchează mesajele ca citite automat
- ✅ **`getConversations()`** — listă conversații cu număr mesaje necitite
- ✅ **`getShipmentForChat()`** — info shipment pentru header chat
- ✅ **`getUnreadMessagesCount()`** — total mesaje necitite pentru user
- Query-uri simplificate (fără join-uri complexe) pentru stabilitate
- Control acces strict (RLS) și error handling complet

### Database — RLS Policies (`create-chat-messages-rls.sql`)
- ✅ **SELECT policy** — users pot vedea mesajele pentru shipment-urile lor
- ✅ **INSERT policy** — users pot trimite mesaje pentru shipment-urile lor
- ✅ **UPDATE policy** — users pot marca mesajele ca citite
- ✅ **Performance indexes** — `shipment_id`, `sender_id`, `created_at`, `is_read`

### UI — Chat Individual
**Client:** `/dashboard/client/messages/[shipmentId]`  
**Transporter:** `/dashboard/transporter/messages/[shipmentId]`

**Features:**
- Design modern cu mesaje colorate (verde pentru client, albastru pentru transporter)
- Auto-scroll la ultimul mesaj
- Textarea cu auto-resize
- **Enter** pentru send, **Shift+Enter** pentru linie nouă
- Formatare timp relativă (Just now, 5 minutes ago, Yesterday, etc.)
- Header cu nume partener și rută (Warsaw → Rome)
- Buton "Back to Messages" pentru navigare

### UI — Liste Conversații
**Client:** `/dashboard/client/messages`  
**Transporter:** `/dashboard/transporter/messages`

**Features:**
- Date reale din baza de date (nu mock data)
- Badge roșu cu număr mesaje necitite per conversație
- Cod shipment (SHP-6E6B7290)
- Ultimul mesaj + timp
- Link direct la chat individual
- Empty state când nu există conversații

### 🔴 Notificări Mesaje Necitite
**Sidebar Client:** `src/components/client/sidebar.tsx`  
**Sidebar Transporter:** `src/components/transporter/sidebar.tsx`

**Features:**
- **Badge roșu** pe link "Messages" în sidebar
- Afișează numărul total de mesaje necitite (1-99+)
- Se actualizează automat la fiecare încărcare pagină
- Integrare în layout prin `getUnreadMessagesCount()`

### Bug Fixes
- ✅ **Next.js 15+ params Promise** — fix `await params` în dynamic routes `[shipmentId]`
- ✅ **Supabase complex joins** — simplificat queries pentru a evita erori RLS
- ✅ **TypeScript ActionResult** — fix typing pentru `markMessagesAsRead()`

### Testat și Funcțional
- ✅ Mesaj trimis cu succes de la client către transporter
- ✅ Chat se încarcă corect fără redirect
- ✅ Navigare funcționează perfect
- ✅ Badge-ul roșu apare când există mesaje necitite
- ✅ Mark as read funcționează automat

**Commit:** `feat: complete messaging system with unread notifications` (6a9139e)

---

## TODO — Următoarele

- [x] Sistem mesagerie complet între client și transporter
- [x] Notificări vizuale pentru mesaje necitite
- [ ] Pagina detalii shipment `/dashboard/client/shipments/[id]` — afișare Pick-up, Destinations, Drop complet
- [ ] Dashboard transporter — shipmente disponibile cu noua structură Pick-up/Drop
- [ ] Formularul Truck — salvare în Supabase (momentan doar UI)
- [ ] Pagina My Trucks (transporter) — afișare chassis type
