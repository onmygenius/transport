# Test Accounts — FreightEx Europe

## Admin
| Field | Value |
|-------|-------|
| Email | admin@admin.ro |
| Password | 12345 |
| Role | admin |
| Dashboard | http://localhost:3000/admin |

## Transporter
| Field | Value |
|-------|-------|
| Email | transportator@firma.ro |
| Password | 12345 |
| Role | transporter |
| Company | Trans Test SRL |
| Dashboard | http://localhost:3000/dashboard/transporter |

## Client
| Field | Value |
|-------|-------|
| Email | client@firma.ro |
| Password | 12345 |
| Role | client |
| Company | Client Test SRL |
| Dashboard | http://localhost:3000/dashboard/client |

---

## Login URL
http://localhost:3000/login

## Notes
- All accounts have KYC status: **approved**
- Accounts are created in Supabase Auth + profiles table
- Admin bypasses middleware in development (NODE_ENV=development)
- In production, admin access requires role = 'admin' in profiles table
