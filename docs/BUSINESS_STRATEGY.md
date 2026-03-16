# Deal Daddy - Business Strategy & Pricing

## Executive Summary

**Deal Daddy** ist ein automatisiertes M&A Longlist-Service für den DACH-Markt.

**Kernwertversprechen:** CSV mit Unternehmensnamen → Enriched Longlist mit Deal-Signalen in 24h

---

## Markt & Konkurrenz (DACH)

### Direkte Konkurrenz

| Anbieter | Preis | Limitationen |
|----------|-------|--------------|
| **Polsia Longlist** | 500-1.500€/Monat | Keine DACH-Spezialisierung |
| **ProxDeal** | 200-500€/Monat | Nur Basisdaten |
| **DealCircle** | Auf Anfrage | Enterprise-Fokus |
| **Manual Research** | 50-100€/Stunde | Nicht skalierbar |

### Indirekte Konkurrenz
- **LinkedIn Sales Navigator**: 80€/Monat (nur Kontakte, keine Unternehmensdaten)
- **Apollo.io**: 59-99€/Monat (US-Fokus, schlechte DACH-Abdeckung)
- **Hunter.io**: 49-99€/Monat (nur Email-Findung)

### Marktlücke
Kein Anbieter kombiniert:
1. DACH-spezifische Datenquellen
2. M&A-relevante Signale (CEO-Alter, Nachfolge-Indikatoren)
3. Automatisierte Bereicherung
4. Schnelle Lieferzeit (24h)
5. Bezahlbarer Einstiegspreis

---

## Technologie-Stack & Kosten

### Option A: Outscraper-basiert (EMPFEHLEN)

| Komponente | Kosten/1k Unternehmen | Anbieter |
|------------|----------------------|----------|
| Google Maps Scraping | $3 ($1 ab 100k) | Outscraper |
| Email Verification | $0.001/Email | ZeroBounce |
| Phone Enrichment | $0.01/Number | Numverify |
| Hosting | $20/Monat | Fly.io |
| **Gesamt/1k** | **~$5-8** | |

### Option B: Eigenbau (E2B + Lightpanda)

| Komponente | Kosten/Monat | Anmerkung |
|------------|-------------|-----------|
| E2B Sandboxes | $0-50 | Pay-as-you-go |
| Fly.io Hosting | $20 | Always-on |
| ZeroBounce | $16 | 2.000 Verifizierungen |
| Entwicklungszeit | ~$5.000 | Einmalig |
| **Gesamt** | **$36/Monat + $5.000 Setup** | |

### Empfehlung
**Outscraper-Option** für MVP - schneller, günstiger, bewährt.
Eigenbau später für Differenzierung.

---

## Preisgestaltung

### Kostenstruktur pro 1.000 Unternehmen

```
Outscraper Scraping:     $3.00
ZeroBounce (500 Emails): $4.00  (50% haben Emails)
Numverify (300 Phones):  $3.00  (30% haben Phones)
OpenAI API (Enrichment): $2.00  (GPT-4 für Analyse)
Hosting/Overhead:        $1.00
─────────────────────────────────
GESAMTKOSTEN:           $13.00/1.000 Unternehmen
```

### Pricing Tiers

#### Tier 1: STARTER (Einsteiger)
- **Preis**: 149€/Monat
- **Inklusive**: 1.000 Unternehmen/Monat
- **Zusätzlich**: 0.15€/Unternehmen
- **Features**: Basis-Enrichment, Email-Verification
- **Zielgruppe**: Einzelberater, kleine Boutiquen

#### Tier 2: PROFESSIONAL (Empfohlen)
- **Preis**: 399€/Monat
- **Inklusive**: 5.000 Unternehmen/Monat
- **Zusätzlich**: 0.12€/Unternehmen
- **Features**: Alles aus Starter + Deal-Signale, CEO-Alter, Priorisierung
- **Zielgruppe**: M&A-Boutiquen, Corporate Development

#### Tier 3: ENTERPRISE
- **Preis**: 999€/Monat
- **Inklusive**: 15.000 Unternehmen/Monat
- **Zusätzlich**: 0.08€/Unternehmen
- **Features**: Alles aus Professional + API-Zugriff, Custom Signals, Dedicated Support
- **Zielgruppe**: Große Beratungen, Family Offices

#### Tier 4: PAY-PER-USE
- **Preis**: 0.20€/Unternehmen (Mindestbestellung: 500)
- **Features**: Einmalige Listen, alle Enrichment-Features
- **Zielgruppe**: Gelegenheitsnutzer, Projekt-basiert

### Einmalige Setup-Gebühren
- **Onboarding**: 500€ (Einrichtung, Schulung)
- **Custom Integration**: 2.000-5.000€

---

## Marge & Rentabilität

### Beispielrechnung: Professional Tier

```
Einnahmen:              399€/Monat = ~$435
Kosten (5k Unternehmen): 65€ ($13 x 5)
────────────────────────────────────────
Bruttomarge:            334€/Monat (84%)
```

### Skalierungseffekte
- Ab 100k Unternehmen: Outscraper nur noch $1/1k
- API-Kosten sinken pro Einheit bei Volumen
- Hosting-Kosten marginal

---

## Go-to-Market Strategie

### Phase 1: Beta (Monat 1-2)
- 5 Pilotkunden aus Netzwerk
- Kostenlos gegen Feedback
- Case Studies sammeln

### Phase 2: Launch (Monat 3-4)
- Landing Page + Warteliste
- LinkedIn Content Marketing
- M&A-Newsletter Sponsoring

### Phase 3: Skalierung (Monat 5-12)
- Google Ads ("M&A leads Germany")
- Partnerschaften mit M&A-Netzwerken
- Affiliate-Programm (20% Provision)

### Zielgruppen-Keywords
- "Unternehmensverkauf leads"
- "M&A Deal Flow DACH"
- "Nachfolge Unternehmen finden"
- "M&A Longlist Service"

---

## Finanzielle Ziele (Jahr 1)

| Monat | Kunden | MRR | Kosten | Marge |
|-------|--------|-----|--------|-------|
| 3 | 5 | 2.000€ | 500€ | 1.500€ |
| 6 | 15 | 6.000€ | 1.500€ | 4.500€ |
| 9 | 30 | 12.000€ | 3.000€ | 9.000€ |
| 12 | 50 | 20.000€ | 5.000€ | 15.000€ |

**Break-even**: Monat 4
**Profitabilität**: Ab Monat 6

---

## Risiken & Mitigation

| Risiko | Wahrscheinlichkeit | Impact | Mitigation |
|--------|-------------------|--------|------------|
| Outscraper ändert Preise | Mittel | Hoch | Eigenbau-Option halten |
| Konkurrenz kopiert | Hoch | Mittel | DACH-Fokus, Kundenbeziehungen |
| Datenqualität issues | Mittel | Hoch | QA-Prozesse, Garantien |
| Markt zu klein | Niedrig | Hoch | Expansion EU-weit |

---

## Nächste Schritte

1. ✅ Business Model validieren (dieses Dokument)
2. ✅ MVP bauen (in Arbeit)
3. 🔄 Pilotkunden akquirieren
4. ⏳ Pricing testen (A/B-Tests)
5. ⏳ Skalierungs-Infrastruktur bauen

---

*Erstellt: März 2026*
*Strategie: High-Margin, Nischen-Fokus, schneller Time-to-Value*
