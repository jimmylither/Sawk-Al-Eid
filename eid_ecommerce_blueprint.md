# E‑Commerce Platform Blueprint — Eid al‑Adha Ram Sales (Morocco)

## 1) Detailed User Journey (Selection → Sacrifice)

### A. Discovery & Trust Building
1. **Landing (Mobile-first, Darija/French toggle):**
   - Hero banner with Eid countdown, featured Sardi/Barki rams, and CTA: `تفرّج على الحولي / Voir les moutons`.
   - City selector (Casablanca, Rabat, Marrakech, etc.) to pre-filter delivery eligibility.
2. **Trust-first messaging:**
   - ONSSA compliance badge, farm story, customer reviews, and visible WhatsApp “Live Video” button.
3. **Quick filters visible above fold:**
   - Breed: Sardi, Barki, Timahdite.
   - Weight range (kg), age class (e.g., Sennane/Jad3), price range.

### B. Browsing the “Sawk” Catalog
4. **Card-based catalog:**
   - Each animal card shows: name/tag ID, breed, current weight, age class, total price (MAD), and MAD/kg.
   - Badges: `ONSSA`, `Disponible`, `Réservation possible`.
5. **Animal detail page:**
   - Photo gallery + short video + optional live video booking slot.
   - Weight history chart (e.g., last 8 weeks) for transparency.
   - Health certificate summary and vaccination/treatment timeline.

### C. Cart & Services Configuration
6. **Base purchase options:**
   - Full payment or deposit reservation (e.g., 20–30%).
   - Payment methods: COD, bank transfer, Wafacash/CashPlus voucher reference.
7. **Add-on services:**
   - `Keep at Farm`: daily or flat fee until Eid eve.
   - Professional slaughtering + prepared meat home delivery.
8. **Delivery scheduler:**
   - Choose date and 2–4 hour delivery window (dynamic by city/zone capacity).

### D. Checkout & Confirmation
9. **Identity and address capture:**
   - Name, phone (OTP verification), neighborhood, geolocation pin, preferred language.
10. **Zone validation + fee calculation:**
   - Real-time geofence check (in-zone/out-of-zone) with delivery fee and earliest slot.
11. **Order confirmation:**
   - Invoice + order ID + animal unique tag.
   - WhatsApp and SMS confirmation with tracking link.

### E. Post-Purchase Tracking
12. **Order dashboard:**
   - Status timeline: `Reserved` → `At Farm` → `Prepared for Delivery` → `Delivered`.
   - If “Keep at Farm” enabled, customer sees updated weight snapshots.
13. **Pre-Eid reminders:**
   - Automated reminders for pending balance and delivery appointment.
14. **Sacrifice phase options:**
   - For slaughtering add-on: butcher assignment, ETA, and post-service completion confirmation.

---

## 2) Database Schema (Animals, Orders, Deliveries)

> Suggested relational model with PostgreSQL + PostGIS.

### Core Tables

#### `animals`
- `id` (UUID, PK)
- `tag_code` (VARCHAR, UNIQUE, indexed) — physical ear/RFID tag
- `breed` (ENUM: `sardi`, `barki`, `timahdite`)
- `sex` (ENUM)
- `birth_date` (DATE, nullable if estimated)
- `age_class` (ENUM: `sennane`, `jad3`, `theni`, etc.)
- `current_weight_kg` (NUMERIC(6,2))
- `price_mad` (NUMERIC(10,2))
- `price_per_kg_mad` (generated column)
- `status` (ENUM: `available`, `reserved`, `sold`, `with_customer`, `slaughter_scheduled`)
- `farm_id` (FK → `farms.id`)
- `created_at`, `updated_at`

#### `animal_media`
- `id` (UUID, PK)
- `animal_id` (FK → `animals.id`, indexed)
- `media_type` (ENUM: `image`, `video`)
- `url` (TEXT)
- `sort_order` (INT)
- `is_primary` (BOOLEAN)
- `created_at`

