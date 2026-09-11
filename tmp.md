# Webserver Linux: Project Description

## 1. Purpose

Webserver Linux is a Dockerized beer data platform. It imports beer information from Google Sheets, stores the raw data in PostgreSQL, cleans and standardizes the data with dbt, and exposes a foundation for viewing beer and brewery information through a Next.js frontend.

The project has four main responsibilities:

1. Run a web frontend for beer analytics.
2. Provide a small FastAPI backend and health endpoint.
3. Synchronize Google Sheets data into PostgreSQL on a schedule.
4. Transform raw data into reusable brewery and beer marts with dbt.

## 2. High-Level Architecture

```text
Google Sheets
	|
	| Google Sheets API and OAuth
	v
cron container
	|
	| clean values, normalize decimals, load raw table
	v
PostgreSQL: beerdb
	|
	| dbt source and staging model
	v
stg__clean_google_data
	|
	| dbt incremental marts
	+--------------------+
	v                    v
mart__brewery        mart_beers
	|
	| future API/data access layer
	v
FastAPI backend ---> Next.js frontend
```

The frontend and backend currently run as separate services. The backend currently provides a root response and a health check; it does not yet expose beer or brewery API endpoints. The frontend currently displays dashboard layout and placeholder analytics rather than loading data from the backend.

## 3. Docker Services

All services are defined in `docker-compose.yml`.

### `postgres`

The PostgreSQL 17 database service uses the database name, user, and password from the environment configuration. It exposes port `5432` and stores its data in the named Docker volume `postgres_data`.

The file `database/init.sql` is mounted into PostgreSQL's initialization directory. It creates the `beerlist` schema and the initial raw and relational tables when the database volume is initialized for the first time.

### `backend`

The backend service builds from `backend/dockerfile`, installs Python dependencies from `backend/requirements.txt`, and starts Uvicorn with the FastAPI application on port `8000`.

Current API endpoints:

- `GET /` returns a basic backend message.
- `GET /health` returns `{ "status": "ok" }`.

### `cron`

The cron service uses the same Python image and backend source as the backend service. It receives the database connection environment variables and waits for PostgreSQL to become healthy.

When it starts, it runs the complete data pipeline once immediately. It then schedules the same pipeline every day at minute `10` of each hour.

The pipeline order is:

1. Obtain or refresh Google OAuth credentials.
2. Read the configured Google Sheet range.
3. Validate the header.
4. Clean alcohol and rating values.
5. Replace the raw PostgreSQL table contents with the latest sheet data.
6. Run `dbt deps` to install declared dbt packages.
7. Run `dbt build` to create or update dbt models.

### `frontend`

The frontend is a Next.js application running on port `3000`. It is built from `frontend/Dockerfile` and currently starts the Next.js development server inside the container.

The main dashboard contains placeholder statistics, country analytics, beer-style distribution, and brewery sections. The `/beerlist` route has its own layout and navigation styling.

## 4. Configuration

