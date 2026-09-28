# LeadflowZ — Lead Intake & Management Platform

LeadflowZ is a production-oriented lead intake and management service built around a Meta Ads webhook workflow.

The system receives leads through a secure webhook, validates the webhook secret, prevents duplicate lead creation through idempotency, persists leads in PostgreSQL, exposes APIs for lead management, and maintains an audit trail for important lead changes.

## Assignment Requirement Coverage

The README and project documentation cover the required assignment areas:

| Assignment requirement | Project/documentation coverage |
|---|---|
| Lead List | Frontend Lead List and `GET /api/leads` |
| Lead Detail View | Frontend Lead Detail and `GET /api/leads/:id` |
| Activity Timeline | Audit/activity events documented for the lead lifecycle |
| Meta webhook | `POST /api/webhook/meta-lead` |
| Lead listing | `GET /api/leads` |
| Lead detail | `GET /api/leads/:id` |
| Status update | `PATCH /api/leads/:id/status` |
| Audit trail | Lead Created, Lead Updated, Status Changed |
| React + TypeScript | Frontend stack |
| PostgreSQL | Persistence layer |
| Docker | Docker build/run instructions |
| Live deployment | Render deployment URL |
| Architecture | Architecture and request-flow sections |
| Setup | Local development and environment-variable instructions |
| Deployment | Render deployment section |
| Trade-offs | Design trade-offs section |
| Scaling | Scaling considerations section |
| Future improvements | Future improvements section |
| AI usage | `AGENT.md` is listed as a required separate deliverable |

## Live Deployment

**Backend API:** https://leadflowz-backend.onrender.com

### API Endpoints

> **Route note:** The assignment describes routes such as `/webhook/meta-lead` and `/leads`. The deployed application currently exposes these routes under the `/api` prefix, for example `/api/webhook/meta-lead` and `/api/leads`.

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/webhook/meta-lead` | Receive a Meta lead webhook |
| GET | `/api/leads` | List, search and filter leads |
| GET | `/api/leads/:id` | Get a lead by ID |
| PATCH | `/api/leads/:id/status` | Update lead status |

---

## 1. Problem Statement

Businesses running lead-generation campaigns need a reliable way to receive, store, search, manage and track leads generated from advertising platforms.

LeadflowZ addresses this by providing:

- Secure webhook intake
- Webhook secret validation
- Input validation
- Idempotent lead processing
- PostgreSQL persistence
- Lead search and filtering
- Lead status management
- Audit trail
- REST APIs for frontend and integrations
- Docker/deployment support

---

## 2. Main Features

### Secure Meta Webhook

```http
POST /api/webhook/meta-lead
```

The endpoint expects the `X-Webhook-Secret` header.

Example payload:

```json
{
  "external_lead_id": "e2e-final-001",
  "name": "E2E Final Lead",
  "email": "e2e-final@example.com",
  "phone": "9000000222",
  "source": "meta",
  "notes": "Final end-to-end test"
}
```

### Idempotency

`external_lead_id` is used to identify the external lead and prevent webhook retries from blindly creating duplicate records.

### Lead Management

The API supports:

- List leads
- Search leads
- Filter by status
- Get lead details
- Update lead status

### Audit Trail

The assignment requires an activity record for each lead action. The documented activity events are:

- Lead Created
- Lead Updated
- Status Changed

---

## 3. Architecture

```text
                Meta Ads
                   |
                   | Webhook
                   v
        POST /api/webhook/meta-lead
                   |
                   v
        Webhook Secret Validation
                   |
                   v
             Input Validation
                   |
                   v
            Idempotency Check
                   |
                   v
              Lead Service
                /                      v         v
          PostgreSQL   Audit Trail
               |
               v
          REST API Layer
               |
               v
          React Frontend
          /      |            Lead List Detail  Activity
```

---

## 4. Technology Stack

### Backend

- Node.js
- TypeScript
- REST API

### Frontend

- React
- TypeScript

### Database

- PostgreSQL

### DevOps / Deployment

- Docker
- Render
- GitHub

### API Testing

- Postman
- cURL

---

## 5. API Usage

### Create Lead Through Webhook

```http
POST /api/webhook/meta-lead
Content-Type: application/json
X-Webhook-Secret: <WEBHOOK_SECRET>
```

Request:

```json
{
  "external_lead_id": "curl-test-001",
  "name": "cURL Test Lead",
  "email": "curl-test@example.com",
  "phone": "9000000999",
  "source": "meta",
  "notes": "cURL webhook test"
}
```

Successful response:

```text
201 Created
```

---

## 6. cURL Test

### Windows PowerShell

Do not put the real secret directly into Git or README examples.

```powershell
$env:WEBHOOK_SECRET="YOUR_WEBHOOK_SECRET"

