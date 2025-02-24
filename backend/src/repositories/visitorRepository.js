const dbService = require('../services/db');

class VisitorRepository {

// Add this method to the VisitorRepository class in visitorRepository.js

async createEvent(eventId, startDate, endDate) {
  const client = await dbService.getClient();
  try {
    console.log('Creating event query:', {
      eventId,
      startDate,
      endDate,
      sql: 'INSERT INTO events (id, start_time, end_time, status) VALUES ($1, $2, $3, $4) RETURNING id, start_time, end_time, status',
      params: [eventId, startDate, endDate, 'enabled']
    });

    const result = await client.query(
      'INSERT INTO events (id, start_time, end_time, status) VALUES ($1, $2, $3, $4) RETURNING id, start_time, end_time, status',
      [eventId, startDate, endDate, 'enabled']
    );

    console.log('Query result:', result.rows);
    return result.rows[0];
  } finally {
    client.release();
  }
}

  async getCurrentEvent(timestamp = new Date()) {
    const client = await dbService.getClient();
    try {
      const result = await client.query(`
        SELECT id, start_time, end_time, status
        FROM events 
        WHERE status = 'enabled' 
        AND $1::timestamptz >= start_time 
        AND $1::timestamptz <= end_time
        ORDER BY id ASC
        LIMIT 1
      `, [timestamp]);

      console.log('getCurrentEvent query:', {
        timestamp,
        sql: `SELECT * FROM events WHERE status = 'enabled' AND $1::timestamptz >= start_time AND $1::timestamptz <= end_time`,
        params: [timestamp]
      });
      console.log('Query result:', result.rows);
      
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  }

  async checkDuplicateRegistration(eventId, firstName, lastName) {
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
  }

  async registerVisitor(eventId, visitorData) {
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
        RETURNING id`,
        [
          eventId,
          visitorData.firstName,
          visitorData.lastName,
          visitorData.address,
          visitorData.phoneNumber
        ]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  }
  // Add this method to the VisitorRepository class

  async disableEvent(eventId) {
    const client = await dbService.getClient();
    try {
      console.log('Disabling event query:', {
        eventId,
        sql: "UPDATE events SET status = 'disabled' WHERE id = $1 AND status = 'enabled' RETURNING id",
        params: [eventId]
      });
  
      const result = await client.query(
        "UPDATE events SET status = 'disabled' WHERE id = $1 AND status = 'enabled' RETURNING id",
        [eventId]
      );
  
      console.log('Query result:', result.rows);
      return result.rows.length > 0;
    } finally {
      client.release();
    }
  }



}



module.exports = new VisitorRepository();