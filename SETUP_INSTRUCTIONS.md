# MapLeads - PocketBase Setup Instructions

## Step 1: Create Admin Account

A PocketBase admin UI window should have opened at: **http://127.0.0.1:8090/_/**

If not, please open it manually in your browser.

### Create Admin Account:
1. You should see a "Create your first admin" screen
2. Enter the following credentials:
   - **Email:** `admin@mapleads.com`
   - **Password:** `admin123456`
   - **Confirm Password:** `admin123456`
3. Click "Create" or "Save"

### If you already created an admin with different credentials:
Just remember your credentials - you'll need them in Step 2.

---

## Step 2: Run Automated Setup

Once the admin account is created, run this command:

```bash
node setup-pocketbase-auto.js
```

Or if you used different admin credentials, set them as environment variables:

```bash
$env:PB_ADMIN_EMAIL="your@email.com"
$env:PB_ADMIN_PASSWORD="yourpassword"
node setup-pocketbase-auto.js
```

---

## What the Setup Script Will Do:

✅ Authenticate with your admin account
✅ Create 4 collections:
   - **users** (auth collection) - User accounts
   - **searches** (base collection) - Search history
   - **saved_searches** (base collection) - Saved search configurations
   - **businesses** (base collection) - Cached business data

✅ Set up proper permissions and indexes
✅ Verify everything is created correctly

---

## After Setup is Complete:

You can use MapLeads at: **http://localhost:3000**

1. Create a user account (Sign Up)
2. Start searching for businesses without websites!
3. Export results to CSV
4. Save your favorite searches

---

## Troubleshooting:

**Admin UI won't load?**
- Make sure PocketBase is running (check for pocketbase.exe process)
- Try accessing: http://127.0.0.1:8090/_/

**Setup script fails?**
- Verify admin credentials are correct
- Check that PocketBase is running on port 8090
- Look for error messages in the console

**Need help?**
- Check the console output for detailed error messages
- Verify all services are running (PocketBase, Proxy, Vite)
