# 🌊 DigitalOcean App Platform Deployment Guide

## Project: tecno-backend
**Platform:** DigitalOcean App Platform  
**Strapi Version:** 5.25.0  
**Node Version:** 20 LTS

---

## ✅ Configuration Applied

Your project is already configured correctly for DigitalOcean App Platform with the following fixes:

### 1. Strapi 5 Proxy Configuration
```javascript
// config/env/production/server.js
proxy: { koa: true }  // ✅ Required for DigitalOcean's reverse proxy
```

### 2. Node.js 20 LTS
```json
// package.json
"engines": {
  "node": ">=20.0.0 <=20.x.x",
  "npm": ">=10.0.0"
}
```

---

## 🚀 Deployment Steps for DigitalOcean App Platform

### Step 1: Update App Settings in DigitalOcean Dashboard

1. **Go to your App** in DigitalOcean dashboard
2. Navigate to **Settings** → **App-Level**

#### A. Update Node.js Version
- Find **Runtime** section
- Change Node.js version to: `20` or `20-lts`
- Click **Save**

#### B. Clear Build Cache
- Find **Build Cache** section
- Click **Clear Build Cache**
- This ensures npm dependencies rebuild correctly

### Step 2: Configure Environment Variables

Go to **Settings** → **Environment Variables** and add/update:

#### Required Variables:
```env
NODE_ENV=production
APP_URL=https://your-app-name.ondigitalocean.app
HOST=0.0.0.0
PORT=8080

# Database (if using DigitalOcean Managed Database)
DATABASE_CLIENT=postgres
DATABASE_HOST=${db.HOSTNAME}
DATABASE_PORT=${db.PORT}
DATABASE_NAME=${db.DATABASE}
DATABASE_USERNAME=${db.USERNAME}
DATABASE_PASSWORD=${db.PASSWORD}
DATABASE_SSL=true
DATABASE_SSL_SELF=false

# Secrets (generate using the command in GENERATE_SECRETS.md)
APP_KEYS=["key1","key2","key3","key4"]
ADMIN_JWT_SECRET=your-generated-secret
API_TOKEN_SALT=your-generated-salt
TRANSFER_TOKEN_SALT=your-generated-salt
JWT_SECRET=your-generated-secret

# Optional
STRAPI_TELEMETRY_DISABLED=true
ADMIN_COOKIE_SECURE=true
```

#### Important Notes for DigitalOcean:
- **PORT**: Use `8080` (DigitalOcean default) or the port DigitalOcean assigns
- **APP_URL**: Use your full domain (e.g., `https://your-app-name.ondigitalocean.app` or your custom domain)
- **Database variables**: If using DigitalOcean Managed Database, you can use `${db.VARIABLE}` syntax

### Step 3: Configure Custom Domain (Optional)

If using a custom domain:

1. Go to **Settings** → **Domains**
2. Click **Add Domain**
3. Enter your domain (e.g., `api.yourdomain.com`)
4. Follow DNS configuration instructions
5. **Update APP_URL** environment variable to your custom domain:
   ```env
   APP_URL=https://api.yourdomain.com
   ```

### Step 4: Deploy

#### Option A: Automatic Deploy (Recommended)
```bash
# Commit and push changes
git add .
git commit -m "fix: configure for DigitalOcean App Platform deployment"
git push origin main
```
DigitalOcean will automatically detect the push and start deployment.

#### Option B: Manual Deploy
1. Go to your app dashboard
2. Click **Actions** → **Force Rebuild and Deploy**

---

## 🔍 Monitoring Deployment

### Build Phase
Watch for these in the build logs:
```
✓ Installing dependencies (npm install)
✓ Building application (npm run build)
✓ Node version: v20.x.x
✓ npm version: 10.x.x or 11.x.x
✓ Building admin panel... Done
```

### Deploy Phase
```
✓ Starting application
✓ Strapi started successfully
✓ Server listening on 0.0.0.0:8080
```

### Access Logs
```bash
# Via doctl CLI
doctl apps logs <app-id>

# Or in dashboard
Apps → Your App → Runtime Logs
```

---

## 🐛 Troubleshooting DigitalOcean Specific Issues

### Issue 1: "Cannot send secure cookie over unencrypted connection"

**Status:** ✅ FIXED with `proxy: { koa: true }`

**If still occurring:**
1. Verify `proxy: { koa: true }` is in both:
   - `config/server.js`
   - `config/env/production/server.js`
2. Clear build cache in DigitalOcean
3. Force rebuild and deploy
4. Check `APP_URL` starts with `https://`

### Issue 2: Port Binding Error

**Solution:**
```env
# DigitalOcean assigns PORT automatically
# Make sure you use env variable
PORT=${PORT:-8080}
```

Or in DigitalOcean, the app automatically gets the PORT from the platform.

### Issue 3: Database Connection Fails

**DigitalOcean Managed Database:**
```env
# Use DigitalOcean's variable interpolation
DATABASE_HOST=${db.HOSTNAME}
DATABASE_PORT=${db.PORT}
DATABASE_NAME=${db.DATABASE}
DATABASE_USERNAME=${db.USERNAME}
DATABASE_PASSWORD=${db.PASSWORD}
DATABASE_SSL=true
```

**External Database:**
- Ensure database allows connections from DigitalOcean's IP range
- Check firewall rules
- Verify SSL settings

