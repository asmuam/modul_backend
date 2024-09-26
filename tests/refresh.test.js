import request from 'supertest';
import app from '../src/app.js';
import { prisma } from '../src/database.js';

describe('Token Refresh API', () => {
  let agent; // This will be used to handle the session
  let token;

  beforeAll(async () => {
    agent = request.agent(app); // Create an agent instance to manage cookies

    // Register a user before tests
    const registerResponse = await agent.post('/api/auth/register').send({
      username: 'testrefresh',
      name: 'test',
      password: 'password',
      email: 'testrefresh@example.com',
      role: 'ADMIN',
    });

    // Handle potential duplicate registration errors
    if (registerResponse.status === 409) {
      console.log('User already exists, skipping registration');
    } else {
      expect(registerResponse.status).toBe(201);
    }

    // Login to get tokens
    const loginResponse = await agent.post('/api/auth/login').send({
      login: 'testrefresh',
      password: 'password',
    });
    console.log(loginResponse.text);
    expect(loginResponse.status).toBe(200);
    expect(loginResponse.headers['set-cookie']).toBeDefined();
    console.log('Body = ', loginResponse.body);
    console.log('Header = ', loginResponse.header);
    token = loginResponse.body.token;
  });

  it('should refresh token when access token is expired', async () => {
    // Make a request with the non-expired token
    const successResponse = await agent
      .get('/api/users/') // Assuming this route is protected and requires authentication
      .set('Authorization', 'Bearer ' + token);

    expect(successResponse.status).toBe(200); // success for control

    // Simulate token expiration by manually setting the token expiration time
    const expirationTime = new Date(Date.now() + 86400000); // 24 hours in the future
    jest.spyOn(Date, 'now').mockImplementation(() => expirationTime.getTime());

    // Make a request with the expired token
    const expiredResponse = await agent
      .get('/api/users/') // Assuming this route is protected and requires authentication
      .set('Authorization', 'Bearer ' + token);

    expect(expiredResponse.status).toBe(401); // Assuming 401 Unauthorized for expired token

    // Make the request to refresh the token
    const refreshResponse = await agent.post('/api/auth/refresh');

    expect(refreshResponse.status).toBe(200);
    expect(refreshResponse.body.token).toBeDefined(); // Ensure a new token is returned
  });

  afterAll(() => {
    jest.restoreAllMocks(); // Restore original implementations
  });
});
