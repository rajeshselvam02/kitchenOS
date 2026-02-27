# kitchenOS - TODO

## 🔥 Immediate (This Week)

- [ ] Test the full MVP flow locally
  - [ ] Install dependencies
  - [ ] Setup PostgreSQL + TimescaleDB
  - [ ] Run migrations & seed
  - [ ] Start all services
  - [ ] Run `./test-flow.sh`
  
- [ ] Build simple KDS UI
  - [ ] React app with Vite
  - [ ] WebSocket connection to KDS service
  - [ ] Display orders in real-time
  - [ ] "Mark Cooking" and "Mark Ready" buttons
  - [ ] Color coding: Green (new), Yellow (cooking), Red (late)

## 📅 Next Week

- [ ] Admin Dashboard (v1)
  - [ ] Inventory list view
  - [ ] Stock adjustment form
  - [ ] Transaction history
  - [ ] Basic P&L calculation

- [ ] Improve test coverage
  - [ ] Unit tests for inventory deduction logic
  - [ ] Integration tests for event flow
  - [ ] Mock aggregator webhooks

## 🚀 Phase 2 (Weeks 5-6)

- [ ] Visual KDS improvements
  - [ ] Icon library for common dishes
  - [ ] Timer display (time since order)
  - [ ] Priority queue (late orders first)
  - [ ] Sound alerts for new orders

- [ ] P&L Dashboard
  - [ ] Revenue by aggregator
  - [ ] Ingredient cost calculation
  - [ ] Commission deduction (Swiggy/Zomato %)
  - [ ] Net profit per dish
  - [ ] Daily/weekly/monthly views

- [ ] Notifications
  - [ ] Low stock push notifications
  - [ ] Email alerts to owner
  - [ ] SMS integration (optional)

## 🧠 Phase 3 (Weeks 7-8)

- [ ] Analytics Engine
  - [ ] Historical sales charts
  - [ ] Ingredient usage trends
  - [ ] Peak hour analysis
  - [ ] Dish popularity ranking

- [ ] Demand Forecasting (Basic)
  - [ ] Rule-based: "Last 4 Saturdays averaged X orders"
  - [ ] Weather API integration
  - [ ] Local event calendar (IPL matches, holidays)
  - [ ] Prep recommendations

## 🌐 Phase 4 (Production Ready)

- [ ] Real Aggregator Integration
  - [ ] Swiggy webhook verification
  - [ ] Zomato API integration
  - [ ] UrbanPiper compatibility (optional)
  - [ ] Order status sync back to aggregators

- [ ] Authentication & Security
  - [ ] JWT-based auth
  - [ ] Role-based access control (Owner, Chef, Staff)
  - [ ] Password hashing (bcrypt)
  - [ ] API rate limiting

- [ ] Multi-location Support
  - [ ] Location/branch management
  - [ ] Per-location inventory
  - [ ] Consolidated multi-location dashboard

- [ ] Deployment
  - [ ] Docker containers
  - [ ] Docker Compose for local dev
  - [ ] Kubernetes manifests (production)
  - [ ] CI/CD pipeline (GitHub Actions)
  - [ ] Monitoring (Prometheus + Grafana)

## 🐛 Known Issues / Tech Debt

- [ ] Error handling needs improvement (especially in event handlers)
- [ ] Add retry logic for Redis publish/subscribe
- [ ] Database connection pooling optimization
- [ ] Add request validation (use Zod or similar)
- [ ] Improve logging (structured logs with context)
- [ ] Add health checks for all services
- [ ] Database indices need review (performance optimization)

## 💡 Ideas / Future Features

- [ ] Mobile app for kitchen staff (React Native)
- [ ] Voice commands for marking orders ready
- [ ] QR code order tracking for delivery partners
- [ ] Customer feedback integration
- [ ] Ingredient supplier integration (auto-ordering)
- [ ] Recipe cost optimizer (suggest cheaper alternatives)
- [ ] Waste tracking with photo uploads
- [ ] Staff performance metrics
- [ ] Multi-language support for UI
- [ ] Offline mode (PWA with service workers)

## 📚 Documentation Needed

- [ ] API documentation (Swagger/OpenAPI)
- [ ] Deployment guide
- [ ] Contributing guidelines
- [ ] Architecture diagrams (draw.io or Mermaid)
- [ ] Database schema ERD
- [ ] Event flow diagrams

---

**Last Updated:** 2025-01-19
