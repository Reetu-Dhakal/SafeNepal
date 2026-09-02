# SafeNepal

Nepal-focused disaster information aggregation and geospatial visualization platform.

## Features

- Real-time disaster news from 15+ Nepali and English sources
- Earthquake, flood, landslide, monsoon, storm, fire coverage
- OG image extraction for news articles with photos
- Time-based filtering (1h, 6h, 24h, 3d, 7d)
- Search across all disaster news
- Active disaster events dashboard

## Tech Stack

- **Backend**: Node.js, Express.js
- **Frontend**: React, Vite, Tailwind CSS
- **Data**: RSS feeds (Google News, Setopati, Online Khabar, Nepal Khabar)

## Quick Start

### Backend

```bash
cd backend
npm install
node server.js
```

API runs at http://localhost:8000

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at http://localhost:5173

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/api/v1/disasters/active` | Active disaster events |
| GET | `/api/v1/news` | Disaster news with filters |
| GET | `/api/v1/news/disaster` | Disaster-only news |
| GET | `/api/v1/news/sources` | List news sources |
| POST | `/api/v1/news/refresh` | Force refresh cache |

### Query Parameters

- `hours` - Filter by time range (1, 6, 24, 72, 168)
- `q` - Search by keyword
- `source` - Filter by source name
- `page` - Pagination page number
- `limit` - Results per page

## News Sources

- Google News Nepal (earthquake, flood, landslide, monsoon, storm, fire, GLOF, rescue)
- Setopati
- Online Khabar
- Nepal Khabar

## Project Structure

```
SafeNepal/
├── backend/
│   ├── server.js              # Express app entry
│   ├── db.js                  # PostgreSQL config
│   ├── app/
│   │   ├── api/v1/
│   │   │   ├── disaster.js    # Disaster endpoints
│   │   │   ├── news.js        # News endpoints
│   │   │   └── index.js       # API v1 router
│   │   └── services/
│   │       └── news.js        # RSS fetcher + OG image extraction
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/Home.jsx     # Main dashboard
│   │   ├── App.jsx            # Router setup
│   │   └── main.jsx           # Entry point
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
└── README.md
```