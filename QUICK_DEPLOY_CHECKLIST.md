# 🚀 Quick Production Deployment Checklist

## ✅ Local Changes Complete
All necessary fixes have been applied to the codebase.

### Critical Fixes Applied:
1. ✅ **Node.js 20 LTS** - Updated engine requirements
2. ✅ **Strapi 5 Proxy Syntax** - Changed `proxy: true` → `proxy: { koa: true}`
3. ✅ **Production Admin Config** - Optimized cookie settings for reverse proxy
4. ✅ **Reverse Proxy Support** - Fixed "Cannot send secure cookie" error

## 📋 Pre-Deployment Steps

### 1. Commit Changes
```bash
git add .
git commit -m "fix: upgrade to Node.js 20 LTS and fix production config"
git push origin main
```

### 2. Configure Production Environment

#### Update Node.js Version in Your Platform:

**DigitalOcean App Platform:**
- Dashboard → Your App → Settings → App-Level
- Runtime → Node.js Version: `20` or `20-lts`
- Clear Build Cache (Settings → Build Cache → Clear)
- Save

**Heroku:**
```bash
# Already configured via package.json engines field
# Optionally clear cache:
heroku repo:purge_cache -a your-app-name
```

**Render/Railway:**
- Reads from `package.json` engines automatically
- May need to trigger manual redeploy

**VPS/EC2:**
```bash
# SSH into server
ssh your-server

# Install Node 20 using nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20
nvm alias default 20

# Verify
node -v  # Should show v20.x.x
npm -v   # Should show 10.x.x or 11.x.x
```

### 3. Verify Environment Variables

Ensure these are set in your production platform:

**Critical Variables:**
```env
NODE_ENV=production
APP_URL=https://your-domain.com
APP_KEYS=[your,app,keys]
HOST=0.0.0.0
PORT=1337

DATABASE_CLIENT=postgres
DATABASE_HOST=your-db-host
DATABASE_PORT=5432
DATABASE_NAME=your-db-name
DATABASE_USERNAME=your-db-user
DATABASE_PASSWORD=your-db-pass
DATABASE_SSL=true

ADMIN_JWT_SECRET=your-secret
API_TOKEN_SALT=your-salt
TRANSFER_TOKEN_SALT=your-salt
JWT_SECRET=your-secret
```

## 🔄 Deploy

### Option A: Automatic (Git Push)
```bash
git push origin main
# Platform automatically deploys
```

### Option B: Manual Deploy
```bash
# On server
cd /path/to/tecno-backend
git pull origin main
rm -rf node_modules package-lock.json .cache build
npm install
npm run build
pm2 restart tecno-backend  # or your process manager
```

## ✅ Post-Deployment Verification

### 1. Check Build Logs
Look for:
- ✅ Node.js version: v20.x.x
- ✅ npm version: 10.x.x or 11.x.x
- ✅ "Building admin panel" completed successfully
- ✅ No errors during npm install

### 2. Test Application
```bash
# Check health
curl https://your-domain.com/_health

# Check admin (in browser)
https://your-domain.com/admin

# Check API
curl https://your-domain.com/api/articles
```

### 3. Monitor Logs
Check for:
- ✅ "Strapi started successfully"
- ✅ No database connection errors
- ✅ No module/dependency errors

## 🐛 Troubleshooting

### Build fails with "Module not found"
```bash
# In platform dashboard/settings:
1. Clear build cache
2. Redeploy
```

### Still shows npm version error
```bash
# Verify Node version in platform:
1. Check platform settings show Node 20
2. Clear build cache
3. Force redeploy
```

### Database connection issues
```bash
# Verify environment variables:
- DATABASE_SSL=true
- DATABASE_HOST (correct)
- DATABASE_PASSWORD (no special chars issues)
```

## 📊 Expected Deployment Time
- Build: 2-5 minutes
- Start: 10-30 seconds
- Total: ~5 minutes

## 📞 Support
If deployment fails, check:
1. `NODE_20_UPGRADE_GUIDE.md` - Detailed upgrade instructions
2. `DEPLOYMENT_FIXES.md` - Complete issue analysis
3. Platform logs for specific errors

---

**Status**: Ready for deployment ✅  
**Node Version**: 20 LTS  
**npm Version**: 10+  
**Last Updated**: October 28, 2025

