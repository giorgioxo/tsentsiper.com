# Tsentsiper Backend API

Simple Express.js API server for serving project data.

## Installation

```bash
cd backend
npm install
```

## Running the Server

### Development mode (with auto-reload)
```bash
npm run dev
```

### Production mode
```bash
npm start
```

The server will start on `http://localhost:3000`

## API Endpoints

### Get All Projects
- **URL:** `/api/projects`
- **Method:** `GET`
- **Response:**
```json
{
  "success": true,
  "count": 154,
  "data": [...]
}
```

### Health Check
- **URL:** `/api/health`
- **Method:** `GET`
- **Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Server Info
- **URL:** `/`
- **Method:** `GET`
- **Response:**
```json
{
  "message": "Tsentsiper API Server",
  "version": "1.0.0",
  "endpoints": {
    "projects": "/api/projects",
    "health": "/api/health"
  }
}
```

## CORS

CORS is enabled for all origins to allow frontend access.

## Technologies

- Node.js
- Express.js
- CORS middleware

