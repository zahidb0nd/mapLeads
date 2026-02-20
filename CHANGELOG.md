# Changelog

All notable changes to MapLeads will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-02-19

### Added
- Initial release of MapLeads MVP
- User authentication (signup/login) with PocketBase
- Business search using Geoapify Places API
- Interactive map view with Leaflet
- Filter businesses without websites
- Advanced search filters (location, radius, categories)
- Geolocation support
- Search history tracking
- Saved searches feature
- CSV export functionality
- Dashboard with analytics and charts
- Dark theme UI with purple accent (#7C3AED)
- Responsive design for mobile, tablet, and desktop
- Complete documentation (README, SETUP_GUIDE, CONTRIBUTING)

### Technical Stack
- React 18.2.0
- Vite 5.1.0
- Tailwind CSS 3.4.1
- PocketBase 0.21.1
- Zustand 4.5.0
- React Router 6.22.0
- Leaflet 1.9.4
- Recharts 2.12.0

### Collections
- users (auth collection)
- searches (search history)
- saved_searches (saved search configurations)
- businesses (cached business data)

## [Unreleased]

### Planned Features
- Email notifications for saved searches
- Contact form templates
- CRM integration
- Team collaboration
- Advanced analytics
- Bulk operations
- AI-powered lead scoring
- Mobile app

---

For a complete list of changes, see the [commit history](https://github.com/yourusername/mapleads/commits/).
