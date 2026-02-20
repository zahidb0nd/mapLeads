# MapLeads Setup Guide

Complete step-by-step guide to get MapLeads running on your machine.

## 📋 Prerequisites Checklist

Before you begin, make sure you have:

- [ ] Node.js 18 or higher installed
- [ ] npm or yarn package manager
- [ ] A code editor (VS Code recommended)
- [ ] A modern web browser
- [ ] Terminal/Command Prompt access

## 🔧 Step 1: Install Node.js

If you don't have Node.js installed:

1. Visit [nodejs.org](https://nodejs.org/)
2. Download the LTS version
3. Install and verify:
   ```bash
   node --version  # Should show v18.x.x or higher
   npm --version   # Should show 9.x.x or higher
   ```

## 📦 Step 2: Install Project Dependencies

1. Open terminal in the project directory
2. Run:
   ```bash
   npm install
   ```
3. Wait for all packages to download and install

## 🔑 Step 3: Get Foursquare API Key

### Create Foursquare Developer Account

1. Go to [Foursquare Developer Portal](https://location.foursquare.com/developer/)
2. Click "Sign Up" or "Log In"
3. Complete registration
4. Verify your email address

### Create a New Project

1. Once logged in, click "Create a New Project"
2. Fill in project details:
   - **Project Name**: MapLeads
   - **Description**: Local business lead generator
   - **Project Type**: Web Application
3. Click "Create Project"

### Get Your API Key

1. In your project dashboard, find the API key section
2. Copy your API key (it should start with `fsq3...`)
3. Keep this key safe - you'll need it next

### API Key Pricing

- **Free Tier**: 50,000 API calls per month
- **No credit card required** for free tier
- Perfect for testing and small-scale usage

## ⚙️ Step 4: Configure Environment Variables

1. Open the `.env` file in the project root
2. Add your Foursquare API key:
   ```env
   VITE_POCKETBASE_URL=http://127.0.0.1:8090
   VITE_FOURSQUARE_API_KEY=fsq3YOUR_API_KEY_HERE
   VITE_APP_NAME=MapLeads
   VITE_APP_URL=http://localhost:3000
   ```
3. Save the file

⚠️ **Important**: Never commit your `.env` file to version control!

## 🗄️ Step 5: Set Up PocketBase

### Download PocketBase

1. Visit [pocketbase.io/docs](https://pocketbase.io/docs/)
2. Download the version for your operating system:
   - **Windows**: pocketbase_x.x.x_windows_amd64.zip
   - **macOS**: pocketbase_x.x.x_darwin_amd64.zip (Intel) or darwin_arm64 (Apple Silicon)
   - **Linux**: pocketbase_x.x.x_linux_amd64.zip

### Install PocketBase

1. Extract the downloaded zip file
2. You'll get a single executable file named `pocketbase` (or `pocketbase.exe` on Windows)
3. Move this file to the `pocketbase` folder in your project:
   ```
   mapleads/
   └── pocketbase/
       ├── pocketbase (or pocketbase.exe)
       ├── pb_schema.json
       └── README.md
   ```

### Start PocketBase

#### On Windows:
```bash
cd pocketbase
./pocketbase.exe serve
```

#### On macOS/Linux:
```bash
cd pocketbase
chmod +x pocketbase  # Make it executable (first time only)
./pocketbase serve
```

### Create Admin Account

1. PocketBase will start and show you a URL: `http://127.0.0.1:8090`
2. Open this URL in your browser
3. You'll see "Admin UI"
4. Click "Create Admin Account"
5. Fill in:
   - **Email**: your.email@example.com
   - **Password**: Choose a strong password (min 8 characters)
6. Click "Create and Login"

### Import Database Schema

#### Option 1: Automatic (Recommended)
The schema will be automatically created when you first run the app and sign up.

#### Option 2: Manual Import
1. In the PocketBase Admin UI, go to "Settings"
2. Click "Import collections"
3. Click "Load from JSON file"
4. Select the `pocketbase/pb_schema.json` file
5. Click "Review" then "Confirm import"

### Verify PocketBase Setup

You should see 4 collections:
- ✅ users (auth)
- ✅ searches
- ✅ saved_searches
- ✅ businesses

## 🚀 Step 6: Start the Application

1. Open a **new terminal window** (keep PocketBase running in the first one)
2. Navigate to the project root directory
3. Run:
   ```bash
   npm run dev
   ```
4. Wait for Vite to start
5. Open your browser to: `http://localhost:3000`

You should see the MapLeads login page! 🎉

## 👤 Step 7: Create Your First User Account

1. On the login page, click "Sign up"
2. Fill in:
   - **Name**: Your name
   - **Email**: your.email@example.com
   - **Password**: Min 8 characters
   - **Confirm Password**: Same as above
3. Click "Create Account"
4. You'll be automatically logged in and redirected to the Dashboard

## 🔍 Step 8: Test Your First Search

1. Click "Search" in the sidebar
2. In the search form:
   - **Business Type**: Leave empty or type "restaurant"
   - **Location**: Click the location icon 📍 to use your current location
     - Or manually enter: "New York, NY" or any city/address
   - **Search Radius**: Keep default (5 km)
   - **Categories**: Optionally select some categories
3. Click "Search Businesses"
4. Wait for results to load
5. You should see:
   - Businesses on the map
   - Business cards in the results list
   - All businesses shown have **no website** ✅

## ✅ Verification Checklist

Make sure everything is working:

- [ ] PocketBase is running on port 8090
- [ ] Frontend is running on port 3000
- [ ] You can log in successfully
- [ ] Dashboard shows your stats
- [ ] Search returns results
- [ ] Map displays business markers
- [ ] Business details modal opens
- [ ] CSV export works
- [ ] Search history is saved
- [ ] Saved searches can be created

## 🐛 Common Issues & Solutions

### Issue: "Cannot connect to PocketBase"
**Solution**: 
- Ensure PocketBase is running in a separate terminal
- Check that it's on port 8090
- Verify `VITE_POCKETBASE_URL` in `.env`

### Issue: "Foursquare API error"
**Solution**:
- Verify your API key in `.env`
- Check you copied the entire key (starts with `fsq3`)
- Ensure you haven't exceeded the free tier limit (50k calls/month)
- Try restarting the dev server after adding the key

### Issue: "No results found"
**Solution**:
- Try a different location
- Increase the search radius
- Remove category filters
- Check browser console for errors

### Issue: "Location permission denied"
**Solution**:
- Allow location access in your browser settings
- Or manually enter coordinates/address

### Issue: Map not loading
**Solution**:
- Check browser console for errors
- Ensure you have an internet connection (map tiles load from OpenStreetMap)
- Clear browser cache and reload

### Issue: Port 3000 or 8090 already in use
**Solution**:
```bash
# Kill the process using the port (macOS/Linux)
lsof -ti:3000 | xargs kill -9
lsof -ti:8090 | xargs kill -9

# Or use different ports
# For frontend: npm run dev -- --port 3001
# For PocketBase: ./pocketbase serve --http=127.0.0.1:8091
```

## 🔄 Starting MapLeads After Initial Setup

Every time you want to use MapLeads:

1. **Terminal 1** - Start PocketBase:
   ```bash
   cd pocketbase
   ./pocketbase serve
   ```

2. **Terminal 2** - Start Frontend:
   ```bash
   npm run dev
   ```

3. **Browser** - Open:
   ```
   http://localhost:3000
   ```

## 💡 Pro Tips

### Tip 1: Use VS Code Extensions
- ESLint - Code quality
- Prettier - Code formatting
- Tailwind CSS IntelliSense - CSS autocomplete

### Tip 2: Keep Terminals Organized
- Use a terminal multiplexer like tmux (Linux/macOS) or Windows Terminal tabs
- Label terminals: "PocketBase" and "Frontend"

### Tip 3: Bookmark Admin URLs
- PocketBase Admin: http://127.0.0.1:8090/_/
- Frontend: http://localhost:3000

### Tip 4: Save Frequent Searches
Use the "Saved Searches" feature to quickly re-run common search configurations.

### Tip 5: Export Data Regularly
Export search results to CSV for offline analysis and outreach campaigns.

## 📚 Next Steps

Now that MapLeads is running:

1. ✅ Explore all features (Dashboard, Search, History, Saved Searches)
2. ✅ Test with different locations and business types
3. ✅ Export some results to CSV
4. ✅ Check the main README.md for advanced features
5. ✅ Start finding leads! 🎯

## 🆘 Need Help?

If you're stuck:

1. Check this guide again carefully
2. Review error messages in the terminal
3. Check browser console (F12) for errors
4. Read the main [README.md](./README.md)
5. Open an issue on GitHub with:
   - Your operating system
   - Node.js version
   - Error messages (screenshots help!)
   - Steps you've already tried

## 🎉 Success!

If you've made it this far and everything is working, congratulations! 🎊

You now have a fully functional lead generation tool. Happy hunting for businesses without websites!

---

**Questions?** Open an issue or check the main README.md for more information.
