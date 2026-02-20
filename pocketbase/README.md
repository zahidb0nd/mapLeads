# PocketBase Setup for MapLeads

## Installation

1. Download PocketBase for your operating system from: https://pocketbase.io/docs/

2. Extract the executable to this `pocketbase` folder

3. Start PocketBase:
   ```bash
   # Windows
   ./pocketbase.exe serve

   # macOS/Linux
   ./pocketbase serve
   ```

4. Open the Admin UI at: http://127.0.0.1:8090/_/

5. Create your admin account

## Import Schema

### Option 1: Auto-import (Recommended)
The schema will be automatically created when you first run the application.

### Option 2: Manual Import
1. Go to Settings > Import collections
2. Upload the `pb_schema.json` file
3. Click "Review" and then "Confirm"

## Collections Structure

### users (auth collection)
- Extended user profiles with name, avatar, and company fields
- Email/password authentication enabled

### searches
- Search history for each user
- Stores: query, location, coordinates, radius, categories, results count
- Automatically deleted when user is deleted (cascade)

### saved_searches
- Saved search configurations for quick access
- Includes notification settings for future enhancements
- Unique names per user

### businesses
- Cached business data from Geoapify Places API
- Prevents duplicate API calls
- Stores: Geoapify place ID, name, address, coordinates, categories, contact info

## API Access

PocketBase runs on: `http://127.0.0.1:8090`

### Endpoints
- Auth: `/api/collections/users/auth-with-password`
- CRUD: `/api/collections/{collection}/records`

## Development

The application uses the PocketBase JavaScript SDK for all interactions.
See `src/lib/pocketbase.js` for the client configuration.
