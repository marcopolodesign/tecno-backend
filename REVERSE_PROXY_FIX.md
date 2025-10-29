# 🔧 Reverse Proxy Authentication Fix for Strapi 5.25.0

## 🐛 Issue: "Cannot send secure cookie over unencrypted connection"

This is a known issue in Strapi 5.24.0+ when running behind a reverse proxy (nginx, Cloudflare, load balancers, etc.).

**Related GitHub Issues:**
- [Issue #24535](https://github.com/strapi/strapi/issues/24535)
- [Issue #24452](https://github.com/strapi/strapi/issues/24452) (Main workaround thread)

---

## ✅ Solution Applied

### 1. Updated Proxy Configuration (Strapi 5 Syntax)

**CRITICAL CHANGE:** Changed from `proxy: true` (Strapi 4) to `proxy: { koa: true }` (Strapi 5)

```javascript
// config/server.js
module.exports = ({ env }) => ({
  // ... other config
  proxy: { koa: true },  // ← STRAPI 5 SYNTAX
  // ... rest of config
});
```

```javascript
// config/env/production/server.js
module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  proxy: { koa: true },  // ← CRITICAL FOR REVERSE PROXY
  url: env('APP_URL'),
  // ... rest of config
});
```

### 2. Updated Admin Cookie Configuration

```javascript
// config/env/production/admin.js
module.exports = ({ env }) => ({
  // ... auth config
  cookie: {
    secure: env.bool('ADMIN_COOKIE_SECURE', true),
    httpOnly: true,
    sameSite: 'lax',  // Changed from 'strict' for better compatibility
  },
});
```

---

## 🌐 Reverse Proxy Configuration

Your reverse proxy **MUST** pass these headers:

### Required Headers:
- `X-Forwarded-For` - Client IP address
- `X-Forwarded-Proto` - Original protocol (http/https)
- `X-Forwarded-Host` - Original host
- `Host` - Current host

### Nginx Configuration

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    # SSL configuration
    ssl_certificate /path/to/fullchain.pem;
    ssl_certificate_key /path/to/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:1337;
        
        # REQUIRED HEADERS
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header Host $http_host;
        
        # WebSocket support (for Strapi live updates)
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        
        proxy_pass_request_headers on;
        proxy_http_version 1.1;
        proxy_buffering off;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$host$request_uri;
}
```

### Apache Configuration

```apache
<VirtualHost *:443>
    ServerName your-domain.com
    
    SSLEngine on
    SSLCertificateFile /path/to/cert.pem
    SSLCertificateKeyFile /path/to/key.pem
    
    ProxyPreserveHost On
    ProxyPass / http://127.0.0.1:1337/
    ProxyPassReverse / http://127.0.0.1:1337/
    
    # Required headers
    RequestHeader set X-Forwarded-Proto "https"
    RequestHeader set X-Forwarded-Port "443"
</VirtualHost>
```

### Caddy Configuration

Caddy handles this automatically! Just use:

```caddyfile
your-domain.com {
    reverse_proxy localhost:1337
}
```

### Docker + Traefik

```yaml
labels:
  - "traefik.enable=true"
  - "traefik.http.routers.strapi.rule=Host(`your-domain.com`)"
  - "traefik.http.routers.strapi.entrypoints=websecure"
  - "traefik.http.routers.strapi.tls.certresolver=letsencrypt"
  - "traefik.http.services.strapi.loadbalancer.server.port=1337"
```

---

## 🔍 Debugging Steps

### 1. Verify Proxy Headers are Being Received

Add this temporarily to check headers:

```javascript
// config/middlewares.js
module.exports = [
  'strapi::logger',
  'strapi::errors',
  // Add this temporarily for debugging
  (ctx, next) => {
    if (ctx.request.url === '/admin') {
      console.log('Request Headers:', {
        'x-forwarded-proto': ctx.request.headers['x-forwarded-proto'],
        'x-forwarded-for': ctx.request.headers['x-forwarded-for'],
        'x-forwarded-host': ctx.request.headers['x-forwarded-host'],
        'host': ctx.request.headers['host'],
      });
    }
    return next();
  },
  // ... rest of middlewares
];
```

Expected output:
```
Request Headers: {
  'x-forwarded-proto': 'https',
  'x-forwarded-for': '123.456.789.0',
  'x-forwarded-host': 'your-domain.com',
  'host': 'your-domain.com'
}
```

### 2. Check Strapi Logs

Look for:
```bash
# Good - should NOT see this error anymore
error: Failed to create admin refresh session Cannot send secure cookie over unencrypted connection

# Good - authentication successful
info: Strapi started successfully
```

### 3. Test Admin Login

1. Clear browser cookies and cache
2. Go to `https://your-domain.com/admin`
3. Try to login
4. Check browser DevTools → Network tab → Look for Set-Cookie headers

---

## 🔐 Environment Variables

Make sure these are set in production:

```env
# Application URL (with HTTPS)
APP_URL=https://your-domain.com

# Optional: Override cookie secure setting if needed
# Only set to false for testing - should be true in production
ADMIN_COOKIE_SECURE=true

# All other required vars
NODE_ENV=production
APP_KEYS=["key1","key2","key3","key4"]
ADMIN_JWT_SECRET=your-secret
# ... etc
```

---

## 🚨 Common Issues & Solutions

### Issue 1: Still getting "Cannot send secure cookie" error

**Solution:**
1. Verify `proxy: { koa: true }` is set (NOT `proxy: true`)
2. Check reverse proxy is passing `X-Forwarded-Proto: https` header
3. Ensure `APP_URL` starts with `https://`
4. Clear Strapi build cache: `rm -rf .cache build && npm run build`

### Issue 2: Login works but immediately logs out

**Solution:**
- Change `sameSite: 'lax'` instead of `'strict'` in admin.js
- Check cookie domain matches your domain
- Verify CORS settings in middlewares.js

### Issue 3: Works locally but not in production

**Solution:**
1. Verify environment variables are set correctly in production
2. Check `NODE_ENV=production` is set
3. Ensure reverse proxy SSL/TLS is properly configured
4. Test that `APP_URL` is accessible with https://

### Issue 4: DigitalOcean App Platform / Similar PaaS

**Solution:**
These platforms handle SSL termination for you. Make sure:
1. `proxy: { koa: true }` is set
2. `APP_URL=https://your-app.ondigitalocean.app` (or your domain)
3. Trust proxy is enabled (should work automatically with the config)

---

## 📋 Checklist for Deployment

Before deploying, verify:

- [ ] `proxy: { koa: true }` in `config/server.js`
- [ ] `proxy: { koa: true }` in `config/env/production/server.js`
- [ ] Reverse proxy passes `X-Forwarded-*` headers
- [ ] `APP_URL` environment variable set with `https://`
- [ ] SSL/TLS certificate is valid and active
- [ ] Cleared build cache: `rm -rf .cache build`
- [ ] Rebuild: `npm run build`
- [ ] Test admin login after deployment

---

## 📚 Additional Resources

- [Strapi 5 Server Configuration](https://docs.strapi.io/dev-docs/configurations/server)
- [GitHub Issue #24452 - Official Workaround](https://github.com/strapi/strapi/issues/24452)
- [Koa Proxy Documentation](https://github.com/koajs/koa/blob/master/docs/api/request.md#requestip)

---

## 🎯 Summary

The key fix for Strapi 5.25.0 authentication behind reverse proxies:

1. **Use Strapi 5 proxy syntax:** `proxy: { koa: true }` (not `proxy: true`)
2. **Configure reverse proxy** to pass `X-Forwarded-Proto` header
3. **Set cookie.sameSite** to `'lax'` for better compatibility
4. **Use HTTPS** in production with valid SSL certificate

This should resolve the "Cannot send secure cookie over unencrypted connection" error!

