#!/bin/bash
# =============================================
# BACKUP COMPLET BAZA DE DATE SUPABASE
# Data: 2026-02-25
# =============================================

# IMPORTANT: Înlocuiește [YOUR-PASSWORD] cu parola ta reală din connection string!
CONNECTION_STRING="postgresql://postgres:[YOUR-PASSWORD]@db.helnlbwxlrwemrowhklo.supabase.co:5432/postgres"

echo "🔄 Începe backup-ul bazei de date..."

# 1. Backup ROLES (utilizatori și permisiuni)
echo "📦 Backup roles..."
supabase db dump --db-url "$CONNECTION_STRING" -f backup-roles-$(date +%Y%m%d_%H%M%S).sql --role-only

# 2. Backup SCHEMA (structura tabelelor, enum-uri, funcții, etc.)
echo "📦 Backup schema..."
supabase db dump --db-url "$CONNECTION_STRING" -f backup-schema-$(date +%Y%m%d_%H%M%S).sql

# 3. Backup DATA (toate datele din tabele)
echo "📦 Backup data..."
supabase db dump --db-url "$CONNECTION_STRING" -f backup-data-$(date +%Y%m%d_%H%M%S).sql --use-copy --data-only

echo "✅ Backup complet finalizat!"
echo "📁 Fișiere create:"
ls -lh backup-*.sql
