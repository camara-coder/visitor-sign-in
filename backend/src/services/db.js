const { Pool } = require('pg');
require('dotenv').config();

class DatabaseService {
  constructor() {
    this.pool = null;
  }

  getPool() {
    if (!this.pool) {
      const isTest = process.env.NODE_ENV === 'test';
      this.pool = new Pool({
        host: isTest ? process.env.TEST_DB_HOST : process.env.DEV_DB_HOST,
        database: isTest ? process.env.TEST_DB_NAME : process.env.DEV_DB_NAME,
        user: isTest ? process.env.TEST_DB_USER : process.env.DEV_DB_USER,
        password: isTest ? process.env.TEST_DB_PASSWORD : process.env.DEV_DB_PASSWORD,
        port: parseInt(isTest ? process.env.TEST_DB_PORT : process.env.DEV_DB_PORT),
        max: isTest ? 1 : 10
      });

      this.pool.on('error', (err) => {
        console.error('Unexpected error on idle client', err);
      });
    }
    return this.pool;
  }

  async getClient() {
    return await this.getPool().connect();
  }

  async closePool() {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
    }
  }
}

// Singleton instance
const dbService = new DatabaseService();
module.exports = dbService;