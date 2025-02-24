const dbService = require('../services/db');

// Initialize the database schema if it doesn't exist
const initializeSchema = async () => {
  const client = await dbService.getClient();
  try {
    // Create events table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS events (
        id UUID PRIMARY KEY,
        status VARCHAR(20) NOT NULL,
        start_time TIMESTAMP NOT NULL,
        end_time TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Events table initialized');
  } catch (error) {
    console.error('Error initializing schema:', error);
    throw error;
  } finally {
    client.release();
  }
};

// Event repository methods
const eventRepository = {
  /**
   * Create a new event in the database
   * @param {Object} event - Event object with id, status, startTime, endTime
   * @returns {Promise<Object>} - The saved event
   */
  createEvent: async (event) => {
    const client = await dbService.getClient();
    try {
      await client.query('BEGIN');

      // First, ensure any existing enabled events are disabled
      await client.query(`
        UPDATE events
        SET status = 'disabled'
        WHERE status = 'enabled'
      `);

      // Then create the new event
      const result = await client.query(
        `INSERT INTO events (id, status, start_time, end_time)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [event.id, event.status, event.startTime, event.endTime]
      );

      await client.query('COMMIT');

      // Format the response with camelCase
      const savedEvent = result.rows[0];
      return {
        id: savedEvent.id,
        status: savedEvent.status,
        startTime: savedEvent.start_time,
        endTime: savedEvent.end_time,
        createdAt: savedEvent.created_at
      };
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error creating event:', error);
      throw error;
    } finally {
      client.release();
    }
  },

  /**
   * Get the current active event
   * @returns {Promise<Object|null>} - The active event or null if none exists
   */
  getCurrentEvent: async () => {
    const client = await dbService.getClient();
    try {
      const result = await client.query(
        `SELECT * FROM events
         WHERE status = 'enabled'
         ORDER BY start_time DESC
         LIMIT 1`
      );

      if (result.rows.length === 0) {
        return null;
      }

      // Format the response with camelCase
      const event = result.rows[0];
      return {
        id: event.id,
        status: event.status,
        startTime: event.start_time,
        endTime: event.end_time,
        createdAt: event.created_at
      };
    } catch (error) {
      console.error('Error getting current event:', error);
      throw error;
    } finally {
      client.release();
    }
  },

  /**
   * Disable an event by ID
   * @param {string} eventId - The ID of the event to disable
   * @returns {Promise<Object|null>} - The updated event or null if not found
   */
  disableEvent: async (eventId) => {
    const client = await dbService.getClient();
    try {
      const result = await client.query(
        `UPDATE events
         SET status = 'disabled'
         WHERE id = $1
         RETURNING *`,
        [eventId]
      );

      if (result.rows.length === 0) {
        return null;
      }

      // Format the response with camelCase
      const updatedEvent = result.rows[0];
      return {
        id: updatedEvent.id,
        status: updatedEvent.status,
        startTime: updatedEvent.start_time,
        endTime: updatedEvent.end_time,
        createdAt: updatedEvent.created_at
      };
    } catch (error) {
      console.error('Error disabling event:', error);
      throw error;
    } finally {
      client.release();
    }
  },

  /**
   * Get an event by ID
   * @param {string} eventId - The ID of the event to get
   * @returns {Promise<Object|null>} - The event or null if not found
   */
  getEventById: async (eventId) => {
    const client = await dbService.getClient();
    try {
      const result = await client.query(
        `SELECT * FROM events
         WHERE id = $1`,
        [eventId]
      );

      if (result.rows.length === 0) {
        return null;
      }

      // Format the response with camelCase
      const event = result.rows[0];
      return {
        id: event.id,
        status: event.status,
        startTime: event.start_time,
        endTime: event.end_time,
        createdAt: event.created_at
      };
    } catch (error) {
      console.error('Error getting event by ID:', error);
      throw error;
    } finally {
      client.release();
    }
  }
};

// Initialize the schema when the module is first imported
initializeSchema().catch(err => {
  console.error('Failed to initialize database schema:', err);
});

module.exports = eventRepository;