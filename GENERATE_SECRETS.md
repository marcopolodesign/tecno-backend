# 🔐 Generate Production Secrets

## Quick Secret Generation

Run these commands to generate secure secrets for your production environment:

### 1. Generate All Secrets at Once

```bash
node -e "
const crypto = require('crypto');
const generate = () => crypto.randomBytes(32).toString('base64');

console.log('='.repeat(60));
console.log('PRODUCTION SECRETS - Copy these to your platform');
console.log('='.repeat(60));
console.log('');
console.log('APP_KEYS=[\"' + generate() + '\",\"' + generate() + '\",\"' + generate() + '\",\"' + generate() + '\"]');
console.log('');
console.log('ADMIN_JWT_SECRET=' + generate());
console.log('API_TOKEN_SALT=' + generate());
console.log('TRANSFER_TOKEN_SALT=' + generate());
console.log('JWT_SECRET=' + generate());
console.log('');
console.log('='.repeat(60));
console.log('⚠️  IMPORTANT: Keep these secrets secure and private!');
console.log('='.repeat(60));
"
```

### 2. Generate Individual Secrets

If you need to generate secrets one at a time:

```bash
# Generate a single secret
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Run this command 8 times to generate:
- 4 keys for APP_KEYS array
- 1 for ADMIN_JWT_SECRET
- 1 for API_TOKEN_SALT
- 1 for TRANSFER_TOKEN_SALT
- 1 for JWT_SECRET

## 📋 Complete Environment Variables Template

Copy this template and fill in your values:

```env
# NODE ENVIRONMENT
NODE_ENV=production

# APPLICATION
APP_URL=https://your-domain.com
HOST=0.0.0.0
PORT=1337
APP_KEYS=["key1","key2","key3","key4"]

# DATABASE
DATABASE_CLIENT=postgres
DATABASE_HOST=your-db-host.com
DATABASE_PORT=5432
DATABASE_NAME=your_db_name
DATABASE_USERNAME=your_db_user
DATABASE_PASSWORD=your_db_password
DATABASE_SSL=true
DATABASE_SSL_SELF=false

# SECRETS
ADMIN_JWT_SECRET=your_generated_secret
API_TOKEN_SALT=your_generated_salt
TRANSFER_TOKEN_SALT=your_generated_salt
JWT_SECRET=your_generated_secret

# OPTIONAL
STRAPI_TELEMETRY_DISABLED=true
FLAG_NPS=true
FLAG_PROMOTE_EE=true
WEBHOOKS_POPULATE_RELATIONS=false
```

## 🎯 Platform-Specific Instructions

### DigitalOcean App Platform

1. Go to your app dashboard
2. Navigate to **Settings** → **App-Level**
3. Scroll to **Environment Variables**
4. Click **Edit**
5. Add each variable (one per line or use bulk edit)
6. Click **Save**

### Heroku

```bash
# Set all at once
heroku config:set \
  NODE_ENV=production \
  APP_URL=https://your-app.herokuapp.com \
  HOST=0.0.0.0 \
  PORT=1337 \
  APP_KEYS='["key1","key2","key3","key4"]' \
  DATABASE_CLIENT=postgres \
  ADMIN_JWT_SECRET=your_secret \
  API_TOKEN_SALT=your_salt \
  TRANSFER_TOKEN_SALT=your_salt \
  JWT_SECRET=your_secret \
  -a your-app-name

# Or set individually
heroku config:set NODE_ENV=production -a your-app-name
heroku config:set APP_URL=https://your-app.herokuapp.com -a your-app-name
# ... etc
```

### Render

1. Dashboard → Your Web Service
2. **Environment** tab
3. Click **Add Environment Variable**
4. Add each key-value pair
5. Click **Save Changes**

### Railway

1. Project Dashboard
2. **Variables** tab
3. Click **New Variable**
4. Add each key-value pair
5. Variables are automatically saved

### VPS/EC2 (PM2)

Create `.env` file in your app directory:

```bash
# SSH into server
ssh your-server

# Navigate to app
cd /path/to/tecno-backend

# Create .env file
nano .env

# Paste your environment variables
# Save with Ctrl+X, then Y, then Enter

# Restart app
pm2 restart tecno-backend
```

## ⚠️ Security Best Practices

### DO:
- ✅ Generate unique secrets for production (never reuse dev secrets)
- ✅ Use strong, random secrets (32+ bytes)
- ✅ Store secrets in platform's environment variables (encrypted)
- ✅ Use different secrets for different environments (dev/staging/prod)
- ✅ Rotate secrets periodically (every 90 days recommended)

### DON'T:
- ❌ Commit secrets to Git
- ❌ Share secrets in plain text (Slack, email, etc.)
- ❌ Use the same secrets across environments
- ❌ Use simple/guessable secrets
- ❌ Store secrets in code or config files

## 🔄 Rotating Secrets

If you need to rotate secrets:

1. Generate new secrets using the commands above
2. Update environment variables in your platform
3. Redeploy the application
4. **Note:** Rotating APP_KEYS will invalidate all existing sessions

## 📝 Database Connection String (Alternative)

Some platforms prefer a single DATABASE_URL:

```env
# PostgreSQL connection string format
DATABASE_URL=postgresql://username:password@host:5432/database?ssl=true

# Example
DATABASE_URL=postgresql://myuser:mypass@db.example.com:5432/mydb?ssl=true
```

If using DATABASE_URL, you can omit individual DATABASE_* variables.

## ✅ Verification

After setting environment variables:

1. **Check they're set:**
   ```bash
   # Heroku
   heroku config -a your-app-name
   
   # VPS
   pm2 env 0  # or your process ID
   ```

2. **Deploy and check logs:**
   - Look for "Strapi started successfully"
   - No "Missing environment variable" errors
   - Database connects successfully

## 🆘 Troubleshooting

### "APP_KEYS is required"
- Make sure APP_KEYS is an array: `["key1","key2","key3","key4"]`
- Some platforms need escaped quotes: `[\"key1\",\"key2\",\"key3\",\"key4\"]`

### "Invalid JWT secret"
- Regenerate ADMIN_JWT_SECRET
- Ensure no special characters causing issues
- Try base64 encoding without special chars

### Database connection fails
- Verify DATABASE_HOST is accessible from your server
- Check DATABASE_SSL=true for production databases
- Verify DATABASE_PASSWORD has no unescaped special characters

---

**Need Help?** Check the platform-specific documentation or deployment logs for more details.

