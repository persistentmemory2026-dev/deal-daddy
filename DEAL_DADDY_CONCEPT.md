# Deal Daddy - M&A Longlist Automation Service
## Automated Deal Sourcing for M&A Professionals

---

## Vision

**Ein schlanker, automatisierter Service:**
- Nutzer schickt Longlist (CSV/Firmennamen)
- Erhält nach 24h recherchierte Daten + verifizierte Emails
- Vollständig automatisiert durch Agent Hermes

---

## Recherche-Ergebnisse (NIA)

### Konkurrenz-Analyse

| Service | Funktion | Preis | Lücke für Deal Daddy |
|---------|----------|-------|---------------------|
| **ProxDeal** | AI Longlist Generation | €€€ | Keine E2B-Integration |
| **Longlist (Polsia)** | AI Deal Sourcing | €€ | Limitiert auf SME |
| **Hunter.io** | Email Verification | €/Verifizierung | Keine M&A-spezifische Logik |

**Marktlücke:** Keiner kombiniert E2B-Sandboxes + Lightpanda + Agent-Orchestrierung für M&A-Workflows.

---

## Optimaler Tech-Stack (recherchiert)

### Backend & Orchestrierung
| Komponente | Vorschlag | Alternative | Empfehlung |
|------------|-----------|-------------|------------|
| **Runtime** | Node.js + TypeScript | Python + FastAPI | **Node.js** (besser für Puppeteer/Playwright) |
| **Orchestrierung** | Agent Hermes | n8n + Custom | **Agent Hermes** (nativ) |
| **Queue** | BullMQ (Redis) | RabbitMQ | **BullMQ** (Node.js native) |
| **Scheduler** | node-cron | node-schedule | **node-cron** (einfacher) |

### Scraping & Research
| Komponente | Vorschlag | Warum |
|------------|-----------|-------|
| **Primary** | **Lightpanda** | 11x schneller, 9x weniger RAM |
| **Fallback** | Puppeteer (E2B) | Für komplexe Sites |
| **Data Extraction** | Playwright (E2B Sandbox) | Isoliert, skalierbar |
| **Research** | Firecrawl API | Structured data extraction |

### Email Verification
| Service | Preis/1000 | Accuracy | Empfehlung |
|---------|-----------|----------|------------|
| **Hunter.io** | $49 | 95% | Gute API, teuer |
| **ZeroBounce** | $16 | 98% | **Bestes Preis/Leistung** |
| **NeverBounce** | $8 | 97% | Budget-Option |
| **Apollo.io** | $59 | 96% | Inkl. Enrichment |

**Empfehlung:** ZeroBounce für Verifizierung + Apollo.io für Enrichment (Kombi)

### Datenbank & Storage
| Komponente | Zweck |
|------------|-------|
| **PostgreSQL** | Hauptdatenbank (Longlists, Jobs, Kunden) |
| **Redis** | Queue + Cache + Session |
| **S3/MinIO** | Uploaded CSVs, Reports |

### Deployment
| Option | Kosten | Skalierung | Empfehlung |
|--------|--------|------------|------------|
| **Fly.io** | $5-20/Monat | Einfach | **Für MVP** |
| **Railway** | $5-50/Monat | Automatisch | Alternative |
| **Hetzner Cloud** | €5-20/Monat | Manuelle | Kostengünstig |
| **Netlify** | $19/Monat | Limitiert | Nur Frontend |

**Empfehlung:** Fly.io (kein Cold Start, gute E2B-Integration)

---

