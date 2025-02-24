const dbService = require('../services/db');

// Initialize the database schema if it doesn't exist
const initializeSchema = async () => {
  const client = await dbService.getClient();
  try {
    // Create visitors table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS visitors (
        id SERIAL PRIMARY KEY,
        event_id UUID NOT NULL REFERENCES events(id),
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        address TEXT,
        phone_number VARCHAR(20),
        registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_visitors_event_id ON visitors(event_id);
      CREATE INDEX IF NOT EXISTS idx_visitors_names ON visitors(lower(first_name), lower(last_name), event_id);
    `);
    console.log('Visitors table initialized');
  } catch (error) {
    console.error('Error initializing schema:', error);
    throw error;
  } finally {
    client.release();
  }
};

const visitorRepository = {
  /**
   * Get current event
   * @param {Date} timestamp - Current timestamp
   * @returns {Promise<Object|null>} - The current event or null
   */
  getCurrentEvent: async (timestamp = new Date()) => {
    const client = await dbService.getClient();
    try {
      const result = await client.query(`
        SELECT id, start_time as start_time, end_time as end_time, status
        FROM events 
        WHERE status = 'enabled' 
        AND $1::timestamptz >= start_time 
        AND $1::timestamptz <= end_time
        ORDER BY id ASC
        LIMIT 1
      `, [timestamp]);
      
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  },

  /**
   * Check for duplicate registration
   * @param {string} eventId - Event ID
   * @param {string} firstName - Visitor's first name
   * @param {string} lastName - Visitor's last name
   * @returns {Promise<boolean>} - True if duplicate exists
   */
  checkDuplicateRegistration: async (eventId, firstName, lastName) => {
    const client = await dbService.getClient();
    try {
      const result = await client.query(
        'SELECT id FROM visitors WHERE event_id = $1 AND LOWER(first_name) = LOWER($2) AND LOWER(last_name) = LOWER($3)',
        [eventId, firstName, lastName]
      );
      return result.rows.length > 0;
    } finally {
      client.release();
    }
  },

  /**
   * Register visitor for an event
   * @param {string} eventId - Event ID
   * @param {Object} visitorData - Visitor data
   * @returns {Promise<Object>} - Registered visitor data
   */
  registerVisitor: async (eventId, visitorData) => {
    const client = await dbService.getClient();
    try {
      const result = await client.query(
        `INSERT INTO visitors (
          event_id,
          first_name,
          last_name,
          address,
          phone_number,
          registration_date
        ) VALUES ($1, $2, $3, $4, $5, NOW())
        RETURNING id, first_name, last_name, address, phone_number, registration_date`,
        [
          eventId,
          visitorData.firstName,
          visitorData.lastName,
          visitorData.address || null,
          visitorData.phoneNumber || null
        ]
      );
      
      // Transform to camelCase for response
      const visitor = result.rows[0];
      return {
        id: visitor.id,
        firstName: visitor.first_name,
        lastName: visitor.last_name,
        address: visitor.address,
        phoneNumber: visitor.phone_number,
        registrationDate: visitor.registration_date
      };
    } finally {
      client.release();
    }
  },
  
  /**
   * Get all visitors for an event
   * @param {string} eventId - Event ID
   * @returns {Promise<Array>} - List of visitors
   */
  getVisitorsByEventId: async (eventId) => {
    const client = await dbService.getClient();
    try {
      const result = await client.query(
        `SELECT id, first_name, last_name, address, phone_number, registration_date
         FROM visitors
         WHERE event_id = $1
         ORDER BY registration_date DESC`,
        [eventId]
      );
      
      // Transform to camelCase for response
      return result.rows.map(v => ({
        id: v.id,
        firstName: v.first_name,
        lastName: v.last_name,
        address: v.address,
        phoneNumber: v.phone_number,
        registrationDate: v.registration_date
      }));
    } finally {
      client.release();
    }
  },
  
  /**
   * Count visitors for an event
   * @param {string} eventId - Event ID
   * @returns {Promise<number>} - Visitor count
   */
  getVisitorCount: async (eventId) => {
    const client = await dbService.getClient();
    try {
      const result = await client.query(
        'SELECT COUNT(*) as count FROM visitors WHERE event_id = $1',
        [eventId]
      );
      return parseInt(result.rows[0].count, 10);
    } finally {
      client.release();
    }
  }
};

// Initialize the schema when the module is first imported
initializeSchema().catch(err => {
  console.error('Failed to initialize database schema:', err);
});

module.exports = visitorRepository;