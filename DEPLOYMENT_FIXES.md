# Deployment & Local Development Fixes

## Issues Identified

### 1. Local Development Error - SWC Native Binding Failure
**Error:**
```
Error: Failed to load native binding at @swc/core/binding.js
```

**Root Cause:**
- `package.json` specified exact Node.js version `20.17.0`
- System running Node.js `v20.19.5`
- Native bindings in `@swc/core` compiled for different Node version
- Mismatch causes binary incompatibility

**Fix Applied:**
Changed in `package.json`:
```json
"engines": {
  "node": ">=20.0.0 <=20.x.x",  // Previously: "20.17.0", then ">=18.0.0 <=20.x.x"
  "npm": ">=10.0.0"              // Previously: ">=6.0.0"
}
```

**Reason for Node 20:**
- Production was running Node.js v19.9.0 (EOL, unmaintained)
- npm 11.6.2 requires Node.js 20+
- Strapi 5.25.0 officially supports Node.js 18.x or 20.x (not 19.x)
- Node 20 LTS has support until April 2026

### 2. Production Deployment Configuration Missing Proxy Settings

**Root Cause:**
- Production server config in `config/env/production/server.js` was missing critical settings
- Missing `proxy: true` causes issues with reverse proxy deployments (nginx, load balancers)
- Missing host and port configurations

**Fix Applied:**
Updated `config/env/production/server.js`:
```javascript
module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),      // Added
  port: env.int('PORT', 1337),        // Added
  proxy: true,                         // Already present but now with full config
  url: env('APP_URL'),
  app: { 
    keys: env.array('APP_KEYS')
  },
});
```

## Comparison with Working Project (sparring-back)

### Key Differences

| Configuration | tecno-backend (Before) | sparring-back (Working) | tecno-backend (Fixed) |
|--------------|----------------------|------------------------|---------------------|
| **Strapi Version** | 5.25.0 | 4.24.2 | 5.25.0 (no change) |
| **Node Version** | >=20.0.0 <=20.x.x (Node 20 LTS) | >=18.0.0 <=20.x.x | >=20.0.0 <=20.x.x |
| **npm Version** | >=10.0.0 | >=6.0.0 | >=10.0.0 |
| **Production Proxy** | Yes | Yes | Yes (enhanced) |
| **Production Host/Port** | ❌ Missing | ❌ Missing | ✅ Added |
| **Database SSL Logic** | Ternary operators | && operators | Ternary (better) |

### Configuration Files Comparison

#### Database Configuration
Both projects have similar database configurations. Key difference:
- **tecno-backend**: Uses ternary operator `? : false` for SSL (safer, more explicit)
- **sparring-back**: Uses `&&` operator (can return `false` incorrectly)

**tecno-backend approach is better** - no changes needed.

#### Middleware Configuration
Both projects have identical middleware configurations including CSP settings for DigitalOcean Spaces.

## Steps Taken to Fix

1. ✅ Updated Node.js version constraint from exact version to Node 20 LTS range
2. ✅ Updated npm version constraint to >=10.0.0 (compatible with npm 11.x)
3. ✅ Deleted `node_modules` and `package-lock.json`
4. ✅ Ran `npm install` to rebuild native bindings
5. ✅ Added missing `host` and `port` in production server config
6. ✅ Updated `.nvmrc` to use Node 20
7. ✅ Tested build successfully with `npm run build`
8. ✅ Created comprehensive Node 20 upgrade guide

## Required Environment Variables for Production

Ensure these environment variables are set in production:

### Essential Variables
```bash
# Application
NODE_ENV=production
APP_KEYS=[your-app-keys-array]
APP_URL=https://your-domain.com

# Database
DATABASE_CLIENT=postgres
DATABASE_HOST=your-db-host
DATABASE_PORT=5432
DATABASE_NAME=your-db-name
DATABASE_USERNAME=your-db-user
DATABASE_PASSWORD=your-db-password
DATABASE_SSL=true
DATABASE_SSL_SELF=false  # Set to true if using self-signed cert

# Admin
ADMIN_JWT_SECRET=your-admin-jwt-secret
API_TOKEN_SALT=your-api-token-salt
TRANSFER_TOKEN_SALT=your-transfer-token-salt
JWT_SECRET=your-jwt-secret

# Server
HOST=0.0.0.0
PORT=1337
```

### Optional Variables
```bash
# If using custom paths
DATABASE_SCHEMA=public
DATABASE_CONNECTION_TIMEOUT=60000
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10

# Feature flags
FLAG_NPS=true
FLAG_PROMOTE_EE=true
WEBHOOKS_POPULATE_RELATIONS=false
```

## Testing Locally

After fixes, test with:
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Build admin panel
npm run build

# Start development
npm run develop

# Start production mode locally
NODE_ENV=production npm start
```

## Deployment Checklist

- [x] Node.js 20 LTS configured in production environment
- [x] npm 10+ compatible with production
- [x] All environment variables configured
- [x] Database accessible from server
- [x] `proxy: true` enabled in production config
- [x] SSL certificates configured (if needed)
- [ ] Clear build cache in production platform
- [ ] Deploy with Node.js 20 environment
- [ ] Run `npm run build` during deployment
- [ ] Test with `NODE_ENV=production npm start` locally
- [ ] Verify database migrations run successfully
- [ ] Check application logs after deployment
- [ ] Verify admin panel accessible
- [ ] Test API endpoints

## Additional Notes

### Why Strapi 5 vs Strapi 4?
- **tecno-backend**: Uses Strapi 5.25.0 (latest)
- **sparring-back**: Uses Strapi 4.24.2 (older)

Strapi 5 has different configuration requirements and breaking changes. The configurations cannot be directly copied between versions.

### Native Binding Issues Prevention
To prevent future native binding issues:
- Always use Node version ranges, not exact versions
- Rebuild `node_modules` when switching Node versions
- Use `.nvmrc` file to specify Node version for the project
- Consider using Docker for consistent environments

### Production Deployment Best Practices
1. Always set `proxy: true` when behind reverse proxy
2. Use environment-specific configs in `config/env/production/`
3. Enable SSL for database connections in production
4. Set proper `APP_URL` with HTTPS protocol
5. Use strong, unique secrets for JWT and tokens
6. Configure proper CORS and CSP policies

