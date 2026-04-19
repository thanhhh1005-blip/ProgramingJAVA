# Data Labeling System (ProgramingJAVA)

## Overview

This repository contains a full-stack data labeling system with a Spring Boot backend (`label`) and a React frontend (`data-labeling-ui`).  
The system supports user authentication, project setup, label definition, dataset upload, annotation submission, and review-state handling.  
It is organized for image annotation workflows where dataset items are associated with projects and annotation tasks.

## Key Features

- JWT-based authentication (`/auth/token`, `/auth/introspect`, `/auth/logout`, `/auth/refresh`)
- User management API (`/users`) with create/read/update/delete operations
- Role and permission management APIs (`/roles`, `/permissions`)
- Project creation with per-project label set configuration (`/projects`)
- Dataset ingestion via multipart upload to Cloudinary and persistence to MySQL (`/datasets/upload`)
- Dataset retrieval by project (`/datasets/project/{projectId}`)
- Annotation persistence in YOLO-style normalized box coordinates (`/annotations`)
- Reviewer workflow endpoints for pending task retrieval, approval, and rejection with review logs (`/api/api/v1/reviews/...` with current context path + controller mapping)

## Architecture / Project Structure

```text
ProgramingJAVA/
├── label/                       # Spring Boot backend (API + business logic + persistence)
│   ├── src/main/java/com/project/label/
│   │   ├── controller/          # REST endpoints (auth, users, projects, datasets, annotations, reviews)
│   │   ├── service/             # Core workflow logic
│   │   ├── entity/              # JPA entities (User, Project, DataItem, Task, Annotation, ReviewLog, ...)
│   │   ├── repository/          # Spring Data JPA repositories
│   │   ├── configuration/       # Security, JWT, Cloudinary, app initialization
│   │   ├── dto/                 # Request/response contracts
│   │   └── enums/               # Domain states (ProjectStatus, DataItemStatus, TaskStatus)
│   └── src/main/resources/
│       └── application.yaml     # Runtime configuration (server, DB, JWT, Cloudinary)
├── data-labeling-ui/            # React + Vite frontend
│   ├── src/pages/               # Login, user admin, project, dataset, annotation screens
│   ├── src/layouts/             # Main authenticated layout
│   └── src/components/          # Reusable UI components
└── README.md
```

## Labeling Workflow

1. Authenticate and obtain a JWT token (`POST /api/auth/token` from the frontend).
2. Create a project with annotation instructions and project-specific labels.
3. Upload dataset images to the project (`POST /api/datasets/upload`); files are uploaded to Cloudinary and stored as `DataItem`.
4. Load dataset items per project (`GET /api/datasets/project/{projectId}`) in the project detail UI.
5. Draw bounding boxes in the annotation UI and submit normalized coordinates (`POST /api/annotations`).
6. Reviewers query pending tasks and approve/reject submissions via review endpoints.

## Installation

### Prerequisites

- Java 21 (required by backend build configuration)
- Maven 3.9+
- Node.js 20+ and npm
- MySQL 8+

### Clone

```bash
git clone https://github.com/thanhhh1005-blip/ProgramingJAVA.git
cd ProgramingJAVA
```

### Backend setup (`label`)

```bash
cd label
mvn spring-boot:run
```

### Frontend setup (`data-labeling-ui`)

```bash
cd data-labeling-ui
npm install
npm run dev
```

## Usage

### Backend API base

- Default server port: `8080`
- Backend context path: `/api`
- Example API root: `http://localhost:8080/api`

### Frontend

- Start dev server:

```bash
cd data-labeling-ui
npm run dev
```

- Build production bundle:

```bash
npm run build
```

- Lint frontend source:

```bash
npm run lint
```

### Typical API call sequence

1. `POST /api/auth/token`
2. `POST /api/projects`
3. `POST /api/datasets/upload`
4. `GET /api/datasets/project/{projectId}`
5. `POST /api/annotations`

## Configuration

Backend configuration is defined in:

- `label/src/main/resources/application.yaml`

Configured domains include:

- `spring.datasource.*` (MySQL connection)
- `jwt.*` (token signer key and durations)
- `cloudinary.*` (cloud storage credentials)
- `server.servlet.context-path` (`/api`)

Frontend configuration:

- `VITE_API_BASE_URL` can be set for API host override.
- If not set, the frontend defaults to `http://localhost:8080`.

## Limitations / Scope

- Annotation page currently uses a fixed sample image and static label list in UI logic.
- Annotation submission currently posts a fixed `taskId` in the frontend implementation.
- Reviewer endpoints exist, but end-to-end task assignment and reviewer UI integration are partial.
- Repository contains hardcoded secrets in backend configuration and is not production-safe as-is.
- Current local build can fail if Java 21 is unavailable (backend compiler target is Java 21).

## Future Improvements

- Complete task assignment flow between dataset items, annotators, and reviewers.
- Replace hardcoded frontend annotation inputs with project-driven labels and task data.
- Add secure secret management (environment variables / vault) for JWT and Cloudinary credentials.
- Add automated integration tests for project, dataset, annotation, and review workflow.