curl.exe -X POST `
  "https://leadflowz-backend.onrender.com/api/webhook/meta-lead" `
  -H "Content-Type: application/json" `
  -H "X-Webhook-Secret: $env:WEBHOOK_SECRET" `
  -d '{"external_lead_id":"curl-test-001","name":"cURL Test Lead","email":"curl-test@example.com","phone":"9000000999","source":"meta","notes":"cURL webhook test"}'
```

### macOS / Linux

```bash
export WEBHOOK_SECRET="YOUR_WEBHOOK_SECRET"

curl -X POST   "https://leadflowz-backend.onrender.com/api/webhook/meta-lead"   -H "Content-Type: application/json"   -H "X-Webhook-Secret: $WEBHOOK_SECRET"   -d '{
    "external_lead_id": "curl-test-001",
    "name": "cURL Test Lead",
    "email": "curl-test@example.com",
    "phone": "9000000999",
    "source": "meta",
    "notes": "cURL webhook test"
  }'
```

---

## 7. List Leads

```http
GET /api/leads
```

Example:

```bash
curl "https://leadflowz-backend.onrender.com/api/leads"
```

Expected:

```text
200 OK
```

---

## 8. Search and Status Filtering

Examples:

```text
GET /api/leads?search=John
```

```text
GET /api/leads?status=new
```

Search and status filtering were verified against the deployed API during testing.

---

## 9. Get Lead By ID

```http
GET /api/leads/:id
```

Example:

```bash
curl "https://leadflowz-backend.onrender.com/api/leads/<LEAD_ID>"
```

Existing lead:

```text
200 OK
```

Non-existing lead:

```text
404 Not Found
```

Example:

```json
{
  "detail": "Lead not found"
}
```

This is expected API behavior for an unknown resource.

---

## 10. Update Lead Status

```http
PATCH /api/leads/:id/status
```

Example:

```bash
curl -X PATCH   "https://leadflowz-backend.onrender.com/api/leads/<LEAD_ID>/status"   -H "Content-Type: application/json"   -d '{"status":"qualified"}'
```

The status change is also represented in the audit trail.

---

## 11. Environment Variables

Create `.env` locally:

```env
DATABASE_URL=your_database_connection_string
WEBHOOK_SECRET=your_webhook_secret
PORT=3000
```

Use the actual environment variables required by the current application.

Production secrets should be configured in Render environment variables.

Never commit:

```text
.env
.env.local
.env.production
```

to Git.

---

## 12. Setup Instructions

### Local Development

### Install

```bash
npm install
```

### Configure

```bash
cp .env.example .env
```

Update `.env` with local database and secret values.

### Start

```bash
npm run dev
```

---

## 13. Docker

Build:

```bash
docker build -t leadflowz-backend .
```

Run:

```bash
docker run --env-file .env -p 3000:3000 leadflowz-backend
```

---

## 14. Testing

The deployed backend was tested with Postman.

Verified flows:

- Webhook authentication
- Lead creation
- Idempotency
- Lead listing
- Search
- Status filtering
- Lead detail retrieval
- Non-existing lead handling
- End-to-end webhook → database → API flow

### Successful E2E Flow

```text
POST /api/webhook/meta-lead
          |
          v
     201 Created
          |
          v
GET /api/leads
          |
          v
      200 OK
          |
          v
Created lead returned
```

### Negative Test

A non-existing UUID correctly returned:

```http
404 Not Found
```

with:

```json
{
  "detail": "Lead not found"
}
```

---

## 15. Idempotency Test

A webhook provider may retry an event.

Example:

```json
{
  "external_lead_id": "idempotency-demo-001",
  "name": "Idempotency Demo",
  "email": "idempotency@example.com",
  "phone": "9000000111",
  "source": "meta"
}
```

The application uses the external lead identifier as part of its duplicate-prevention logic.

This makes the webhook safer against retries and repeated delivery.

---

## 16. Audit Trail

The system records important lead events:

```text
Lead Created
Lead Updated
Status Changed
```

Example activity timeline:

```text
Lead Created
     |
