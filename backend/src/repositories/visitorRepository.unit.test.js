const MockDate = require('mockdate');
const dbService = require('../services/db');
const visitorRepository = require('./visitorRepository');

// Mock the entire dbService
jest.mock('../services/db', () => ({
  getClient: jest.fn()
}));

describe('VisitorRepository', () => {
  const testDate = new Date('2025-02-19T13:00:00.000Z');
  const mockClient = {
    query: jest.fn(),
    release: jest.fn()
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
    MockDate.set(testDate);
    // Setup the mock client to be returned by getClient
    dbService.getClient.mockResolvedValue(mockClient);
  });

  afterEach(() => {
    MockDate.reset();
  });

  describe('getCurrentEvent', () => {
    it('should return the current active event', async () => {
      const mockEvent = {
        id: '123',
        start_time: new Date('2025-02-19T12:00:00.000Z'),
        end_time: new Date('2025-02-19T16:00:00.000Z'),
        status: 'enabled'
      };

      mockClient.query.mockResolvedValueOnce({ rows: [mockEvent] });

      const result = await visitorRepository.getCurrentEvent(testDate);
      
      // Verify the query was called with correct SQL
      const [actualQuery, actualParams] = mockClient.query.mock.calls[0];
      expect(actualQuery.replace(/\s+/g, ' ').trim())
        .toMatch(/SELECT.*FROM events.*WHERE.*status = 'enabled'.*ORDER BY.*LIMIT 1/);
      expect(actualParams).toEqual([testDate]);
      
      expect(mockClient.release).toHaveBeenCalled();
      expect(result).toEqual(mockEvent);
    });

    it('should return null when no active event exists', async () => {
      mockClient.query.mockResolvedValueOnce({ rows: [] });

      const result = await visitorRepository.getCurrentEvent(testDate);
      
      // Verify the query
      const [actualQuery, actualParams] = mockClient.query.mock.calls[0];
      expect(actualQuery.replace(/\s+/g, ' ').trim())
        .toMatch(/SELECT.*FROM events.*WHERE.*status = 'enabled'.*ORDER BY.*LIMIT 1/);
      expect(actualParams).toEqual([testDate]);
      
      expect(mockClient.release).toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('should handle database errors', async () => {
      const dbError = new Error('Database error');
      mockClient.query.mockRejectedValueOnce(dbError);

      await expect(visitorRepository.getCurrentEvent(testDate))
        .rejects
        .toThrow('Database error');
      
      // Verify the query
      const [actualQuery, actualParams] = mockClient.query.mock.calls[0];
      expect(actualQuery.replace(/\s+/g, ' ').trim())
        .toMatch(/SELECT.*FROM events.*WHERE.*status = 'enabled'.*ORDER BY.*LIMIT 1/);
      expect(actualParams).toEqual([testDate]);
      
      expect(mockClient.release).toHaveBeenCalled();
    });
  });

  describe('checkDuplicateRegistration', () => {
    const eventId = '123';
    const firstName = 'John';
    const lastName = 'Doe';

    it('should return true when duplicate exists', async () => {
      mockClient.query.mockResolvedValueOnce({ rows: [{ id: 1 }] });

      const result = await visitorRepository.checkDuplicateRegistration(eventId, firstName, lastName);

      expect(result).toBe(true);
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should return false when no duplicate exists', async () => {
      mockClient.query.mockResolvedValueOnce({ rows: [] });

      const result = await visitorRepository.checkDuplicateRegistration(eventId, firstName, lastName);

      expect(result).toBe(false);
      expect(mockClient.release).toHaveBeenCalled();
    });
  });

  describe('registerVisitor', () => {
    const eventId = '123';
    const visitorData = {
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '+1234567890',
      address: '123 Main St'
    };

    it('should successfully register a visitor', async () => {
      const mockRegisteredVisitor = { id: 1 };
      mockClient.query.mockResolvedValueOnce({ rows: [mockRegisteredVisitor] });

      const result = await visitorRepository.registerVisitor(eventId, visitorData);

      expect(result).toEqual(mockRegisteredVisitor);
      expect(mockClient.release).toHaveBeenCalled();
    });
  });

  // Add this test block to the VisitorRepository test suite in visitorRepository.unit.test.js

describe('disableEvent', () => {
    const eventId = '123';
  
    it('should successfully disable an event', async () => {
      mockClient.query.mockResolvedValueOnce({ rows: [{ id: eventId }] });
  
      const result = await visitorRepository.disableEvent(eventId);
  
      // Verify the query
      const [actualQuery, actualParams] = mockClient.query.mock.calls[0];
      expect(actualQuery.replace(/\s+/g, ' ').trim())
        .toMatch(/UPDATE events SET status = 'disabled' WHERE id = \$1 AND status = 'enabled'/);
      expect(actualParams).toEqual([eventId]);
      
      expect(result).toBe(true);
      expect(mockClient.release).toHaveBeenCalled();
    });
  
    it('should return false when event does not exist or is not enabled', async () => {
      mockClient.query.mockResolvedValueOnce({ rows: [] });
  
      const result = await visitorRepository.disableEvent(eventId);
  
      // Verify the query
      const [actualQuery, actualParams] = mockClient.query.mock.calls[0];
      expect(actualQuery.replace(/\s+/g, ' ').trim())
        .toMatch(/UPDATE events SET status = 'disabled' WHERE id = \$1 AND status = 'enabled'/);
      expect(actualParams).toEqual([eventId]);
      
      expect(result).toBe(false);
      expect(mockClient.release).toHaveBeenCalled();
    });
  
    it('should handle database errors', async () => {
      const dbError = new Error('Database error');
      mockClient.query.mockRejectedValueOnce(dbError);
  
      await expect(visitorRepository.disableEvent(eventId))
        .rejects
        .toThrow('Database error');
      
      expect(mockClient.release).toHaveBeenCalled();
    });
  });

// Update this test block in the VisitorRepository test suite in visitorRepository.unit.test.js

describe('createEvent', () => {
    const eventId = '123';
    const startDate = new Date('2025-02-19T12:00:00.000Z');
    const endDate = new Date('2025-02-19T16:00:00.000Z');
  
    it('should successfully create an event', async () => {
      const mockEvent = {
        id: eventId,
        start_time: startDate,
        end_time: endDate,
        status: 'enabled'
      };
  
      mockClient.query.mockResolvedValueOnce({ rows: [mockEvent] });
  
      const result = await visitorRepository.createEvent(eventId, startDate, endDate);
  
      // Verify the query
      const [actualQuery, actualParams] = mockClient.query.mock.calls[0];
      expect(actualQuery.replace(/\s+/g, ' ').trim())
        .toMatch(/INSERT INTO events.*VALUES.*RETURNING/);
      expect(actualParams).toEqual([eventId, startDate, endDate, 'enabled']);
      
      expect(result).toEqual(mockEvent);
      expect(mockClient.release).toHaveBeenCalled();
    });
  
    it('should handle database errors', async () => {
      const dbError = new Error('Database error');
      mockClient.query.mockRejectedValueOnce(dbError);
  
      await expect(visitorRepository.createEvent(eventId, startDate, endDate))
        .rejects
        .toThrow('Database error');
      
      expect(mockClient.release).toHaveBeenCalled();
    });
  });

});