const { setupTestDatabase, teardownTestDatabase } = require('./testHelper');

beforeAll(async () => {
  // Set up database once before all tests
  await setupTestDatabase();
});

afterAll(async () => {
  // Clean up after all tests are done
  await teardownTestDatabase();
});