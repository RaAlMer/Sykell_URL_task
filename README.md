# Sykell URL Test Task

A full-stack web application that analyzes website URLs, extracting key information like HTML version, headings count, link statistics, and more. Built with React/TypeScript frontend and Go backend with MySQL storage.

## Features

**URL Analysis**  
- HTML version detection  
- Page title extraction  
- Heading tag count (H1-H6)  
- Internal/external link classification  
- Broken link detection  
- Login form detection  

**Dashboard**  
- Paginated, sortable results table  
- Column filters and global search  
- Real-time crawl status updates  
- Bulk actions (re-run analysis, delete)  

**Detail View**  
- Visual charts for link distribution  
- Broken links list with status codes  

## Technologies

**Frontend**: React 18, TypeScript, Vite, Material-UI, Chart.js, Tailwind  
**Backend**: Go (Golang), Gin framework  
**Database**: MySQL  
**Testing**: React Testing Library, Jest  

## Preview

![Dashboard Screenshot](/frontend/frontend/public/dashboard.PNG)
![Detail View Screenshot](/frontend/frontend/public/details.PNG)

## Prerequisites

- Node.js (v16+)  
- Go (v1.19+)  
- MySQL (v8.0+)  
- Yarn or npm  

## Configuration

### Backend Environment (.env)

Create a `.env` file in the `backend` directory with the docker-compose.yml variables:  
`PORT=8080`  
`DB_USER=root`  
`DB_PASSWORD=password`  
`DB_HOST=localhost`  
`DB_PORT=3306`  
`DB_NAME=sykell_db`  
`API_TOKEN=`  
`FRONTEND_URL_BASE=http://localhost:5173`  

### Frontend Environment (.env)

Create a `.env` file in the `frontend` directory with:  
`VITE_GO_API_BASE=http://localhost:8080`
`VITE_GO_API_TOKEN=`

## Setup Instructions

1. **Database Setup**  
   - Create MySQL database: `mysql -u root -p -e "CREATE DATABASE sykell_db;"`  
   - Run migrations: `cd backend && go run migrations/migrate.go`  

2. **Backend Setup**  
   - Install dependencies: `cd backend && go mod download`  
   - Run server: `go run main.go`  

3. **Frontend Setup**  
   - Install dependencies: `cd frontend/frontend && npm install`  
   - Start dev server: `npm run dev`  

## Running with Docker

Run `docker-compose up --build`  
- Frontend: http://localhost:5173  
- Backend API: http://localhost:8080  

## API Authentication

All API requests require header:  
`Authorization: Bearer secret-token-sykell`  
Validated against backend's `API_TOKEN`  

## Development Ports

- Frontend: 5173 (Vite)  
- Backend: 8080  
- MySQL: 3306  

## Testing

**Frontend**: `cd frontend && npm test`  

## Project Structure

```
.
├── backend/
│   ├── .env
│   ├── api/
│   │   ├── middleware/
│   ├── crawler/
│   ├── database/
│   ├── models/
│   └── main.go
├── frontend/frontend/
│   ├── .env
│   ├── src/
│   │   ├── _tests_/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── types/
├── docker-compose.yml
└── README.md
```

## Notes

1. For production:  
   - Change all default credentials  
   - Set proper CORS policies  
   - Use HTTPS  

2. Frontend uses Vite (port 5173) proxying to backend  

3. MySQL credentials assume local installation  

4. CORS issues:  
   - Ensure `FRONTEND_URL_BASE` matches frontend URL  
   - Both servers running for requests  

5. API token must match between:  
   - Backend `.env` `API_TOKEN`  
   - Frontend `.env` `VITE_GO_API_TOKEN`

## 📜 License

This project is provided for assessment purposes and is not licensed for commercial use.