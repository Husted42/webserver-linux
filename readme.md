# Webserver Linux
## Prerequisites

Before starting the project, make sure you have:

- Docker installed
- Docker Compose installed
- Git installed
- Access to a Linux machine or local environment with Docker support
- A Google service account or OAuth credentials file for the scheduled Sheets sync
- FTP or another secure method to transfer the Google credentials to the server, since the browser-based OAuth flow cannot run on the server

## Project structure

- [frontend](frontend) – Next.js frontend app
- [backend](backend) – FastAPI API and cron job code
- [database](database) – SQL initialization scripts
- [data](data) – local data files

- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- PostgreSQL: localhost:5432

## Setup

1. Create the environment file and push env (see env)

    - Stand in root folder
    
    ```export $(grep -v '^#' .env | xargs)```

2. Build and start the application:

   ```bash
   docker compose up --build
   ```
3. Setup credintials 
    I use a FTP accsess to move google credentials, since we cannot open the browser (OAuth) on the server


## Backend health check
```bash
curl http://localhost:8000/health
```

