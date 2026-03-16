# Deal Daddy - Orchestration Setup Guide

## Quick Start (5 Minuten)

### 1. Voraussetzungen

```bash
# Node.js 20+
node --version

# API Keys benötigt:
# - OUTSCRAPER_API_KEY (von outscraper.com)
# - Optional: ZEROBOUNCE_API_KEY (für Email-Verification)
```

### 2. Installation

```bash
# Repository klonen
git clone <repo-url> deal-daddy
cd deal-daddy

# Dependencies installieren
npm install

# Environment konfigurieren
cp .env.example .env
# .env editieren und API Keys eintragen
```

### 3. Environment Variables

```env
# Required
OUTSCRAPER_API_KEY=your_outscraper_api_key

# Optional - für erweiterte Features
ZEROBOUNCE_API_KEY=your_zerobounce_key
OPENAI_API_KEY=your_openai_key

# Server
PORT=3000
NODE_ENV=production

# Logging
LOG_LEVEL=info
```

### 4. Build & Start

```bash
# TypeScript kompilieren
npm run build

# Server starten
npm start

# Oder im Development Mode
npm run dev
```

### 5. Test

```bash
# Health Check
curl http://localhost:3000/health

# Cost Estimate
curl "http://localhost:3000/api/cost/estimate?count=1000"
```

---

## Deployment

### Option A: Fly.io (Empfohlen)

```bash
# Fly.io CLI installieren
curl -L https://fly.io/install.sh | sh

# App erstellen
fly apps create deal-daddy-api

# Secrets setzen
fly secrets set OUTSCRAPER_API_KEY=xxx

# Deploy
fly deploy
```

### Option B: Docker

```dockerfile
# Dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

```bash
docker build -t deal-daddy .
docker run -p 3000:3000 --env-file .env deal-daddy
```

---

## API Usage

### 1. Longlist von Suchkriterien

```bash
curl -X POST http://localhost:3000/api/longlist/generate \
  -H "Content-Type: application/json" \
  -d '{
    "categories": ["Maschinenbau"],
    "cities": ["München", "Stuttgart", "Nürnberg"],
    "limit": 50,
    "format": "csv"
  }'
```

### 2. Longlist von CSV Upload

```bash
curl -X POST http://localhost:3000/api/longlist/upload \
  -F "file=@companies.csv" \
  -F "format=csv"
```

**CSV Format:**
```csv
name,location
Firma ABC,München
Firma XYZ,Stuttgart
```

### 3. Response

Die API gibt eine CSV/JSON Datei zurück mit:

| Spalte | Beschreibung |
|--------|--------------|
| Unternehmen | Firmenname |
| Branche | Kategorie |
| Website | Webseite |
| Land | D/A/CH |
| Stadt | Ort |
| Umsatz_Min/Max | Geschätzter Umsatz |
| Mitarbeiter | Geschätzte MA-Zahl |
| Deal_Score | 0-100 Punkte |
| Empfehlung | hot/warm/cold/nurture |
| Naechste_Aktion | Handlungsempfehlung |
| Zusammenfassung | AI-generierte Summary |

---

## Monitoring

### Logs

```bash
# Local
npm run dev

# Fly.io
fly logs

# Docker
docker logs deal-daddy
```

### Health Checks

```bash
# Server Status
curl http://localhost:3000/health

# Account Balance
curl http://localhost:3000/api/stats
```

---

## Troubleshooting

### Problem: "No companies found"

- Überprüfe die Suchkriterien (Kategorien/Städte)
- Probiere englische Kategorien: "manufacturing" statt "Maschinenbau"
- Erhöhe den Limit-Parameter

### Problem: "API rate limit exceeded"

- Outscraper hat generöse Limits, aber:
- Reduziere parallele Requests
- Implementiere Retry-Logic

### Problem: "High costs"

- Nutze den Free Tier (500 Unternehmen/Monat)
- Optimiere Suchanfragen (weniger Overlap)
- Batch-Verarbeitung nutzen

---

## Scaling

### Horizontal Scaling

```bash
# Multiple instances
fly scale count 3

# Load balancing
fly regions add fra
fly regions add ams
```

### Queue-basierte Verarbeitung

Für große Listen (>10.000 Unternehmen):

```typescript
// Async processing
const taskId = await outscraper.startAsyncScraping(
  queries,
  limit,
  'https://your-webhook.com/callback'
);

// Poll for completion
const result = await outscraper.waitForTask(taskId);
```

---

## Security

### API Key Protection

- Niemals Keys im Code committen
- `.env` in `.gitignore` aufnehmen
- Keys rotieren alle 90 Tage

### Rate Limiting

```typescript
// Express Rate Limit
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

---

## Next Steps

1. ✅ MVP deployed
2. 🔄 Landing Page bauen
3. 🔄 Stripe Integration
4. 🔄 Customer Dashboard
5. 🔄 API-Dokumentation (Swagger)

---

*Setup completed successfully! 🚀*
