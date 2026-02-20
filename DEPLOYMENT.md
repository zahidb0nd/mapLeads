# Deployment Guide

This guide covers deploying MapLeads to production.

## Table of Contents
- [Overview](#overview)
- [Frontend Deployment](#frontend-deployment)
- [Backend Deployment](#backend-deployment)
- [Environment Variables](#environment-variables)
- [Post-Deployment](#post-deployment)

## Overview

MapLeads consists of two parts:
1. **Frontend** - React app (static files)
2. **Backend** - PocketBase (API + Database)

We'll deploy them separately for best performance and scalability.

## Frontend Deployment

### Option 1: Vercel (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Build the app**
   ```bash
   npm run build
   ```

3. **Deploy**
   ```bash
   vercel
   ```

4. **Set environment variables in Vercel dashboard**
   - Go to your project settings
   - Add environment variables:
     - `VITE_POCKETBASE_URL`: Your PocketBase production URL
     - `VITE_GEOAPIFY_API_KEY`: Your Geoapify API key
     - `VITE_APP_NAME`: MapLeads
     - `VITE_APP_URL`: Your production URL

5. **Redeploy after setting variables**
   ```bash
   vercel --prod
   ```

### Option 2: Netlify

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Build the app**
   ```bash
   npm run build
   ```

3. **Deploy**
   ```bash
   netlify deploy --prod --dir=dist
   ```

4. **Set environment variables**
   - Go to Site Settings → Environment Variables
   - Add the same variables as Vercel

### Option 3: GitHub Pages

1. **Install gh-pages**
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Add to package.json**
   ```json
   {
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d dist"
     },
     "homepage": "https://yourusername.github.io/mapleads"
   }
   ```

3. **Update vite.config.js**
   ```js
   export default defineConfig({
     base: '/mapleads/',
     // ... rest of config
   })
   ```

4. **Deploy**
   ```bash
   npm run deploy
   ```

## Backend Deployment (PocketBase)

### Option 1: VPS (DigitalOcean, Linode, etc.)

1. **Create a VPS**
   - Choose Ubuntu 22.04 LTS
   - Minimum: 1GB RAM, 1 CPU

2. **SSH into your server**
   ```bash
   ssh root@your-server-ip
   ```

3. **Install required packages**
   ```bash
   apt update
   apt install -y nginx certbot python3-certbot-nginx
   ```

4. **Download PocketBase**
   ```bash
   cd /opt
   wget https://github.com/pocketbase/pocketbase/releases/download/v0.21.1/pocketbase_0.21.1_linux_amd64.zip
   unzip pocketbase_0.21.1_linux_amd64.zip
   chmod +x pocketbase
   ```

5. **Create systemd service**
   ```bash
   nano /etc/systemd/system/pocketbase.service
   ```
   
   Add:
   ```ini
   [Unit]
   Description=PocketBase
   After=network.target

   [Service]
   Type=simple
   User=root
   WorkingDirectory=/opt
   ExecStart=/opt/pocketbase serve --http=127.0.0.1:8090
   Restart=always
   RestartSec=5

   [Install]
   WantedBy=multi-user.target
   ```

6. **Start PocketBase**
   ```bash
   systemctl enable pocketbase
   systemctl start pocketbase
   systemctl status pocketbase
   ```

7. **Configure Nginx**
   ```bash
   nano /etc/nginx/sites-available/pocketbase
   ```
   
   Add:
   ```nginx
   server {
       listen 80;
       server_name api.yourdomain.com;

       location / {
           proxy_pass http://127.0.0.1:8090;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```

8. **Enable site**
   ```bash
   ln -s /etc/nginx/sites-available/pocketbase /etc/nginx/sites-enabled/
   nginx -t
   systemctl restart nginx
   ```

9. **Setup SSL with Let's Encrypt**
   ```bash
   certbot --nginx -d api.yourdomain.com
   ```

10. **Import schema**
    - Go to https://api.yourdomain.com/_/
    - Create admin account
    - Import `pb_schema.json`

### Option 2: PocketHost (Easiest)

1. Go to [pockethost.io](https://pockethost.io)
2. Create account and new instance
3. Upload `pb_schema.json`
4. Use provided URL in your frontend environment variables

### Option 3: Railway

1. Go to [railway.app](https://railway.app)
2. Create new project
3. Deploy from GitHub or upload PocketBase
4. Add environment variables
5. Get public URL

## Environment Variables

### Frontend (.env)
```env
VITE_POCKETBASE_URL=https://api.yourdomain.com
VITE_GEOAPIFY_API_KEY=your_production_api_key
VITE_APP_NAME=MapLeads
VITE_APP_URL=https://yourdomain.com
```

### Backend (PocketBase)
Set via systemd service or hosting platform environment variables.

## Post-Deployment Checklist

- [ ] Frontend is accessible via HTTPS
- [ ] Backend is accessible via HTTPS
- [ ] CORS is configured correctly in PocketBase
- [ ] API keys are set correctly
- [ ] Database schema is imported
- [ ] Admin account is created
- [ ] Test signup/login works
- [ ] Test search functionality
- [ ] Test data persistence
- [ ] Monitor logs for errors
- [ ] Set up backups (PocketBase data)
- [ ] Configure monitoring/alerts

## Security Best Practices

1. **Use HTTPS everywhere**
   - Frontend and backend must use SSL
   - Use Let's Encrypt for free certificates

2. **Secure PocketBase**
   - Change default admin password
   - Enable HTTPS only
   - Configure CORS properly
   - Regular backups of `pb_data`

3. **API Keys**
   - Never commit API keys
   - Use environment variables
   - Rotate keys periodically

4. **Monitoring**
   - Set up error logging (Sentry, LogRocket)
   - Monitor API usage (Geoapify limits)
   - Track uptime (UptimeRobot, Pingdom)

## Backup Strategy

### PocketBase Data
```bash
# Create backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
tar -czf /backups/pb_data_$DATE.tar.gz /opt/pb_data

# Keep only last 30 days
find /backups -name "pb_data_*.tar.gz" -mtime +30 -delete
```

Add to crontab:
```bash
crontab -e
# Add: 0 2 * * * /path/to/backup-script.sh
```

## Scaling Considerations

### When to Scale
- > 1000 users
- > 10,000 searches/day
- Response time > 2s

### How to Scale
1. **Horizontal**: Multiple PocketBase instances with load balancer
2. **Vertical**: Upgrade server resources
3. **Database**: Migrate to PostgreSQL/MySQL
4. **CDN**: Use CloudFront/Cloudflare for frontend
5. **Caching**: Redis for API responses

## Monitoring

### Tools
- **Uptime**: UptimeRobot, Pingdom
- **Logs**: Papertrail, Loggly
- **Errors**: Sentry
- **Analytics**: Google Analytics, Plausible

### Metrics to Track
- API response times
- Error rates
- User signups
- Search volumes
- Geoapify API usage

## Troubleshooting

### Frontend not loading
- Check build logs
- Verify environment variables
- Check browser console

### Backend connection errors
- Verify PocketBase is running
- Check firewall rules
- Verify CORS settings

### API errors
- Check Geoapify API limits (3,000 req/day on free tier)
- Verify API key is valid
- Check rate limiting

## Support

For deployment issues:
- Check logs first
- Review this guide
- Open GitHub issue
- Contact support

---

**Need help?** Open an issue with your deployment platform and error details.
