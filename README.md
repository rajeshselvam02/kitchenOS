# kitchenOS

Digital Operating System for Cloud Kitchens

## Architecture

```
services/
├── ingestion/       # Order ingestion from aggregators (Swiggy, Zomato)
├── kds/            # Kitchen Display System (WebSocket-based)
├── inventory/      # Real-time inventory tracking + BOM deduction
├── bom/            # Recipe/Bill of Materials management
└── analytics/      # P&L calculation + demand forecasting

packages/
├── shared/         # Shared utilities, configs
├── types/          # TypeScript type definitions
└── db/             # Database schemas, migrations, seed data
```

## Tech Stack

- **Backend**: Node.js + TypeScript
- **Database**: PostgreSQL + TimescaleDB
- **Event Bus**: Redis Streams
- **Real-time**: WebSockets (Socket.io)
- **API**: Fastify (high-performance alternative to Express)

## Quick Start

```bash
# Install dependencies
npm install

# Run all services in dev mode
npm run dev
```

## MVP Focus

**The KDS-to-Inventory Loop**

1. Order arrives → Ingestion Service normalizes & emits event
2. KDS Service displays order → Chef marks "Ready"
3. Inventory Service deducts ingredients based on BOM
4. Audit log created (GST compliance)
5. Alert owner on discrepancies

## Development

Each service is independent and can be run standalone:

```bash
cd services/inventory
npm run dev
```

## Database Setup

```bash
# Create database
createdb kitchenos_dev

# Run migrations
npm run migrate

# Seed data
npm run seed
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

```
DATABASE_URL=postgresql://localhost/kitchenos_dev
REDIS_URL=redis://localhost:6379
SWIGGY_WEBHOOK_SECRET=your-secret
ZOMATO_WEBHOOK_SECRET=your-secret
```
