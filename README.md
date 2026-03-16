# Deal Daddy 🎯

**Automated M&A Longlist Service for DACH Region**

Transform CSV files into enriched deal targets with AI-powered signals.

## Features

- 🔍 **Google Maps Scraping**: 500 free businesses/month, then $3/1k
- 📊 **M&A Signal Detection**: Deal readiness scoring, succession indicators
- 🏢 **DACH Specialization**: Germany, Austria, Switzerland focus
- 📈 **Revenue Estimation**: Automated company size inference
- 📧 **Contact Enrichment**: Email, phone, website discovery
- 🎯 **Prioritization**: Hot/warm/cold/nurture classification

## Quick Start

```bash
# Install
npm install

# Configure
cp .env.example .env
# Edit .env with your OUTSCRAPER_API_KEY

# Build
npm run build

# Run
npm start
```

## API Endpoints

### Generate Longlist
```bash
curl -X POST http://localhost:3000/api/longlist/generate \
  -H "Content-Type: application/json" \
  -d '{
    "categories": ["Maschinenbau"],
    "cities": ["München", "Stuttgart"],
    "limit": 100
  }'
```

### Upload CSV
```bash
curl -X POST http://localhost:3000/api/longlist/upload \
  -F "file=@companies.csv"
```

### Cost Estimate
```bash
curl "http://localhost:3000/api/cost/estimate?count=5000"
```

## Pricing

| Tier | Price | Included |
|------|-------|----------|
| Starter | €149/mo | 1,000 companies |
| Professional | €399/mo | 5,000 companies |
| Enterprise | €999/mo | 15,000 companies |
| Pay-per-use | €0.20/company | Min. 500 |

## Tech Stack

- **Runtime**: Node.js 20 + TypeScript
- **Scraping**: Outscraper API
- **Enrichment**: Custom M&A algorithms
- **Export**: CSV/JSON
- **Deployment**: Fly.io

## Documentation

- [Business Strategy](docs/BUSINESS_STRATEGY.md)
- [Setup Guide](docs/ORCHESTRATION_SETUP.md)

## License

MIT
