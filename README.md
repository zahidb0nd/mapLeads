# MapLeads - Local Business Lead Generator

MapLeads helps you find local businesses **without websites** — perfect for web designers, digital agencies, and sales teams looking for new leads.

![MapLeads](https://img.shields.io/badge/Version-0.1.0-purple)
![React](https://img.shields.io/badge/React-18.2.0-blue)
![Vite](https://img.shields.io/badge/Vite-5.1.0-yellow)
![PocketBase](https://img.shields.io/badge/PocketBase-0.21.1-green)

## ✨ Features

- 🔍 **Business Search** — Find businesses by type, location, and category
- 🗺️ **Interactive Map** — Leaflet map with business markers
- 🌐 **Website Filter** — Automatically shows only businesses WITHOUT websites
- 📜 **Search History** — Track and review past searches
- 💾 **Saved Searches** — Save frequent search configurations
- 📤 **CSV Export** — Download business data for outreach
- 📊 **Dashboard Analytics** — View search statistics and trends
- 🔒 **User Authentication** — Secure signup/login with PocketBase

## 🛠️ Tech Stack

### Frontend
- **React 18** + **Vite**
- **Tailwind CSS** + **shadcn/ui**
- **React Router**, **Zustand**, **React Hook Form + Zod**
- **Leaflet** (maps), **Recharts** (charts)

### Backend
- **PocketBase** — Auth, Database (SQLite), Real-time
- **Express proxy server** — Handles API calls to avoid CORS

### APIs
- **Geoapify Places API** — Business search (free tier: 3,000 req/day)
- **OpenStreetMap Nominatim** — Free geocoding (no key needed)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PocketBase executable ([download here](https://pocketbase.io/docs/))
- Geoapify API key ([get free key here](https://www.geoapify.com/))

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment variables
Edit `.env` (copy from `.env.example`):
```env
VITE_POCKETBASE_URL=http://127.0.0.1:8090
VITE_GEOAPIFY_API_KEY=your_geoapify_api_key_here
VITE_APP_NAME=MapLeads
VITE_APP_URL=http://localhost:3000
```

### 3. Start PocketBase (Terminal 1)
Place `pocketbase.exe` (Windows) or `pocketbase` (Mac/Linux) in the `pocketbase/` folder, then:
```bash
# Windows
cd pocketbase && ./pocketbase.exe serve

# Mac/Linux
cd pocketbase && chmod +x pocketbase && ./pocketbase serve
```
- Open http://127.0.0.1:8090/_/ and create an admin account
- Import `pocketbase/pb_schema.json` via Settings → Import collections

### 4. Start the app (Terminal 2)
```bash
npm start
```
This starts both the **proxy server** (port 3001) and the **Vite frontend** (port 3000).

### 5. Open the app
Go to **http://localhost:3000** 🎉

---

## 🔄 Running After Initial Setup

Every time you want to use MapLeads:

| Terminal | Command |
|---|---|
| Terminal 1 (PocketBase) | `cd pocketbase && ./pocketbase.exe serve` |
| Terminal 2 (App) | `npm start` |

Then open → **http://localhost:3000**

## 📁 Project Structure

```
mapLeads/
├── proxy-server.cjs        # Express proxy (port 3001)
├── src/
│   ├── components/
│   │   ├── ui/             # Reusable UI components
│   │   ├── layout/         # Header, Sidebar, Layout
│   │   ├── search/         # SearchForm, MapView
│   │   └── business/       # BusinessCard, BusinessList, BusinessDetails
│   ├── pages/              # Dashboard, Search, History, SavedSearches
│   ├── hooks/              # useAuth, useBusinessSearch
│   ├── stores/             # Zustand global state
│   └── lib/                # geoapify.js, pocketbase.js, utils.js
├── pocketbase/
│   ├── pb_schema.json      # Database schema
│   └── pb_migrations/      # DB migrations
├── .env.example            # Environment variable template
└── package.json
```

## 🔑 Getting a Geoapify API Key

1. Go to [geoapify.com](https://www.geoapify.com/)
2. Sign up for a free account
3. Create a new project and copy the API key
4. Add it to `.env` as `VITE_GEOAPIFY_API_KEY`

**Free tier:** 3,000 requests/day — plenty for development and small-scale usage.

## 📊 Database Schema

### Collections (PocketBase)

| Collection | Fields |
|---|---|
| **users** | email, name, avatar, company |
| **searches** | user, query, location, latitude, longitude, radius, categories, results_count |
| **saved_searches** | user, name, query, location, latitude, longitude, radius, categories |
| **businesses** | fsq_id, name, address, latitude, longitude, categories, phone, email, raw_data |

## 🎨 Design System

- **Primary color:** Purple `#7C3AED`
- **Theme:** Dark (`#0A0A0A`, `#1A1A1A` backgrounds)
- **Font:** System fonts (San Francisco, Segoe UI)

## 🐛 Troubleshooting

### Search not working
- Make sure proxy server is running on port 3001 (`npm start` starts it automatically)
- Check your Geoapify API key in `.env`

### PocketBase connection issues
- Ensure PocketBase is running on port 8090
- Check `VITE_POCKETBASE_URL` in `.env`
- Verify admin account is created at http://127.0.0.1:8090/_/

### Map not loading
- Check browser console for errors
- Ensure you have an internet connection (map tiles load from OpenStreetMap)

### Location not found
- Try a more specific location (e.g., "Jayanagar, Bangalore" instead of just "Bangalore")
- Use the 📍 GPS button for your current location

## 🚢 Deployment

### Frontend (Vercel/Netlify)
```bash
npm run build
```
Deploy the `dist/` folder. Set environment variables in your hosting dashboard.

### Backend (PocketBase)
Deploy PocketBase to a VPS and use nginx as a reverse proxy. Update `VITE_POCKETBASE_URL` to your production URL.

### Proxy Server
Deploy `proxy-server.cjs` to a Node.js host (Railway, Render, etc.) and update `PROXY_BASE_URL` in `src/lib/geoapify.js`.

## 📝 Available Scripts

| Command | Description |
|---|---|
| `npm start` | Start proxy + frontend together |
| `npm run dev` | Start only the Vite frontend |
| `npm run proxy` | Start only the proxy server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Lint the code |

## 📄 License

MIT License

## 🤝 Contributing

Contributions welcome! Please open an issue or submit a pull request.

---

**Built with ❤️ by the MapLeads team**
