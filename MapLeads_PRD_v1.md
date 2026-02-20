# MapLeads — Product Requirements Document

> **Find businesses with no website. Turn them into clients.**

| Version | Status | Date | Author |
|---------|--------|------|--------|
| 1.0.0 | Draft | February 2026 | Product Team |

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [Goals & Success Metrics](#2-goals--success-metrics)
3. [Target Users](#3-target-users)
4. [Technical Architecture](#4-technical-architecture)
5. [Feature Specifications](#5-feature-specifications)
6. [Design & UX Specifications](#6-design--ux-specifications)
7. [Data Model](#7-data-model-pocketbase-collections)
8. [API & Integrations](#8-api--integrations)
9. [Non-Functional Requirements](#9-non-functional-requirements)
10. [Milestones & Build Order](#10-milestones--build-order)
11. [Out of Scope (v1)](#11-out-of-scope-v1)
12. [Open Questions](#12-open-questions)

---

## 1. Product Overview

MapLeads is a SaaS web application that helps freelancers, agencies, and sales teams discover local businesses listed on Google Maps that do not have a website. These businesses represent high-value leads for web design, digital marketing, and other service providers. Users can search by any city or locality, filter results, track leads, and export data — all within a sleek, dark-themed interface.

### 1.1 Problem Statement

Millions of local businesses are listed on Google Maps but have no online presence. Identifying them manually is tedious and time-consuming. MapLeads automates this discovery, giving service providers a targeted, actionable list of prospects in minutes.

### 1.2 Vision

To become the go-to prospecting tool for web professionals who want to grow their client base by targeting the most conversion-ready local business segment: businesses with no website.

---

## 2. Goals & Success Metrics

### 2.1 Primary Goals

- Enable users to search any city or locality and retrieve businesses with no website from Google Maps
- Provide robust filtering to narrow results by category, rating, and more
- Allow users to save searches, track history, and export leads as CSV
- Deliver a premium dark-themed UI that feels fast, modern, and professional

### 2.2 Success Metrics

| Metric | Target |
|--------|--------|
| Time to first search result | < 10 seconds |
| Search accuracy (no-website filter) | > 90% precision |
| User retention (30-day) | > 60% |
| Export success rate | > 99% |
| Page load time | < 2 seconds (LCP) |

---

## 3. Target Users

### Persona 1 — Freelance Web Designer

A solo designer looking to pitch website builds to local businesses. Wants a fast way to generate a cold-outreach list for a specific town or neighbourhood.

### Persona 2 — Digital Marketing Agency

A small agency with a sales team. Multiple users need to search different cities, save searches, and share lead lists without duplicating work.

### Persona 3 — Sales Development Representative

An SDR at a web-services company with a quota of qualified local business leads per week. Needs filtering and CSV export to feed data into their CRM.

---

## 4. Technical Architecture

### 4.1 Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Frontend | React + Vite | TypeScript, Tailwind CSS |
| Backend / BaaS | PocketBase | Auth, database, file storage |
| Data Source | Google Maps / Places API | Via server-side proxy to protect API key |
| Deployment | Vercel (frontend) / Fly.io or Railway (PocketBase) | Netlify is an acceptable alternative for frontend |
| Styling | Tailwind CSS | Dark theme, purple accent (#7C3AED) |
| Export | Papa Parse / custom CSV builder | Client-side CSV generation |

### 4.2 Architecture Notes

- PocketBase serves as the all-in-one backend: user authentication, database (SQLite), real-time updates, and file storage.
- Google Places API calls must be proxied through a PocketBase custom endpoint or serverless function to keep the API key server-side only.
- The frontend is a single-page application (SPA) deployed to Vercel/Netlify with environment variables for the backend URL.
- **PocketBase requires a persistent server (not serverless)** — deploy to Fly.io, Railway, or a VPS. The frontend goes on Vercel/Netlify; PocketBase goes on Fly.io.

---

## 5. Feature Specifications

### 5.1 User Authentication

Multi-user support with individual accounts. Built entirely on PocketBase's built-in auth system.

- Email + password registration and login
- Email verification on sign-up
- Password reset via email
- JWT-based session management handled by PocketBase SDK
- User profile page (name, email, password change)
- Each user's data (searches, saved searches, history) is scoped to their account only

---

### 5.2 Business Search

The core feature of the product. Users enter a city, town, or locality and the app queries Google Maps for businesses that have no website listed.

**Search Input**
- Free-text location field (e.g. "Austin, TX", "Bandra, Mumbai", "Shoreditch, London")
- Optional business category/type field (e.g. "restaurants", "plumbers", "hair salons")
- Search button with loading state animation

**Search Results**
- Results displayed in a responsive card grid or table (user-togglable)
- Each result card shows: Business Name, Category, Address, Phone Number, Google Maps Rating, Number of Reviews, Google Maps URL
- Businesses are pre-filtered to only show those with no website in their Google Maps listing
- Pagination or infinite scroll for large result sets
- Empty state message when no results are found

---

### 5.3 Business Filtering

Applied after results are fetched to let users narrow down to the most relevant leads.

- Filter by business category / type
- Filter by minimum Google rating (e.g. 3.5+ stars)
- Filter by minimum number of reviews (social proof indicator)
- Sort by: Rating (high to low), Number of Reviews, Alphabetical
- All filters apply instantly (client-side) without re-fetching

---

### 5.4 Search History

Automatically logged per user so they can revisit previous searches without re-running them.

- Every search is saved to the user's history in PocketBase
- History page shows: Location searched, Category (if used), Date/time, Number of results
- Click any history item to view the saved results snapshot
- Option to delete individual history entries or clear all history

---

### 5.5 Saved Searches

Users can bookmark a search configuration to re-run it later and discover newly listed businesses.

- Save button on any search results page
- Give the saved search a custom name/label
- Saved Searches page lists all bookmarks with name, location, category, and last-run date
- Re-run a saved search with one click to fetch fresh results
- Delete saved searches individually

---

### 5.6 Dashboard & Analytics

A home screen that gives users a quick snapshot of their activity and overall prospecting progress.

- Total searches run (all time)
- Total businesses discovered (all time)
- Top searched cities / localities
- Recent search history (last 5 entries with quick re-run links)
- Saved searches count and quick-access list
- Visual charts: searches over time (last 30 days bar chart), results by category (pie chart)

---

### 5.7 CSV Export

Users can download the current filtered result set as a CSV file for use in outreach tools or CRMs.

- Export button on the results page
- Exported columns: Business Name, Category, Address, Phone, Rating, Review Count, Google Maps URL
- Filename auto-generated: `mapleads_{location}_{date}.csv`
- Only currently visible/filtered results are exported (not the full unfiltered set unless no filters are active)
- Client-side generation — no server round-trip required

---

## 6. Design & UX Specifications

### 6.1 Design System

| Token | Value | Usage |
|-------|-------|-------|
| Primary / Accent | `#7C3AED` (Purple-600) | CTAs, highlights, active states |
| Primary Dark | `#5B21B6` (Purple-800) | Hover states, borders |
| Background Deep | `#0D0B1A` | App background |
| Background Surface | `#1E1B2E` | Cards, modals, sidebar |
| Background Elevated | `#2D2844` | Input fields, dropdowns |
| Text Primary | `#F9FAFB` | Headings, key labels |
| Text Secondary | `#9CA3AF` | Body copy, metadata |
| Border | `#3B2F6E` | Card borders, dividers |
| Font | Inter (Google Fonts) | All UI text |

### 6.2 Key Screens

- **Login / Register** — centered card on deep background, purple gradient logo mark
- **Dashboard** — sidebar navigation, stat cards at top, chart section, recent history list
- **Search** — prominent search bar with location + category inputs, filter panel (collapsible sidebar or top bar), results grid/table below
- **Search History** — sortable table of past searches, re-run and delete actions
- **Saved Searches** — card grid of bookmarked searches with name and last-run date badge
- **Profile / Settings** — simple form for account details

### 6.3 UX Principles

- **Speed first** — results should appear progressively; show a skeleton loader immediately
- **Dark by default** — no light mode required in v1
- **Minimal friction** — search should be usable in 2 clicks from any screen
- **Accessible** — WCAG AA contrast ratios respected even on dark backgrounds

---

## 7. Data Model (PocketBase Collections)

| Collection | Key Fields | Notes |
|-----------|-----------|-------|
| `users` | email, name | PocketBase built-in auth collection |
| `searches` | user, location, category, result_count, results_json, created | Stores full results snapshot as JSON. One record per search run. |
| `saved_searches` | user, name, location, category, last_run | Bookmark of a search config. `last_run` updated on each re-run. |

---

## 8. API & Integrations

### 8.1 Google Places API

- Use the **Text Search** endpoint to search for businesses by location + type
- Use the **Place Details** endpoint to retrieve full details (phone, rating, website, etc.)
- Filter results where the `website` field is absent or empty
- API key stored as an environment variable on the PocketBase server — never exposed to the client
- Implement request batching and caching (store results in PocketBase for 24 hours) to manage API costs

### 8.2 PocketBase Custom Endpoints

- `POST /api/search` — accepts location + category, calls Google API server-side, returns filtered results, saves to `searches` collection
- Standard PocketBase REST API used for all CRUD on `saved_searches` and `users`

---

## 9. Non-Functional Requirements

### 9.1 Performance

- Initial page load (LCP) under 2 seconds on a standard broadband connection
- Search results rendered within 10 seconds of submission (dependent on Google API response time)
- CSV export completes within 1 second client-side for up to 500 results

### 9.2 Security

- All API keys stored server-side only; never exposed in frontend bundle or network responses
- PocketBase collection rules enforce that users can only read/write their own records
- HTTPS enforced across all environments
- Input sanitisation on location and category fields

### 9.3 Scalability

- PocketBase SQLite is sufficient for up to ~10,000 users and millions of records; migration path to PostgreSQL available if needed
- Google Places API quota management: implement per-user daily search limits to control costs

---

## 10. Milestones & Build Order

Recommended build sequence for use with Claude Code:

| Phase | Milestone | Deliverables |
|-------|-----------|-------------|
| 1 | Foundation | PocketBase setup, user auth (register/login/reset), basic routing, design system & Tailwind config |
| 2 | Core Search | Google Places API proxy, search UI, results display, no-website filter |
| 3 | Filtering & Export | Client-side filters, sort controls, CSV export |
| 4 | History & Saved Searches | Search history log, saved searches CRUD, re-run functionality |
| 5 | Dashboard | Analytics dashboard, charts (Recharts or Chart.js), stat cards |
| 6 | Polish & Deploy | Loading states, error handling, mobile responsiveness, Vercel + Fly.io deployment |

---

## 11. Out of Scope (v1)

- Light mode / theme toggle
- Mobile native app (iOS / Android)
- Built-in email outreach or SMTP sending
- CRM lead status tracking (planned for v2)
- Team / organization workspaces with shared data
- Billing / subscription management (add in v2 if monetising)
- Excel / PDF export (CSV only in v1)

---

## 12. Open Questions

- **Google Places API pricing** — confirm monthly budget and set per-user search limits accordingly before launch.
- **Result caching TTL** — 24-hour cache assumed. Is this acceptable, or should users always get fresh data?
- **Search result cap** — Google Places API returns max 60 results per query. Is this sufficient, or should the app stitch multiple queries together?
- **PocketBase hosting** — Fly.io is recommended for simplicity. Confirm the hosting provider before Phase 1.
- **Monetisation model** — free tier + paid plan? Define limits (e.g. X searches/month free) before public launch.

---

*MapLeads PRD v1.0 · Confidential · Built with Claude Code*