The root `env` file contains the PostgreSQL settings:

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password
POSTGRES_DB=beerdb
```

Docker Compose substitutes these values into the PostgreSQL and cron services. The cron container also receives `DB_HOST=postgres`, which is the Docker service name used for internal database connections.

dbt reads the same values in `backend/dbt/dbt_webserver/profiles.yml`:

- host: `DB_HOST`, defaulting to `postgres`
- database: `POSTGRES_DB`
- user: `POSTGRES_USER`
- password: `POSTGRES_PASSWORD`
- schema: `beerlist`

For Compose to read the file automatically, it should normally be named `.env`. If it remains named `env`, start Compose with:

```bash
docker compose --env-file env up --build
```

The database password in the example configuration is suitable only for local development. Production deployments should use protected secrets and should not commit credentials or OAuth tokens to source control.

## 5. Database Layer

The PostgreSQL database is named `beerdb`. The project stores its objects in the `beerlist` schema.

### Tables created by `database/init.sql`

`beerlist.raw_beerlist_google_data` is the ingestion table. It contains the raw Google Sheets columns:

- `brewery`
- `name`
- `type`
- `alcohol`
- `country`
- `rating`

The raw table uses text columns because external spreadsheet data may contain inconsistent values such as comma decimal separators, spelling variations, whitespace, or blank cells.

`beerlist.brewers` and `beerlist.beers` are initial relational tables defined in the SQL initialization file. The current dbt marts are the active analytical output layer and are built from the raw source through staging.

Important Docker behavior: PostgreSQL initialization scripts run only when the data volume is created. Editing `database/init.sql` does not modify an existing database automatically. Existing installations require a SQL migration or a deliberate volume recreation.

## 6. Google Sheets Ingestion

The ingestion code is in `backend/cron/jobs/sync_google_sheets.py`.

The expected Google Sheet header is:

```text
Brewery, Name, Type, Alcohol, Country, Rating
```

The sync reads the configured `Data!A1:F400` range and skips the header row. It cleans values before insertion:

- Alcohol values such as `6,7` are converted to `6.7`.
- Invalid or empty alcohol values become `NULL`/`None`.
- Invalid or empty ratings become `NULL`/`None`.
- Rows with fewer than six columns are skipped.

Before loading, the raw table is deleted. The latest sheet contents are then inserted into `beerlist.raw_beerlist_google_data` in batches.

OAuth credentials are stored in the backend credentials directory. `token.json` is generated or refreshed from the Google client credentials. On a headless server, the token should be generated in an environment where the browser OAuth flow is possible and then transferred securely to the server.

## 7. dbt Transformation Layer

The dbt project is located in `backend/dbt/dbt_webserver`.

### Source

`models/sources.yml` declares the existing PostgreSQL table:

```text
source('beerlist', 'raw_beerlist_google_data')
```

The source name `beerlist` is a dbt label. The physical database is `beerdb`, and the physical PostgreSQL schema is `beerlist`.

### Staging model

`models/beerlist/staging/stg__clean_google_data.sql` reads from the raw source and exposes cleaned columns. It calls the `normalize_country` macro to:

- trim leading and trailing whitespace;
- compare values case-insensitively;
- convert known Danish spellings and common misspellings to English country names;
- apply PostgreSQL `INITCAP`, the equivalent of Excel `PROPER`, to unknown values.

### Brewery mart

`models/beerlist/marts/mart__brewery.sql` is an incremental model. It creates a stable `brewery_key` using `dbt_utils.generate_surrogate_key` from normalized brewery and country values. It also stores:

- `id`
- `brewery_key`
- `brewery`
- `country`
- `inserted_at`
- `inserted_by`

On incremental runs, rows whose `brewery_key` already exists are skipped.

### Beer mart

`models/beerlist/marts/mart_beers.sql` is also incremental. It joins staging data to `mart__brewery` so every beer receives the corresponding `brewery_key` instead of storing only the brewery name.

Its stable `beer_key` is generated from the brewery key, normalized beer name, and normalized beer type. Existing beer keys are excluded during incremental loads. The output includes:

- `id`
- `beer_key`
- `brewery_key`
- `name`
- `type`
- `alcohol`
- `rating`
- `inserted_at`
- `inserted_by`

### Package dependency

`packages.yml` declares `dbt-labs/dbt_utils` version `1.3.0`. The cron dbt runner executes `dbt deps` before `dbt build`, so the `dbt_utils.generate_surrogate_key` macro is available during compilation.

## 8. Project Structure

```text
webserver-linux/
├── docker-compose.yml       # Defines PostgreSQL, backend, cron, and frontend services
├── env                      # Local database environment values
├── readme.md                # Short project overview and setup notes
├── setup.md                 # Linux, SSH, GitHub, and Docker server setup
├── help.md                  # Common run, log, database, and SSH commands
├── database/
│   ├── init.sql             # First-time PostgreSQL schema and table creation
│   └── helper-scripts/      # Manual database helper SQL
├── backend/
│   ├── app.py               # FastAPI application
│   ├── dockerfile            # Backend and cron image definition
│   ├── requirements.txt      # Python dependencies
│   ├── credentials/         # Google OAuth files; keep secrets protected
│   ├── cron/
│   │   ├── run_jobs.py      # Scheduler and pipeline orchestration
│   │   └── jobs/
│   │       ├── google_auth.py
│   │       ├── sync_google_sheets.py
│   │       └── dbt_builder.py
│   └── dbt/dbt_webserver/
│       ├── dbt_project.yml  # dbt project configuration
│       ├── profiles.yml     # dbt/PostgreSQL connection profile
│       ├── packages.yml     # dbt package dependencies
│       ├── macros/           # Reusable Jinja/SQL transformations
│       ├── models/
│       │   ├── sources.yml
│       │   └── beerlist/
│       │       ├── staging/
│       │       └── marts/
│       ├── analyses/         # Compiled analytical SQL, if used
│       ├── tests/            # dbt data tests
│       └── target/           # Generated dbt artifacts; not source code
└── frontend/
    ├── Dockerfile            # Next.js container definition
    ├── package.json          # Node dependencies and scripts
    ├── app/
    │   ├── layout.tsx        # Root layout
    │   ├── page.tsx          # Main dashboard
    │   └── beerlist/         # Beerlist route and styling
    └── public/                # Static images and assets
```

## 9. Running the Project

Start all services using the root environment file:

```bash
docker compose --env-file env up --build
```

Useful URLs:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8000`
- Backend health: `http://localhost:8000/health`
- PostgreSQL: `localhost:5432`

View service status and logs:

```bash
docker compose ps
docker compose logs cron
docker compose logs postgres
```

Open a PostgreSQL shell:

```bash
docker compose exec postgres psql -U postgres -d beerdb
```

Inspect the loaded raw data:

```sql
\dt beerlist.*
SELECT * FROM beerlist.raw_beerlist_google_data LIMIT 20;
SELECT COUNT(*) FROM beerlist.raw_beerlist_google_data;
```

## 10. Current Limitations and Next Connections

The core ingestion and transformation path is connected, but several application-level connections remain to be completed:

- FastAPI does not yet query or return the dbt marts.
- The Next.js dashboard uses hardcoded example statistics and placeholder charts.
- The frontend navigation includes `/brewers` and `/admin` links, but those routes are not currently present in the visible app structure.
- The database initialization tables and dbt marts are separate layers; production use should decide whether dbt marts are the single application-facing data contract.
- The incremental marts use append-style loading. If a brewery or beer's descriptive values change, the existing key strategy determines whether the row is treated as a new record; update/upsert behavior should be added if mutable records must be corrected in place.
- Database credentials and Google OAuth files need production secret management.

The natural next integration step is to add read-only FastAPI endpoints for `mart__brewery` and `mart_beers`, then have the Next.js dashboard fetch those endpoints instead of using placeholder values.