#### `animal_weight_logs`
- `id` (UUID, PK)
- `animal_id` (FK → `animals.id`, indexed)
- `measured_at` (TIMESTAMP)
- `weight_kg` (NUMERIC(6,2))
- `measured_by_user_id` (FK → `users.id`)
- `notes` (TEXT)

#### `animal_health_records`
- `id` (UUID, PK)
- `animal_id` (FK → `animals.id`, indexed)
- `certificate_type` (ENUM: `onssa`, `vaccine`, `treatment`, `inspection`)
- `certificate_number` (VARCHAR)
- `issued_at` (DATE)
- `expires_at` (DATE, nullable)
- `document_url` (TEXT)
- `verified_by` (FK → `users.id`)

#### `customers`
- `id` (UUID, PK)
- `full_name` (VARCHAR)
- `phone` (VARCHAR, UNIQUE)
- `phone_verified_at` (TIMESTAMP)
- `preferred_language` (ENUM: `darija_ar`, `darija_latn`, `fr`)
- `created_at`, `updated_at`

#### `addresses`
- `id` (UUID, PK)
- `customer_id` (FK → `customers.id`, indexed)
- `label` (VARCHAR)
- `city` (VARCHAR, indexed)
- `district` (VARCHAR)
- `street_text` (TEXT)
- `location` (GEOGRAPHY(Point, 4326))
- `delivery_zone_id` (FK → `delivery_zones.id`)
- `is_default` (BOOLEAN)

#### `orders`
- `id` (UUID, PK)
- `order_number` (VARCHAR, UNIQUE)
- `customer_id` (FK → `customers.id`, indexed)
- `animal_id` (FK → `animals.id`, UNIQUE to prevent double-sell)
- `address_id` (FK → `addresses.id`)
- `order_status` (ENUM: `pending_payment`, `reserved`, `confirmed`, `ready_delivery`, `delivered`, `cancelled`, `refunded`)
- `subtotal_mad` (NUMERIC)
- `addons_total_mad` (NUMERIC)
- `delivery_fee_mad` (NUMERIC)
- `total_mad` (NUMERIC)
- `currency` (CHAR(3), default `MAD`)
- `created_at`, `updated_at`

#### `order_addons`
- `id` (UUID, PK)
- `order_id` (FK → `orders.id`, indexed)
- `addon_type` (ENUM: `keep_at_farm`, `slaughtering`)
- `pricing_model` (ENUM: `flat`, `per_day`)
- `unit_price_mad` (NUMERIC)
- `quantity` (INT)
- `line_total_mad` (NUMERIC)

#### `payments`
- `id` (UUID, PK)
- `order_id` (FK → `orders.id`, indexed)
- `payment_method` (ENUM: `cod`, `bank_transfer`, `wafacash`, `cashplus`)
- `payment_type` (ENUM: `deposit`, `full`, `balance`)
- `amount_mad` (NUMERIC)
- `status` (ENUM: `initiated`, `pending_validation`, `confirmed`, `failed`, `refunded`)
- `provider_reference` (VARCHAR)
- `proof_url` (TEXT, nullable)
- `received_at` (TIMESTAMP, nullable)

#### `delivery_zones`
- `id` (UUID, PK)
- `city` (VARCHAR)
- `zone_name` (VARCHAR)
- `polygon` (GEOGRAPHY(Polygon, 4326))
- `base_fee_mad` (NUMERIC)
- `active` (BOOLEAN)

#### `delivery_slots`
- `id` (UUID, PK)
- `zone_id` (FK → `delivery_zones.id`, indexed)
- `slot_start` (TIMESTAMP)
- `slot_end` (TIMESTAMP)
- `capacity` (INT)
- `reserved_count` (INT)
- `status` (ENUM: `open`, `full`, `blocked`)

#### `deliveries`
- `id` (UUID, PK)
- `order_id` (FK → `orders.id`, UNIQUE)
- `slot_id` (FK → `delivery_slots.id`)
- `delivery_status` (ENUM: `scheduled`, `dispatching`, `in_transit`, `completed`, `failed`)
- `driver_id` (FK → `users.id`, nullable)
- `vehicle_id` (FK → `vehicles.id`, nullable)
- `proof_of_delivery_url` (TEXT)
- `delivered_at` (TIMESTAMP, nullable)

