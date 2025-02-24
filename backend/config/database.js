const environments = {
    development: {
      host: process.env.DEV_DB_HOST || 'localhost',
      database: process.env.DEV_DB_NAME || 'visitordb',
      user: process.env.DEV_DB_USER || 'postgres',
      password: process.env.DEV_DB_PASSWORD,
      port: process.env.DEV_DB_PORT || 5432
    },
    test: {
      host: process.env.TEST_DB_HOST || 'localhost',
      database: process.env.TEST_DB_NAME || 'visitordb',
      user: process.env.TEST_DB_USER || 'postgres',
      password: process.env.TEST_DB_PASSWORD || 'changeme',
      port: process.env.TEST_DB_PORT || 5432
    },
    production: {
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT || 5432
    }
  };
  
  module.exports = {
    getConfig: (env = process.env.NODE_ENV || 'development') => environments[env]
  };