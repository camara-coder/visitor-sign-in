const { Pool } = require('pg');
require('dotenv').config();

let pool;

const getTestPool = () => {
  if (!pool) {
    pool = new Pool({
      host: process.env.TEST_DB_HOST || 'localhost',
      database: process.env.TEST_DB_NAME || 'visitor_test_db',
      user: process.env.TEST_DB_USER || 'postgres',
      password: process.env.TEST_DB_PASSWORD || 'postgres',
      port: parseInt(process.env.TEST_DB_PORT || '5432'),
      max: 1
    });

    pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
    });
  }
  return pool;
};

const setupTestDatabase = async () => {
  try {
    const client = await getTestPool().connect();
    try {
      await client.query(`
        DROP TABLE IF EXISTS visitors;
        DROP TABLE IF EXISTS events;
        
        CREATE TABLE events (
        id UUID PRIMARY KEY,
        status VARCHAR(20) NOT NULL,
        start_time TIMESTAMP NOT NULL,
        end_time TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

       CREATE TABLE visitors (
        id SERIAL PRIMARY KEY,
        event_id UUID NOT NULL REFERENCES events(id),
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        address TEXT,
        phone_number VARCHAR(20),
        registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      `);
      console.log('Database tables created successfully');
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error setting up test database:', error);
    throw error;
  }
};

const createTestEvent = async (startDate, endDate, status = 'enabled') => {
  const client = await getTestPool().connect();
  try {
    const eventId = require('uuid').v4();
    
    // Log the event creation attempt
    console.log('Creating test event:', {
      eventId,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      status
    });

    await client.query(
      'INSERT INTO events (id, start_time, end_time, status) VALUES ($1, $2::timestamptz, $3::timestamptz, $4)',
      [eventId, startDate.toISOString(), endDate.toISOString(), status]
    );

    // Verify the event was created correctly
    const result = await client.query('SELECT * FROM events WHERE id = $1', [eventId]);
    console.log('Created event:', result.rows[0]);
    
    return eventId;
  } finally {
    client.release();
  }
};

const clearTables = async () => {
  const client = await getTestPool().connect();
  try {
    await client.query('DELETE FROM visitors');
    await client.query('DELETE FROM events');
    await client.query('SELECT COUNT(*) FROM events'); // Verify tables are empty
    console.log('Tables cleared successfully');
  } finally {
    client.release();
  }
};

const teardownTestDatabase = async () => {
  if (pool) {
    await pool.end();
    pool = null;
  }
};

module.exports = {
  getTestPool,
  setupTestDatabase,
  teardownTestDatabase,
  clearTables,
  createTestEvent
};