### Key Constraints
- Prevent double booking via unique `orders.animal_id` for active orders.
- Transactional lock on animal row during checkout.
- Slot capacity enforced with atomic counter updates.

---

## 3) Recommended Tech Stack (High-Concurrency & Mobile-First)

### Frontend
- **Framework:** Next.js (React) with App Router.
- **Rendering strategy:** ISR/SSR mix:
  - ISR for catalog pages (fast + cacheable).
  - SSR for personalized checkout/tracking.
- **UI:** Tailwind CSS + component system optimized for low-end Android devices.
- **i18n:** Built-in localization for Darija/French, RTL-aware styling for Arabic script.

### Backend & APIs
- **API layer:** Node.js (NestJS or Fastify) with REST + selective GraphQL for back-office.
- **Primary DB:** PostgreSQL + PostGIS.
- **Cache:** Redis (catalog cache, slot availability, rate limiting, OTP sessions).
- **Queue/Event bus:** RabbitMQ or Kafka for asynchronous workflows:
  - payment reconciliation,
  - WhatsApp/SMS notifications,
  - image/video processing,
  - delivery dispatch optimization.

### Media & CDN
- **Object storage:** S3-compatible (AWS S3 / Cloudflare R2 / MinIO).
- **CDN:** CloudFront or Cloudflare with aggressive image caching and adaptive formats (WebP/AVIF).
- **Video:** HLS transcoding for variable mobile bandwidth.

### Infrastructure & Scaling
- **Container orchestration:** Kubernetes (or ECS/Fargate for lower ops overhead).
- **Autoscaling signals:** CPU, memory, request latency, queue depth.
- **Traffic handling:**
  - WAF + bot mitigation,
  - API rate limiting,
  - edge caching,
  - blue/green deploys before Eid peak.
- **Observability:** OpenTelemetry + Prometheus + Grafana + centralized logs (ELK/Loki).

### Integrations
- **Messaging:** WhatsApp Business API + SMS fallback.
- **Payments:** abstraction layer for COD, bank transfer confirmation, and Wafacash/CashPlus references.
- **Maps/Geofencing:** Google Maps Platform or Mapbox + PostGIS polygon checks.

---

## 4) Security Protocol for Customer Deposits

### A. Deposit Lifecycle Controls
1. **Deposit intent creation:**
   - Server creates signed payment intent linked to order + animal + TTL.
2. **Reservation hold policy:**
   - Animal enters `reserved_pending_payment` for fixed duration (e.g., 2 hours).
3. **Reconciliation:**
   - For transfer/cash network payments, mark `pending_validation` until back-office proof verification.
4. **Atomic confirmation:**
   - On confirmation, single DB transaction updates payment status, order status, and animal status.

### B. Data Security & Compliance
- TLS 1.2+ end-to-end, HSTS enabled.
- Encryption at rest for sensitive fields (phone, payment proof metadata).
- Role-based access control (RBAC) for admins, farm ops, delivery agents.
- Full audit logs for every status change (who, when, from→to).

### C. Fraud Prevention
- OTP verification on customer phone before order confirmation.
- Velocity checks per phone/IP/device for reservation abuse.
- Duplicate payment reference detection.
- Optional small non-refundable booking fee in peak periods to reduce fake reservations.

### D. Operational Safeguards
- Daily automated settlement report: expected vs received deposits.
- Exception queue for unmatched transfers.
- Refund workflow with maker-checker approval for disputes/cancellations.

### E. Incident Response
- Predefined runbooks for payment outage, duplicate charge report, suspicious activity.
- Real-time alerts on payment confirmation delays and unusual cancellation spikes.

---

## Optional MVP → Phase 2 Rollout
- **MVP (6–8 weeks):** catalog, filters, order, deposit, delivery slots, WhatsApp CTA.
- **Phase 2:** live video appointments, slaughtering workforce management, predictive pricing, loyalty/referral modules.
