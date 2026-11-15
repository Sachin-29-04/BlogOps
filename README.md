# BlogOps

A modern, containerized RESTful Blog API built with Node.js, Express, and PostgreSQL, featuring JWT authentication, automated test suites, Prometheus metrics scraping, and Grafana observability dashboards.

---

## Features

- **Authentication & Security**: User registration and login using salted BCrypt password hashing and stateless JWT bearer tokens.
- **Resource Ownership & Authorization**: Granular permissions preventing unauthorized modifications—only post and comment authors can edit or delete their resources (HTTP 403 enforcement).
- **Relational Integrity**: Foreign key constraints with cascading deletions across users, posts, and comments.
- **Interactive Documentation**: Integrated OpenAPI 3.0 documentation served via Swagger UI at `/api-docs`.
- **Observability**: Real-time request metrics exposed via `prom-client` at `/metrics`, scraped by Prometheus, and visualized in Grafana.
- **Containerized Architecture**: Single-command multi-service deployment orchestrating the application, PostgreSQL, Prometheus, and Grafana via Docker Compose.
- **DevSecOps Pipeline**: Automated testing, container vulnerability scanning with Trivy, and Docker image publishing via GitHub Actions.

---

## Architecture Overview

```
                      [ Client (Browser / Postman) ]
                                    │
                                    ▼
       ┌─────────────────────────────────────────────────────────┐
       │                 BlogOps Express Server                  │
       │  ├── Request Metrics Middleware                         │
       │  ├── JWT Authentication & Ownership Guards (401 / 403)  │
       │  ├── Swagger UI (/api-docs)                             │
       │  └── Modular MVC Layers (Routes → Controllers → Models) │
       └───────────────┬─────────────────────────┬───────────────┘
                       │                         │
                       ▼                         ▼
         ┌──────────────────────────┐  ┌───────────────────┐
         │       PostgreSQL         │  │ Prometheus (:9090)│
         │  ├── users               │  └─────────┬─────────┘
         │  ├── posts               │            ▼
         │  └── comments (CASCADE)  │  ┌───────────────────┐
         └──────────────────────────┘  │  Grafana (:3000)  │
                                       └───────────────────┘
```

---

## Tech Stack

| Component | Technology |
|---|---|
| **Frontend UI** | HTML5, CSS3, Modern JavaScript (Fetch API) |
| **Backend Runtime** | Node.js (v20), Express.js |
| **Database** | PostgreSQL 16 (`pg` connection pool) |
| **Authentication** | JSON Web Tokens (`jsonwebtoken`), `bcryptjs` |
| **API Documentation** | OpenAPI 3.0, Swagger UI |
| **Testing** | Jest, Supertest |
| **Containerization** | Docker, Docker Compose |
| **Metrics & Monitoring** | Prometheus (`prom-client`), Grafana |
| **CI/CD & Security** | GitHub Actions, Aqua Security Trivy |

---

## Directory Structure

```plaintext
├── .github/
│   └── workflows/
│       └── ci-cd.yml          # CI test, Trivy scan, and container push
├── db/
│   └── schema.sql             # Relational database schema
├── monitoring/
│   └── prometheus.yml         # Prometheus scrape configuration
├── public/
│   └── index.html             # Single-page web interface
├── src/
│   ├── config/
│   │   ├── db.js              # PostgreSQL client pool
│   │   ├── metrics.js         # Prometheus metrics registry
│   │   └── swagger.js         # OpenAPI specification
│   ├── middleware/
│   │   ├── auth.middleware.js # JWT verification guard
│   │   └── error.middleware.js# Global error handling
│   ├── models/
│   │   ├── user.model.js      # User queries
│   │   ├── post.model.js      # Post queries
│   │   └── comment.model.js   # Comment queries
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── post.controller.js
│   │   └── comment.controller.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── post.routes.js
│   │   └── comment.routes.js
│   ├── app.js                 # Express application setup
│   └── server.js              # Server entry point
├── tests/
│   ├── auth.test.js           # Auth & health unit tests
│   ├── post.test.js           # Post CRUD & authorization tests
│   └── comment.test.js        # Comment CRUD & query filtering tests
├── Dockerfile
├── docker-compose.yml
├── package.json
└── README.md
```

---

## API Endpoints

### Authentication
- `POST /register` — Register a new account (`username`, `email`, `password`)
- `POST /login` — Authenticate and receive a JWT Bearer token

### Posts
- `GET /posts` — Retrieve all posts (public, includes author details)
- `GET /posts/:id` — Retrieve a single post by ID
- `POST /posts` — Create a post *(Requires JWT)*
- `PUT /posts/:id` — Update a post *(Requires JWT; author only)*
- `DELETE /posts/:id` — Delete a post *(Requires JWT; author only)*

### Comments
- `GET /comments?post_id={id}` — Retrieve comments for a specific post
- `GET /comments/:id` — Retrieve a single comment by ID
- `POST /comments` — Create a comment (`post_id`, `content`) *(Requires JWT)*
- `PUT /comments/:id` — Update a comment *(Requires JWT; author only)*
- `DELETE /comments/:id` — Delete a comment *(Requires JWT; author only)*

### System & Telemetry
- `GET /health` — Service health status
- `GET /metrics` — Prometheus metrics endpoint
- `GET /api-docs` — Swagger UI documentation

---

## Getting Started

### Using Docker Compose (Recommended)

Start the application, database, Prometheus, and Grafana:

```bash
docker compose up --build -d
```

Service URLs:
- **Application UI**: [http://localhost:5000](http://localhost:5000)
- **Swagger Documentation**: [http://localhost:5000/api-docs](http://localhost:5000/api-docs)
- **Prometheus Dashboard**: [http://localhost:9090](http://localhost:9090)
- **Grafana Dashboard**: [http://localhost:3000](http://localhost:3000) *(Credentials: `admin` / `admin`)*

Stop all services:
```bash
docker compose down
```

### Local Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment variables**:
   ```bash
   cp .env.example .env
   ```

3. **Run automated test suite**:
   ```bash
   npm test
   ```

4. **Start the application**:
   ```bash
   npm start
   ```

---

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `PORT` | Application listening port | `5000` |
| `DATABASE_URL` | PostgreSQL connection string | `postgres://bloguser:blogpass@localhost:5432/blogdb` |
| `JWT_SECRET` | Secret key for signing JWT tokens | `super_secret_jwt_key_2026` |
| `NODE_ENV` | Application environment mode | `development` |