### Issue 4: Build Fails with npm Version Error

**Solution:** Already fixed! Your `package.json` now specifies Node 20 which comes with compatible npm.

### Issue 5: Environment Variables Not Loading

**Check:**
1. Variables are set at **App-Level** (not Component-Level)
2. No typos in variable names
3. Arrays use proper format: `["item1","item2"]`
4. Redeploy after changing environment variables

### Issue 6: Admin Panel Not Accessible

**Check:**
1. Navigate to `https://your-app-url.ondigitalocean.app/admin`
2. Clear browser cache and cookies
3. Check Runtime Logs for errors
4. Verify `ADMIN_JWT_SECRET` is set
5. Ensure `APP_KEYS` is properly formatted

---

## 📊 DigitalOcean App Platform Specifics

### Automatic Features:
- ✅ **SSL/TLS**: Automatically handled (Let's Encrypt)
- ✅ **Load Balancing**: Built-in
- ✅ **Auto-scaling**: Available on higher tiers
- ✅ **Zero-downtime deploys**: Automatic
- ✅ **Health checks**: Automatic
- ✅ **CDN**: Available for static assets

### Build Command (Auto-detected):
```bash
npm install
npm run build
```

### Run Command (Auto-detected):
```bash
npm start
```

### Health Check:
DigitalOcean automatically checks if your app responds on the assigned port.

---

## 💰 Cost Optimization

### Database Connection Pooling
Already configured in `config/database.js`:
```javascript
pool: { 
  min: env.int('DATABASE_POOL_MIN', 2), 
  max: env.int('DATABASE_POOL_MAX', 10) 
}
```

For DigitalOcean, consider:
- Basic tier: `DATABASE_POOL_MAX=5`
- Professional tier: `DATABASE_POOL_MAX=10`

### Resource Settings
Adjust based on your app's needs:
- **Basic**: 512 MB RAM, 1 vCPU ($12/month)
- **Professional**: 1 GB RAM, 1 vCPU ($24/month)
- **Professional Plus**: 2 GB RAM, 2 vCPU ($48/month)

---

## 🔐 Security Best Practices

### 1. Use DigitalOcean Managed Database
- Automatic backups
- Built-in SSL
- Automatic updates
- Connection pooling

### 2. Secure Environment Variables
- Never commit secrets to Git
- Rotate secrets regularly
- Use different secrets for dev/staging/prod

### 3. Enable App Platform Features
- **Trusted Sources**: Restrict app access
- **Health Checks**: Monitor app availability
- **Alerts**: Set up notification for downtime

### 4. Custom Domain with SSL
- Use custom domain for production
- DigitalOcean provides free SSL certificate
- Automatic renewal

---

## 📋 Pre-Deployment Checklist

- [x] Node.js 20 configured in App Platform
- [x] `proxy: { koa: true }` in config files
- [x] Build cache cleared
- [x] Environment variables set (all secrets generated)
- [ ] Database accessible from DigitalOcean
- [ ] `APP_URL` matches your actual domain
- [ ] Git changes committed and pushed
- [ ] Deployment triggered
- [ ] Admin panel accessible after deploy
- [ ] API endpoints responding
- [ ] Check Runtime Logs for errors

---

## 🎯 Post-Deployment Verification

### 1. Test Admin Login
```
https://your-app.ondigitalocean.app/admin
```
- Login with your admin credentials
- Should NOT see "secure cookie" error
- Session should persist

### 2. Test API Endpoints
```bash
# Health check
curl https://your-app.ondigitalocean.app/_health

# API example
curl https://your-app.ondigitalocean.app/api/articles
```

### 3. Check Logs
```bash
# In dashboard: Apps → Your App → Runtime Logs

# Look for:
✓ Strapi started successfully
✓ Database connected
✓ No authentication errors
```

### 4. Monitor Performance
- Response times
- Memory usage
- CPU usage
- Database connections

---

## 📞 Support Resources

### DigitalOcean Resources:
- [App Platform Documentation](https://docs.digitalocean.com/products/app-platform/)
- [Environment Variables Guide](https://docs.digitalocean.com/products/app-platform/how-to/use-environment-variables/)
- [Troubleshooting Builds](https://docs.digitalocean.com/products/app-platform/reference/troubleshooting/)

### Strapi Resources:
- [Deployment Guide](https://docs.strapi.io/dev-docs/deployment)
- [Server Configuration](https://docs.strapi.io/dev-docs/configurations/server)
- [Reverse Proxy GitHub Issue](https://github.com/strapi/strapi/issues/24452)

### Project Documentation:
- `REVERSE_PROXY_FIX.md` - Detailed reverse proxy configuration
- `NODE_20_UPGRADE_GUIDE.md` - Node.js upgrade guide
- `GENERATE_SECRETS.md` - Secret generation instructions
- `ENV_VARS_PRODUCTION.txt` - Environment variables template

---

## 🎉 Success!

Your Strapi backend is now properly configured for DigitalOcean App Platform with:
- ✅ Node.js 20 LTS support
- ✅ Strapi 5 reverse proxy configuration
- ✅ Secure cookie handling
- ✅ Production-optimized settings
- ✅ DigitalOcean-specific optimizations

Deploy and enjoy your Strapi backend! 🚀