## Architektur

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Customer      │────▶│  Upload Portal   │────▶│  Queue (BullMQ) │
│  (CSV Upload)   │     │  (Next.js)       │     │                 │
└─────────────────┘     └──────────────────┘     └────────┬────────┘
                                                          │
                    ┌─────────────────────────────────────┼──────────────────────┐
                    │                                     │                      │
                    ▼                                     ▼                      ▼
           ┌─────────────────┐                ┌──────────────────┐   ┌──────────────────┐
           │  Agent Hermes   │                │   E2B Sandbox    │   │  Lightpanda      │
           │  (Orchestrator) │◀──────────────▶│  (Puppeteer/     │   │  (Fast Scraping) │
           │                 │                │   Playwright)    │   │                  │
           └────────┬────────┘                └──────────────────┘   └──────────────────┘
                    │
                    ▼
           ┌─────────────────┐                ┌──────────────────┐
           │  ZeroBounce     │                │   Apollo.io      │
           │  (Verification) │                │   (Enrichment)   │
           └────────┬────────┘                └──────────────────┘
                    │
                    ▼
           ┌─────────────────┐
           │  PostgreSQL     │
           │  (Results)      │
           └────────┬────────┘
                    │
                    ▼
           ┌─────────────────┐
           │  AgentMail      │
           │  (Notification) │
           └─────────────────┘
```

---

## Workflow (24h Turnaround)

### Stunde 0: Upload
1. Kunde lädt CSV hoch (Firmennamen, Websites)
2. System validiert CSV-Struktur
3. Job wird in Queue gestellt
4. Bestätigungs-Email an Kunden

### Stunde 1-6: Research Phase
1. Agent Hermes startet E2B-Sandbox
2. Für jede Firma:
   - Lightpanda: Schnelles Website-Scraping
   - Puppeteer (falls nötig): LinkedIn, XING
   - Daten extrahieren: Umsatz, Mitarbeiter, CEO
3. Zwischenspeichern in Redis

### Stunde 7-12: Verification Phase
1. ZeroBounce API: Email-Verification
2. Apollo.io: Kontakt-Enrichment
3. Signal-Scoring: M&A-Relevanz berechnen

### Stunde 13-20: Quality Check
1. Automatisierte Plausibilitätsprüfung
2. Flagging dubioser Einträge
3. Manuelle Review-Queue (optional)

### Stunde 21-24: Delivery
1. CSV-Report generieren
2. Download-Link per Email (AgentMail)
3. Rechnung (Stripe/PayPal)

---

## Datenstruktur (Input/Output)

### Input CSV (vom Kunden)
```csv
company_name,website,industry,notes
"Muster GmbH",https://muster.de,Maschinenbau,"Familienunternehmen"
"Beispiel AG",https://beispiel.de,Elektrotechnik,"IPO 2020"
```

### Output CSV (nach 24h)
```csv
company_name,website,industry,revenue_estimated,employees,ceo_name,ceo_email,email_verified,phone,linkedin,signal_score,notes
"Muster GmbH",https://muster.de,Maschinenbau,15M€,120,"Max Mustermann",max@muster.de,valid,+49...,linkedin.com/in/maxmustermann,85,"CEO 67, keine Nachfolge"
```

---

## MVP vs. Full Product

### MVP (Woche 1-2)
- [ ] CSV Upload (simple)
- [ ] Lightpanda Scraping
- [ ] ZeroBounce Integration
- [ ] AgentMail Notifications
- [ ] Manual Review (du)

### Full Product (Monat 2-3)
- [ ] Customer Portal (Next.js)
- [ ] Stripe Integration
- [ ] E2B Auto-Scaling
- [ ] Apollo.io Enrichment
- [ ] Analytics Dashboard
- [ ] API für Enterprise

---

## Kosten-Schätzung (MVP)

| Komponente | Monatlich |
|------------|-----------|
| Fly.io Hosting | $10 |
| E2B Sandboxes | $20 (pay-per-use) |
| ZeroBounce API | $16 (1.000 Verifizierungen) |
| Lightpanda | $0 (self-hosted) |
| PostgreSQL (Neon) | $0 (free tier) |
| Redis (Upstash) | $0 (free tier) |
| **Gesamt** | **~$46/Monat** |

---

## Nächste Schritte

1. **Tech-Stack finalisieren** (diese Woche)
2. **MVP bauen** (Woche 1-2)
3. **Test mit 10 Kunden** (Woche 3)
4. **Iterate & Scale** (Monat 2+)

---

**Soll ich mit dem MVP-Bau starten?**
