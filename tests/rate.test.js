import request from 'supertest';
import app from '../src/app.js';

describe('Rate Limiting', () => {
  it('should allow up to 100 requests', async () => {
    for (let i = 0; i < 100; i++) {
      const response = await request(app).get('/api/test');
      expect(response.status).toBe(200);
      expect(response.text).toBe('This is a test endpoint!');
    }
  });

  it('should block the 6th request', async () => {
    // Making 100 requests first
    for (let i = 0; i < 100; i++) {
      await request(app).get('/api/test');
    }

    // This 101st request should be blocked
    const response = await request(app).get('/api/test');
    expect(response.status).toBe(429); // 429 Too Many Requests
    expect(response.text).toBe('Too many requests, please try again later.');
  });
});
