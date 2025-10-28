# Node.js 20 Upgrade Guide for Production

## Issue
Production deployment failing with:
```
npm@11.6.2 is not compatible with Node.js v19.9.0
```

## Root Cause
- Production environment running **Node.js v19.9.0** (EOL, unmaintained)
- npm v11.6.2 requires **Node.js 20+**
- Strapi 5.25.0 officially supports **Node.js 18.x or 20.x** (not 19.x)

## Solution Applied ✅
Updated `package.json` engine requirements:
```json
"engines": {
  "node": ">=20.0.0 <=20.x.x",
  "npm": ">=10.0.0"
}
```

## Production Deployment Steps

### Step 1: Update Node.js Version in Production Environment

#### For DigitalOcean App Platform:
1. Go to your app in DigitalOcean dashboard
2. Navigate to **Settings** → **App-Level**
3. Under **Runtime**, change:
   - **Node.js Version**: `20` or `20-lts`
4. Click **Save**

#### For Heroku:
Add/update in your project root:
```json
// package.json - already updated ✅
"engines": {
  "node": ">=20.0.0 <=20.x.x",
  "npm": ">=10.0.0"
}
```

#### For AWS/EC2/VPS:
```bash
# Using nvm (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20
nvm alias default 20

# Verify versions
node -v  # Should show v20.x.x
npm -v   # Should show 10.x.x or higher
```

#### For Docker:
Update your `Dockerfile`:
```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

RUN npm run build

EXPOSE 1337
CMD ["npm", "start"]
```

### Step 2: Clear Build Cache (if applicable)

#### DigitalOcean:
- Go to **Settings** → **App-Level**
- Find **Build Cache** section
- Click **Clear Build Cache**

#### Heroku:
```bash
heroku repo:purge_cache -a your-app-name
```

#### Manual Deployment:
```bash
# On your server
cd /path/to/tecno-backend
rm -rf node_modules package-lock.json .cache build
npm install
npm run build
```

### Step 3: Redeploy

#### Commit and push changes:
```bash
git add package.json
git commit -m "chore: upgrade to Node.js 20 LTS for production compatibility"
git push origin main
```

The deployment should automatically trigger with Node.js 20.

### Step 4: Verify Deployment

After deployment completes, check:

1. **Application logs** - ensure no errors
2. **Health check endpoint** - verify app is running
3. **Admin panel** - access https://your-domain.com/admin
4. **API endpoints** - test a few endpoints

```bash
# Check Node version on server
ssh your-server
node -v  # Should show v20.x.x
npm -v   # Should show 10.x.x+

# Check app is running
curl http://localhost:1337/_health
```

## Local Development Verification

Your local environment should also use Node.js 20:

```bash
# Check current version
node -v

# If not on Node 20, switch using nvm
nvm install 20
nvm use 20

# Or use the .nvmrc file (already configured)
nvm use

# Reinstall dependencies with Node 20
rm -rf node_modules package-lock.json
npm install

# Test build
npm run build

# Test development server
npm run develop
```

## Why Node.js 20?

### Benefits of Node.js 20 LTS:
- ✅ **Long Term Support** until April 2026
- ✅ **Performance improvements** (20-30% faster in many cases)
- ✅ **Better security** with latest patches
- ✅ **Full Strapi 5 compatibility**
- ✅ **Compatible with npm 10.x and 11.x**
- ✅ **Modern JavaScript features** (ES2023 support)

### Node.js Version Timeline:
| Version | Status | EOL Date |
|---------|--------|----------|
| Node 18 | Maintenance LTS | April 2025 |
| **Node 19** | **❌ EOL** | **June 2023** |
| **Node 20** | **✅ Active LTS** | **April 2026** |
| Node 21 | ❌ EOL | June 2024 |
| Node 22 | Current | April 2027 |

## Troubleshooting

### Issue: "Module not found" after upgrade
```bash
# Clear all caches and reinstall
rm -rf node_modules package-lock.json .cache build
npm install
npm run build
```

### Issue: Native modules fail to compile
```bash
# Rebuild native modules for Node 20
npm rebuild

# If specific module fails (e.g., better-sqlite3)
npm rebuild better-sqlite3
```

### Issue: Production still shows old Node version
- Clear build cache in your platform
- Check platform-specific Node version configuration
- Ensure `.nvmrc` is being read (if supported)
- Restart the application/container

### Issue: npm version mismatch
```bash
# Update npm to latest compatible version
npm install -g npm@latest

# Or specific version
npm install -g npm@10.8.1
```

## Platform-Specific Notes

### DigitalOcean App Platform
- Automatically detects Node version from `package.json` engines
- Supports both `node` version in engines or `.nvmrc`
- Build cache should be cleared after Node version change

### Heroku
- Reads Node version from `engines` field in `package.json`
- Automatically installs specified npm version
- May need to clear build cache: `heroku repo:purge_cache`

### Render
- Reads from `package.json` engines field
- Supports `.nvmrc` file
- Auto-rebuilds on push

### Railway
- Uses `engines` field from `package.json`
- Supports `.nvmrc`
- Automatic deployments on Git push

## Environment Variables Check

After upgrading, verify all required environment variables are set:

```bash
# Required for production
NODE_ENV=production
NODE_VERSION=20  # Platform-specific

# Application
APP_URL=https://your-domain.com
APP_KEYS=[...]

# Database
DATABASE_CLIENT=postgres
DATABASE_HOST=...
DATABASE_PORT=5432
DATABASE_NAME=...
DATABASE_USERNAME=...
DATABASE_PASSWORD=...
DATABASE_SSL=true

# Secrets
ADMIN_JWT_SECRET=...
API_TOKEN_SALT=...
TRANSFER_TOKEN_SALT=...
JWT_SECRET=...
```

## Post-Upgrade Checklist

- [ ] Node.js 20 installed in production environment
- [ ] npm 10.x or higher installed
- [ ] Build cache cleared
- [ ] Dependencies reinstalled with `npm install`
- [ ] Application built successfully with `npm run build`
- [ ] Application deployed and running
- [ ] Admin panel accessible
- [ ] API endpoints responding correctly
- [ ] Database connections working
- [ ] No console errors in application logs
- [ ] Performance metrics normal

## Rollback Plan (if needed)

If you encounter critical issues:

1. **Quick rollback to previous deployment**:
   - Most platforms have "Rollback" feature in dashboard
   - Or redeploy previous Git commit

2. **Temporary fix** (not recommended long-term):
   ```json
   "engines": {
     "node": ">=18.0.0 <=20.x.x",
     "npm": ">=9.0.0"
   }
   ```
   Then configure production to use Node 18.x with npm 9.x

## Support Resources

- [Node.js 20 Release Notes](https://nodejs.org/en/blog/release/v20.0.0)
- [Strapi System Requirements](https://docs.strapi.io/dev-docs/installation)
- [npm Compatibility Matrix](https://nodejs.org/en/download/package-manager)

---

**Status**: ✅ Configuration updated for Node.js 20 LTS
**Next Action**: Deploy to production with Node.js 20 environment

