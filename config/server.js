module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  url: env('PUBLIC_URL', 'http://localhost:1337'),
  // Strapi 5 proxy configuration for reverse proxies
  proxy: { koa: true },
  app: {
    keys: env.array('APP_KEYS'),
  },
  cron : {
    enabled: true, 
  },
  webhooks: {
    populateRelations: env.bool('WEBHOOKS_POPULATE_RELATIONS', false),
  },
});
