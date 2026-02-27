# Backup Baza de Date Supabase - 27 Februarie 2026

## 🔐 Informații Proiect

**Supabase Project:** helnlbwxlrwemrowhklo  
**Database:** postgres  
**Host:** db.helnlbwxlrwemrowhklo.supabase.co  
**Port:** 5432

---

## 📦 Metoda 1: Backup prin Supabase Dashboard (Recomandat)

### Pași:

1. **Accesează Supabase Dashboard:**
   - URL: https://supabase.com/dashboard/project/helnlbwxlrwemrowhklo

2. **Navighează la Database:**
   - Click pe "Database" în sidebar
   - Click pe "Backups" tab

3. **Creează Backup Manual:**
   - Click pe "Create backup" sau "Download backup"
   - Salvează fișierul `.sql` local

---

## 📦 Metoda 2: Export prin SQL Editor

### Pași:

1. **Accesează SQL Editor:**
   - URL: https://supabase.com/dashboard/project/helnlbwxlrwemrowhklo/sql

2. **Rulează query-uri pentru export date:**

```sql
-- Export toate shipment-urile
COPY (
  SELECT * FROM shipments
) TO '/tmp/shipments_backup_2026-02-27.csv' WITH CSV HEADER;

-- Export toate ofertele
COPY (
  SELECT * FROM offers
) TO '/tmp/offers_backup_2026-02-27.csv' WITH CSV HEADER;

-- Export toate mesajele
COPY (
  SELECT * FROM messages
) TO '/tmp/messages_backup_2026-02-27.csv' WITH CSV HEADER;

-- Export toți userii
COPY (
  SELECT * FROM profiles
) TO '/tmp/profiles_backup_2026-02-27.csv' WITH CSV HEADER;
```

**Notă:** Această metodă poate să nu funcționeze direct din browser din cauza permisiunilor de fișiere.

---

## 📦 Metoda 3: Export prin pg_dump (Cel mai complet)

### Pași:

1. **Instalează PostgreSQL client** (dacă nu e deja instalat):
   ```bash
   brew install postgresql
   ```

2. **Rulează pg_dump pentru backup complet:**

```bash
# Backup complet al bazei de date
pg_dump "postgresql://postgres:SobranieTransport2026!@db.helnlbwxlrwemrowhklo.supabase.co:5432/postgres" \
  > backup-freight-exchange-2026-02-27.sql

# Sau doar schema (fără date)
pg_dump --schema-only "postgresql://postgres:SobranieTransport2026!@db.helnlbwxlrwemrowhklo.supabase.co:5432/postgres" \
  > schema-backup-2026-02-27.sql

# Sau doar datele (fără schema)
pg_dump --data-only "postgresql://postgres:SobranieTransport2026!@db.helnlbwxlrwemrowhklo.supabase.co:5432/postgres" \
  > data-backup-2026-02-27.sql
```

3. **Backup specific pentru tabele importante:**

```bash
# Backup doar tabelele principale
pg_dump "postgresql://postgres:SobranieTransport2026!@db.helnlbwxlrwemrowhklo.supabase.co:5432/postgres" \
  --table=shipments --table=offers --table=messages --table=profiles \
  > main-tables-backup-2026-02-27.sql
```

---

## 📦 Metoda 4: Export Manual prin SQL Queries

### Rulează în Supabase SQL Editor:

```sql
-- 1. Export shipments ca JSON
SELECT json_agg(row_to_json(shipments.*))
FROM shipments;
-- Copiază rezultatul și salvează ca shipments_backup.json

-- 2. Export offers ca JSON
SELECT json_agg(row_to_json(offers.*))
FROM offers;
-- Copiază rezultatul și salvează ca offers_backup.json

-- 3. Export messages ca JSON
SELECT json_agg(row_to_json(messages.*))
FROM messages;
-- Copiază rezultatul și salvează ca messages_backup.json

-- 4. Export profiles ca JSON
SELECT json_agg(row_to_json(profiles.*))
FROM profiles;
-- Copiază rezultatul și salvează ca profiles_backup.json
```

---

## 🔄 Restore din Backup

### Dacă ai nevoie să restaurezi:

```bash
# Restore din pg_dump backup
psql "postgresql://postgres:SobranieTransport2026!@db.helnlbwxlrwemrowhklo.supabase.co:5432/postgres" \
  < backup-freight-exchange-2026-02-27.sql
```

---

## ✅ Verificare Backup

După ce ai făcut backup, verifică:

```sql
-- Număr total shipments
SELECT COUNT(*) FROM shipments;

-- Număr total offers
SELECT COUNT(*) FROM offers;

-- Număr total messages
SELECT COUNT(*) FROM messages;

-- Număr total profiles
SELECT COUNT(*) FROM profiles;
```

Notează aceste numere și compară după restore pentru a verifica că totul e OK.

---

## 📋 Checklist Backup

- [ ] Backup făcut prin Supabase Dashboard SAU
- [ ] Backup făcut prin pg_dump SAU
- [ ] Backup manual prin SQL queries (JSON)
- [ ] Fișiere salvate local în siguranță
- [ ] Verificat că backup-ul conține toate datele
- [ ] Notat numărul de înregistrări pentru fiecare tabel

---

## ⚠️ IMPORTANT

**După ce ai făcut backup, poți șterge în siguranță shipment-urile folosind:**
```sql
DELETE FROM shipments;
```

**Backup-ul îți permite să restaurezi datele oricând ai nevoie!**
