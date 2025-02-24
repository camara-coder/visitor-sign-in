const { Pool } = require('pg');

// Log the environment variables for debugging
const dbHost = process.env.DB_HOST || 'host.docker.internal';
const dbPort = process.env.DB_PORT || 5432;
const dbName = process.env.DB_NAME || 'visitordb';
const dbUser = process.env.DB_USER || 'postgres';
const dbPassword = process.env.DB_PASSWORD || 'changeme';
const dbSsl = process.env.DB_SSL === 'true';

console.log('DB connection parameters:', {
  host: dbHost,
  port: dbPort,
  database: dbName,
  user: dbUser,
  ssl: dbSsl
});

// Create a PostgreSQL connection pool
const pool = new Pool({
  host: dbHost,
  port: dbPort,
  database: dbName,
  user: dbUser,
  password: dbPassword,
  ssl: dbSsl ? {
    rejectUnauthorized: false
  } : false,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000 // Return an error after 2 seconds if connection not established
});

// Log pool errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

module.exports = {
  /**
   * Get a client from the connection pool
   * @returns {Promise<Object>} Database client
   */
  getClient: async () => {
    return await pool.connect();
  },
  
  /**
   * Execute a query on the database
   * @param {string} text - The SQL query text
   * @param {Array} params - The query parameters
   * @returns {Promise<Object>} Query result
   */
  query: async (text, params) => {
    const start = Date.now();
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  },
  /**
   * Get a client from the connection pool
   * @returns {String} Database client
   */
  getPoolDBName: () => {
    return process.env.DB_NAME+"-"+process.env.DB_USER+"-"+process.env.DB_PASSWORD;
  }
};