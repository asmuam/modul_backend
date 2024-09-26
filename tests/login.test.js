import request from 'supertest';
import app from '../src/app.js';
import { prisma } from '../src/database.js';

describe('User Login API', () => {
  let refreshToken;
  let token;

  beforeAll(async () => {
    // Register a user before tests to ensure login works
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'testlogin',
        name: 'test',
        password: 'password',
        email: 'testlogin@example.com',
        role: 'ADMIN',
      });

    // Handle potential duplicate registration errors
    if (registerResponse.status === 409) {
      // Assuming 409 Conflict for duplicates
      console.log('User already exists, skipping registration');
    } else {
      expect(registerResponse.status).toBe(201);
    }
  });

  it('should login and return a token and set a refresh token cookie', async () => {
    const response = await request(app).post('/api/auth/login').send({
      login: 'testlogin',
      password: 'password',
    });

    expect(response.status).toBe(200);
    expect(response.body.token).toBeDefined();
    expect(response.headers['set-cookie']).toBeDefined();

    const cookies = response.headers['set-cookie'];
    const refreshTokenCookie = cookies.find((cookie) =>
      cookie.startsWith('refreshToken=')
    );

    if (!refreshTokenCookie) {
      throw new Error('Refresh token cookie not found');
    }

    refreshToken = refreshTokenCookie.split(';')[0].split('=')[1];
    token = response.body.token;
  });

  it('should fail to login with incorrect password and return 401', async () => {
    const response = await request(app).post('/api/auth/login').send({
      login: 'testlogin',
      password: 'wrongpassword', // Incorrect password
    });

    expect(response.status).toBe(401); // Expect unauthorized status
    expect(response.body.token).toBeUndefined(); // No token should be returned
  });

  it('should fail to login with non-existent user and return 401', async () => {
    const response = await request(app).post('/api/auth/login').send({
      login: 'nonexistentuser', // Non-existent username
      password: 'password',
    });

    expect(response.status).toBe(401); // Expect unauthorized status
    expect(response.body.token).toBeUndefined(); // No token should be returned
  });

  it('should return 400 for missing username/email', async () => {
    const response = await request(app).post('/api/auth/login').send({
      password: 'password',
    });

    expect(response.status).toBe(400);
    expect(response.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          msg: 'Username or email is required',
        }),
      ])
    );
  });

  it('should return 400 for missing password', async () => {
    const response = await request(app).post('/api/auth/login').send({
      login: 'testlogin',
    });

    expect(response.status).toBe(400);
    expect(response.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          msg: 'Password is required',
        }),
      ])
    );
  });

  it('should return 400 for both missing username and password', async () => {
    const response = await request(app).post('/api/auth/login').send({});

    expect(response.status).toBe(400);
    expect(response.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          msg: 'Username or email is required',
        }),
      ])
    );
  });

  it('should return 400 for SQL injection attempt in username', async () => {
    const response = await request(app).post('/api/auth/login').send({
      login: "test'; DROP TABLE users; --", // SQL injection attempt
      password: 'password',
    });

    expect(response.status).toBe(400);
    expect(response.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          msg: 'Login must be a valid email or a username (3-20 characters, letters, numbers, and underscores only)',
        }),
      ])
    );
  });

  it('should return 400 for XSS attempt in username', async () => {
    const response = await request(app).post('/api/auth/login').send({
      login: "<script>alert('XSS')</script>", // XSS attempt
      password: 'password',
    });

    expect(response.status).toBe(400);
    expect(response.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          msg: 'Login must be a valid email or a username (3-20 characters, letters, numbers, and underscores only)',
        }),
      ])
    );
  });

  afterAll(() => {
    // Cleanup if necessary
  });
});
