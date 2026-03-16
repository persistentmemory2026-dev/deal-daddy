# Deal Daddy - Setup Checklist

## ✅ Repository erstellt!

**GitHub URL:** https://github.com/persistentmemory2026-dev/deal-daddy

---

## 🔑 Benötigte APIs & Accounts

### 1. OUTSCRAPER (ESSENTIAL - Kostenlos starten)

**Was:** Google Maps Scraping API

**Kosten:**
- 500 Unternehmen/Monat: **KOSTENLOS**
- Danach: $3 pro 1.000 Unternehmen

**Setup:**
1. Gehe zu https://outscraper.com
2. Klicke "Join Free Tier"
3. Registriere dich mit Email
4. Gehe zu Profile → API Keys
5. Kopiere den API Key

**Environment Variable:**
```bash
OUTSCRAPER_API_KEY=dein_api_key_hier
```

---

### 2. FLY.IO (Für Deployment - Optional)

**Was:** Hosting Platform

**Kosten:**
- Bis 3 Apps: **KOSTENLOS**
- Danach: ~$5/Monat pro App

**Setup:**
1. Gehe zu https://fly.io
2. Registriere dich
3. Installiere CLI:
   ```bash
   curl -L https://fly.io/install.sh | sh
   ```
4. Login:
   ```bash
   fly auth login
   ```

**Deployment:**
```bash
cd ~/projects/deal-daddy
fly apps create deal-daddy-api
fly secrets set OUTSCRAPER_API_KEY=dein_key
fly deploy
```

---

### 3. ZERO-BOUNCE (Optional - für Email Verification)

**Was:** Email Verifikation

**Kosten:**
- 100 Credits: **KOSTENLOS**
- Danach: Ab $16/Monat

**Setup:**
1. Gehe zu https://zerobounce.net
2. Registriere dich
3. Kopiere API Key aus Dashboard

**Environment Variable:**
```bash
ZEROBOUNCE_API_KEY=dein_key_hier
```

---

### 4. STRIPE (Für Payments - Später)

**Was:** Payment Processing

**Kosten:**
- Keine monatlichen Kosten
- 1.5% + €0.25 pro Transaktion (EU)

**Setup:**
1. Gehe zu https://stripe.com
2. Registriere Business Account
3. Aktiviere Test Mode zuerst
4. Kopiere Publishable & Secret Key

---

## 🚀 Schnellstart (5 Minuten)

### Option A: Lokal testen

```bash
# 1. Repository klonen
git clone https://github.com/persistentmemory2026-dev/deal-daddy.git
cd deal-daddy

# 2. Dependencies installieren
npm install

# 3. Environment setup
cp .env.example .env
# OUTSCRAPER_API_KEY eintragen

# 4. Build & Start
npm run build
npm start

# 5. Test
curl http://localhost:3000/health
```

### Option B: Auf Fly.io deployen

```bash
# 1. Fly.io CLI installieren
curl -L https://fly.io/install.sh | sh

# 2. Login
fly auth login

# 3. App erstellen
fly apps create deal-daddy-api

# 4. Secrets setzen
fly secrets set OUTSCRAPER_API_KEY=dein_outscraper_key

# 5. Deploy
fly deploy

# 6. Test
curl https://deal-daddy-api.fly.dev/health
```

---

## 📊 API Test Commands

```bash
# Health Check
curl http://localhost:3000/health

# Cost Estimate (10.000 Unternehmen)
curl "http://localhost:3000/api/cost/estimate?count=10000"

# Longlist generieren
curl -X POST http://localhost:3000/api/longlist/generate \
  -H "Content-Type: application/json" \
  -d '{
    "categories": ["Maschinenbau"],
    "cities": ["München", "Stuttgart"],
    "limit": 100
  }'
```

---

## 💰 Preisübersicht

### Deine Kosten (Pro 1.000 Unternehmen)
| Service | Kosten |
|---------|--------|
| Outscraper | $3.00 |
| ZeroBounce (optional) | ~$4.00 |
| Fly.io Hosting | ~$1.00 |
| **GESAMT** | **~$8.00** |

### Deine Preise (Empfohlen)
| Tier | Preis | Marge |
|------|-------|-------|
| Starter | €149 | ~75% |
| Professional | €399 | ~84% |
| Enterprise | €999 | ~87% |

---

## 🎯 Nächste Schritte

1. [ ] **Outscraper Account** erstellen (5 Min)
2. [ ] **API Key** kopieren & in `.env` eintragen
3. [ ] **Lokal testen** mit `npm start`
4. [ ] **Fly.io deployen** (optional)
5. [ ] **Pilotkunden** finden
6. [ ] **Landing Page** bauen
7. [ ] **Stripe** einrichten (später)

---

## 📞 Support

Bei Problemen:
1. Check die Logs: `npm start` oder `fly logs`
2. Outscraper Docs: https://outscraper.com/api-docs
3. GitHub Issues: https://github.com/persistentmemory2026-dev/deal-daddy/issues

---

**Bereit zu starten? 🚀**
1. Outscraper Account erstellen
2. API Key in `.env` eintragen
3. `npm start` ausführen
4. Profit!
