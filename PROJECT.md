# kitchenOS - Project Overview

## Mission

Build a next-generation cloud kitchen operating system that solves the "invisible gaps" in existing POS/aggregator management platforms.

## Core Problem

Current solutions (Petpooja, UrbanPiper, LimeTray) treat cloud kitchens like regular restaurants. They miss critical operational nuances:

1. **Tablet Hell**: 30-60 second sync lag, multiple tablets cluttering counters
2. **Invisible Inventory Leakage**: Manual tracking, no real-time wastage detection
3. **Data Silos**: Owners have to check 3+ platforms to understand true P&L
4. **Complex UIs**: Text-heavy interfaces that require tech-savvy staff
5. **Audit Gaps**: Lack of tamper-proof logs (GST compliance risks)
6. **Reactive vs Predictive**: No forecasting, only historical data

## Our Solution

### The KDS-to-Inventory Loop (MVP Core)

**Real-time BOM-based inventory deduction**

```
Order Ready → Recipe Lookup → Ingredient Deduction → Audit Log → Low Stock Alert
```

**Key Metrics:**
- Sync Speed: < 2 seconds (vs 30-60s)
- Inventory Accuracy: Real-time (vs end-of-day)
- Wastage Detection: Instant (vs weekly/monthly)

### Differentiators

| Feature | Legacy | kitchenOS |
|---------|--------|-----------|
| Sync | High Lag | < 2 seconds |
| Inventory | Manual/Monthly | Real-time/Automated |
| UX | Text-heavy | Icon-based/Visual |
| Insights | "What happened?" | "What will happen?" |
| Compliance | Manual logs | Tamper-proof audit |

## Architecture

**Microservices + Event-Driven**

```
Ingestion → Event Bus → [KDS, Inventory, Analytics]
```

**Tech Stack:**
- Backend: Node.js + TypeScript
- Database: PostgreSQL + TimescaleDB
- Event Bus: Redis Streams
- Real-time: WebSockets
- API: Fastify

## Current Status (v0.1.0)

### ✅ Completed

- [x] Architecture design
- [x] Database schema (PostgreSQL + TimescaleDB)
- [x] Type definitions (@kitchenos/types)
- [x] Database utilities (@kitchenos/db)
- [x] Ingestion Service (webhook endpoints + test order creation)
- [x] KDS Service (order display, status updates, WebSocket support)
- [x] Inventory Service (BOM-based deduction, low stock alerts)
- [x] Event-driven communication (Redis Streams)
- [x] Audit logging (inventory_transactions)
- [x] Test script (end-to-end flow validation)

### 🚧 In Progress

- [ ] KDS UI (React/Vue with WebSocket connection)
- [ ] Admin Dashboard (P&L, inventory management)

### 📋 Backlog

**Phase 2: Operator UX (Weeks 5-6)**
- [ ] Visual KDS with color-coding (Green/Yellow/Red)
- [ ] Push notifications for low stock
- [ ] Basic P&L dashboard
- [ ] Aggregator commission calculation

**Phase 3: Intelligence (Weeks 7-8)**
- [ ] Historical sales analytics
- [ ] Demand forecasting (rule-based)
- [ ] Event integration (IPL, weather, holidays)

**Phase 4: Production (Weeks 9-12)**
- [ ] Real Swiggy/Zomato webhook integration
- [ ] Authentication & authorization (JWT + RBAC)
- [ ] Multi-location support
- [ ] Mobile-responsive UI
- [ ] Deployment (Docker + Kubernetes)

## Development Workflow

### Project Structure

```
kitchenOS/
├── packages/
│   ├── types/          # Shared TypeScript types
│   ├── db/             # Database schema, migrations
│   └── shared/         # Utilities, configs
├── services/
│   ├── ingestion/      # Order ingestion
│   ├── kds/            # Kitchen Display
│   ├── inventory/      # Inventory management
│   ├── bom/            # Recipe/BOM (future)
│   └── analytics/      # P&L engine (future)
└── apps/               # Frontend apps (future)
    ├── kds-ui/
    └── admin/
```

### Running Locally

```bash
# Setup
npm install
npm run build --workspaces

# Database
createdb kitchenos_dev
cd packages/db && npm run migrate && npm run seed

# Run services
cd services/ingestion && npm run dev
cd services/kds && npm run dev
cd services/inventory && npm run dev

# Test
./test-flow.sh
```

## Next Steps (Priority Order)

1. **KDS UI** - Simple React app with WebSocket
2. **Admin Dashboard** - Inventory view, basic P&L
3. **Real aggregator integration** - Start with Swiggy
4. **Visual improvements** - Color coding, icons
5. **Demand forecasting** - Basic rule-based to start

## Target Market

**Bangalore Cloud Kitchens (2025-2026)**

- Initial: Single-location cloud kitchens (5-15 staff)
- Future: Multi-brand cloud kitchens, dark kitchens
- Revenue model: SaaS subscription (₹5k-15k/month depending on order volume)

## Success Metrics

**MVP (3 months):**
- 1 pilot cloud kitchen onboarded
- 95%+ uptime
- < 2 second order-to-KDS latency
- Zero inventory discrepancies (vs previous system)

**Phase 2 (6 months):**
- 5 paying customers
- Predictive forecasting accuracy > 70%
- 30% reduction in food wastage for customers

## Team

- **risi** - Founder, architect
- **Jeeni** - AI dev assistant (that's me 🧬)

---

Built with ❤️ in Bangalore
