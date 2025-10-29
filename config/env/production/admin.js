module.exports = ({ env }) => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET'),
  },
  apiToken: {
    salt: env('API_TOKEN_SALT'),
  },
  transfer: {
    token: {
      salt: env('TRANSFER_TOKEN_SALT'),
    },
  },
  flags: {
    nps: env.bool('FLAG_NPS', true),
    promoteEE: env.bool('FLAG_PROMOTE_EE', true),
  },
  // Cookie settings for production with reverse proxy
  // The proxy: { koa: true } in server.js will make Strapi trust the X-Forwarded-Proto header
  cookie: {
    secure: env.bool('ADMIN_COOKIE_SECURE', true),
    httpOnly: true,
    sameSite: 'lax', // Changed from 'strict' to 'lax' for better compatibility
  },
});

