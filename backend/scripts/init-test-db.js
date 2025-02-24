const { Client } = require('pg');
const { getConfig } = require('../config/database');

async function initTestDatabase() {
  const config = getConfig('test');
  const adminClient = new Client({
    ...config,
    database: 'postgres' // Connect to default database first
  });

  try {
    await adminClient.connect();

    // Create test database if it doesn't exist
    try {
      await adminClient.query(`CREATE DATABASE ${config.database}`);
      console.log(`Database ${config.database} created successfully`);
    } catch (err) {
      if (err.code === '42P04') { // Database already exists
        console.log(`Database ${config.database} already exists`);
      } else {
        throw err;
      }
    }

    // Create test user if it doesn't exist
    try {
      await adminClient.query(`
        DO $$
        BEGIN
          IF NOT EXISTS (SELECT FROM pg_user WHERE usename = '${config.user}') THEN
            CREATE USER ${config.user} WITH PASSWORD '${config.password}';
          END IF;
        END
        $$;
      `);
      console.log(`User ${config.user} created or already exists`);
    } catch (err) {
      console.error('Error creating user:', err);
      throw err;
    }

    // Grant privileges
    await adminClient.query(`
      GRANT ALL PRIVILEGES ON DATABASE ${config.database} TO ${config.user};
    `);
    console.log(`Privileges granted to ${config.user}`);

  } catch (err) {
    console.error('Error initializing test database:', err);
    throw err;
  } finally {
    await adminClient.end();
  }
}

// Run if called directly (not imported)
if (require.main === module) {
  initTestDatabase()
    .then(() => console.log('Test database initialization complete'))
    .catch(err => {
      console.error('Failed to initialize test database:', err);
      process.exit(1);
    });
}

module.exports = initTestDatabase;