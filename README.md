# MapLeads - Local Business Lead Generator

MapLeads is a SaaS application that helps users find local businesses without websites using Foursquare Places API. Perfect for web designers, digital agencies, and sales teams looking for new leads.

![MapLeads](https://img.shields.io/badge/Version-0.1.0-purple)
![React](https://img.shields.io/badge/React-18.2.0-blue)
![Vite](https://img.shields.io/badge/Vite-5.1.0-yellow)
![PocketBase](https://img.shields.io/badge/PocketBase-0.21.1-green)

## ✨ Features

### Phase 1: Foundation (MVP)
- ✅ **User Authentication** - Secure signup/login with PocketBase
- ✅ **Dark Theme UI** - Modern dark interface with purple accent (#7C3AED)
- ✅ **Responsive Design** - Works on desktop, tablet, and mobile

### Phase 2: Search & Discovery
- ✅ **Business Search** - Find businesses using Foursquare Places API
- ✅ **Interactive Map** - Leaflet map with business markers
- ✅ **Advanced Filters** - Location, radius, categories
- ✅ **Website Detection** - Automatically filters businesses without websites
- ✅ **Geolocation** - Use current location for searches

### Phase 3: Data Management
- ✅ **Search History** - Track and review past searches
- ✅ **Saved Searches** - Save frequent search configurations
- ✅ **CSV Export** - Download business data for outreach
- ✅ **Dashboard Analytics** - View search statistics and trends

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm/yarn
- **PocketBase** (download from [pocketbase.io](https://pocketbase.io))
- **Foursquare API Key** (get from [Foursquare Developer Portal](https://location.foursquare.com/developer/))

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mapleads
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your Foursquare API key:
   ```env
   VITE_POCKETBASE_URL=http://127.0.0.1:8090
   VITE_FOURSQUARE_API_KEY=your_foursquare_api_key_here
   VITE_APP_NAME=MapLeads
   VITE_APP_URL=http://localhost:3000
   ```

4. **Set up PocketBase**
   
   Download PocketBase for your OS from [pocketbase.io](https://pocketbase.io/docs/) and extract it to the `pocketbase` folder:
   
   ```bash
   cd pocketbase
   # Place the pocketbase executable here
   
   # Windows
   ./pocketbase.exe serve
   
   # macOS/Linux
   ./pocketbase serve
   ```
   
   - Open http://127.0.0.1:8090/_/
   - Create an admin account
   - The collections will be auto-created on first app run
   - Or manually import `pocketbase/pb_schema.json`

5. **Start the development server**
   ```bash
   npm run dev
   ```
   
   The app will be available at http://localhost:3000

## 🔑 Getting a Foursquare API Key

1. Go to [Foursquare Developer Portal](https://location.foursquare.com/developer/)
2. Sign up or log in to your account
3. Create a new project
4. Copy your API key
5. Add it to your `.env` file as `VITE_FOURSQUARE_API_KEY`

**Note:** Foursquare offers a free tier with 50,000 API calls per month, which is sufficient for testing and small-scale usage.

## 📁 Project Structure

```
mapleads/
├── public/                 # Static assets
├── src/
│   ├── components/        # React components
│   │   ├── ui/           # Reusable UI components (shadcn/ui)
│   │   ├── layout/       # Layout components (Header, Sidebar)
│   │   ├── search/       # Search-related components
│   │   └── business/     # Business card and details
│   ├── pages/            # Page components
│   │   ├── Dashboard.jsx
│   │   ├── Search.jsx
│   │   ├── History.jsx
│   │   ├── SavedSearches.jsx
│   │   ├── Login.jsx
│   │   └── Signup.jsx
│   ├── hooks/            # Custom React hooks
│   │   ├── useAuth.js
│   │   └── useBusinessSearch.js
│   ├── stores/           # Zustand state management
│   │   └── useStore.js
│   ├── lib/              # Utility libraries
│   │   ├── pocketbase.js
│   │   ├── foursquare.js
│   │   └── utils.js
│   ├── App.jsx           # Main app component
│   ├── main.jsx          # App entry point
│   └── index.css         # Global styles
├── pocketbase/           # PocketBase backend
│   ├── pb_schema.json    # Database schema
│   └── README.md         # PocketBase setup guide
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - UI component library
- **React Router** - Client-side routing
- **Zustand** - State management
- **React Hook Form + Zod** - Form handling and validation
- **Leaflet + React Leaflet** - Interactive maps
- **Recharts** - Data visualization

### Backend
- **PocketBase** - Backend as a Service (BaaS)
  - Authentication
  - Database (SQLite)
  - Real-time subscriptions
  - File storage

### External APIs
- **Foursquare Places API** - Business data and search

## 📊 Database Schema

### Collections

#### users (auth)
- `id` - Auto-generated
- `email` - User email
- `name` - User name
- `avatar` - Profile picture
- `company` - Company name

#### searches
- `user` - Relation to users
- `query` - Search query
- `location` - Search location
- `latitude`, `longitude` - Coordinates
- `radius` - Search radius (meters)
- `categories` - Selected categories (JSON)
- `results_count` - Number of results found

#### saved_searches
- `user` - Relation to users
- `name` - Custom name for the search
- `query`, `location`, `latitude`, `longitude`, `radius`, `categories` - Search parameters
- `notifications_enabled` - Future feature flag

#### businesses
- `fsq_id` - Foursquare Place ID (unique)
- `name` - Business name
- `address` - Full address
- `latitude`, `longitude` - Coordinates
- `categories` - Business categories (JSON)
- `phone`, `email` - Contact information
- `raw_data` - Full API response (JSON)

## 🎨 Design System

### Colors
- **Primary**: Purple (#7C3AED) - Brand color
- **Background**: Dark theme (#0A0A0A, #1A1A1A)
- **Text**: White/Gray variants
- **Accent**: Purple variants for interactive elements

### Typography
- **Font**: System fonts (San Francisco, Segoe UI, etc.)
- **Headings**: Bold, various sizes
- **Body**: Regular, 14-16px

## 🔒 Security

- **Authentication**: PocketBase handles secure auth with JWT tokens
- **API Keys**: Stored in environment variables, never committed
- **Data Access**: Row-level security rules in PocketBase
- **HTTPS**: Use in production for secure data transmission

## 📝 Usage Guide

### 1. Sign Up / Login
- Create an account or log in with existing credentials
- Minimum 8-character password required

### 2. Search for Businesses
- Navigate to the **Search** page
- Enter location (or use current location)
- Optionally add business type and categories
- Select search radius (1-25 km)
- Click "Search Businesses"

### 3. View Results
- Results displayed on map and in list/grid view
- Click markers or cards to view details
- Copy contact information
- Export results to CSV

### 4. Manage Searches
- **History**: Review past searches, re-run or delete
- **Saved Searches**: Save frequent search configurations for quick access

### 5. Dashboard
- View total searches and businesses found
- Analyze search activity trends
- Review recent activity

## 🚢 Deployment

### Frontend (Vercel/Netlify)

1. Build the app:
   ```bash
   npm run build
   ```

2. Deploy the `dist` folder to your hosting provider

3. Set environment variables in your hosting dashboard

### Backend (PocketBase)

1. Deploy PocketBase to a VPS or cloud provider
2. Use a process manager (PM2, systemd) to keep it running
3. Set up a reverse proxy (nginx) for HTTPS
4. Update `VITE_POCKETBASE_URL` to your production URL

Example nginx config:
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;
    
    location / {
        proxy_pass http://127.0.0.1:8090;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 🧪 Development

### Run development server
```bash
npm run dev
```

### Build for production
```bash
npm run build
```

### Preview production build
```bash
npm run preview
```

### Lint code
```bash
npm run lint
```

## 🐛 Troubleshooting

### PocketBase connection issues
- Ensure PocketBase is running on port 8090
- Check `VITE_POCKETBASE_URL` in `.env`
- Verify admin account is created

### Foursquare API errors
- Verify API key is correct in `.env`
- Check you haven't exceeded rate limits (50k/month free tier)
- Ensure coordinates are valid (latitude: -90 to 90, longitude: -180 to 180)

### Map not loading
- Check browser console for errors
- Verify Leaflet CSS is loaded in `index.html`
- Ensure coordinates are valid

### Location permission denied
- Browser blocked geolocation access
- Use HTTPS in production (required for geolocation)
- Manually enter location coordinates

## 🎯 Future Enhancements

### Phase 4: Advanced Features
- [ ] Email notifications for saved searches
- [ ] Contact form templates
- [ ] CRM integration (HubSpot, Salesforce)
- [ ] Team collaboration features
- [ ] Advanced analytics and reporting

### Phase 5: Premium Features
- [ ] Bulk operations
- [ ] AI-powered lead scoring
- [ ] Email campaign builder
- [ ] Mobile app (React Native)
- [ ] White-label solution

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 💬 Support

For issues and questions:
- Open an issue on GitHub
- Contact: support@mapleads.com (if applicable)

## 🙏 Acknowledgments

- [PocketBase](https://pocketbase.io/) - Amazing BaaS solution
- [Foursquare](https://location.foursquare.com/) - Business data API
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful UI components
- [Leaflet](https://leafletjs.com/) - Interactive maps
- [OpenStreetMap](https://www.openstreetmap.org/) - Map tiles

---

**Built with ❤️ by the MapLeads team**