Lead Updated
     |
Status Changed: new -> contacted
     |
Status Changed: contacted -> qualified
```

---

## 17. Frontend

The frontend is designed around:

### Lead List

- Lead listing
- Search
- Status filtering
- Status visibility
- Navigation to details

### Lead Detail

- Lead information
- Contact information
- Source
- Notes
- Current status
- Activity history

### Activity Timeline

Displays lead changes chronologically.

---

## 18. Security

The application uses:

- `X-Webhook-Secret` for webhook authentication
- Environment variables for secrets
- Request validation
- Appropriate HTTP status codes
- No production secrets in source control

**Important:** If a real webhook secret has been exposed in screenshots, chat, Git history or public documentation, rotate it and update the production environment variable.

---

## 19. Scalability

The current architecture is intentionally simple and maintainable for the assignment.

For higher traffic, the system can evolve to:

### Queue-Based Processing

```text
Meta
  |
Webhook API
  |
Queue
  |
Worker
  |
PostgreSQL
```

### Redis

Potential uses:

- Rate limiting
- Caching
- Idempotency state
- Temporary processing state

### Database

At higher volume:

- Add indexes
- Use pagination
- Optimize search queries
- Use connection pooling
- Monitor slow queries

### Horizontal Scaling

```text
             Load Balancer
             /     |                  /      |                API #1  API #2   API #3
            \      |       /
             \     |      /
              PostgreSQL
```

### Observability

Future production improvements:

- Structured logging
- Metrics
- Error tracking
- Distributed tracing
- Health checks
- Database monitoring

---

## 20. Design Trade-offs

### PostgreSQL

Benefits:

- Strong consistency
- Transactions
- Constraints
- Indexing
- Mature relational model

Trade-off:

- Requires schema/migration management.

### REST

Benefits:

- Simple
- Easy to consume from React
- Easy to integrate with external services

Trade-off:

- More endpoints may be required as frontend requirements grow.

### Synchronous Webhook Processing

Benefits:

- Simple implementation
- Easy to reason about
- Suitable for current scope

Trade-off:

- A queue/worker architecture is better for very high webhook traffic.

### Shared Webhook Secret

Benefits:

- Simple
- Appropriate for a controlled integration

Trade-off:

- A larger production integration may require provider-specific signatures, secret rotation and replay protection.

---

## 21. Future Improvements

- Real Meta Graph API integration
- Provider-specific webhook signature verification
- Secret rotation
- Rate limiting
- Redis-backed idempotency
- Background job processing
- Pagination
- Advanced filtering
- Bulk operations
- Role-based access control
- Authentication for internal APIs
- Automated integration tests
- CI/CD
- Monitoring and alerting
- OpenAPI/Swagger documentation
- CSV export
- CRM integrations
- Additional lead sources

---

## 22. Deployment

The backend is deployed on Render:

```text
GitHub
   |
   v
Render
   |
   v
Application
   |
   v
PostgreSQL
```

Production secrets are configured through Render environment variables.

Backend:

```text
https://leadflowz-backend.onrender.com
```

---

## 23. Repository Structure

The exact structure can vary with the current implementation, but the project is organized around frontend, backend, API, persistence and documentation responsibilities.

```text
LeadflowZ/
├── backend/
├── frontend/
├── README.md
├── AGENT.md
└── ...
```

---

## 24. Assignment Deliverables

The project covers the requested core deliverables:

- Meta webhook lead intake
- Webhook authentication
- Idempotent processing
- PostgreSQL persistence
- Lead List
- Lead Detail
- Lead status update
- Search
- Status filtering
- Audit trail
- React frontend
- Docker support
- Deployment
- README documentation
- AGENT.md for AI-assisted development

---

## 25. Final End-to-End Flow

```text
                 Meta Lead
                     |
                     v
              Secure Webhook
                     |
                     v
              Validation
                     |
                     v
               Idempotency
                     |
                     v
                PostgreSQL
                     |
                     v
             Lead Management API
                /    |                    /     |                 Search  Status   Detail
               \     |      /
                \    |     /
                     v
                React UI
                     |
                     v
              Activity Timeline
```

LeadflowZ provides a foundation for a reliable lead intake and management platform while keeping the architecture extensible for queues, Redis, stronger webhook signatures, scaling and additional integrations.
