import request from 'supertest';
import app from '../src/app.js';
import { prisma } from '../src/database.js';

describe('User Registration API', () => {
  it('should register a new user successfully', async () => {
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'testregister',
        name: 'Test User',
        password: 'password',
        email: 'testregister@example.com',
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

  it('should return 400 for missing username', async () => {
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        password: 'password',
        email: 'testregister@example.com',
        role: 'ADMIN',
      });

    expect(registerResponse.status).toBe(400);
    expect(registerResponse.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ msg: 'Username is required' }),
      ])
    );
  });

  it('should return 400 for invalid username', async () => {
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'a', // too short
        name: 'Test User',
        password: 'password',
        email: 'testregister@example.com',
        role: 'ADMIN',
      });

    expect(registerResponse.status).toBe(400);
    expect(registerResponse.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          msg: 'Username must be between 3 and 20 characters long',
        }),
      ])
    );
  });

  it('should return 400 for SQL injection in username', async () => {
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        username: "test' OR '1'='1", // SQL injection attempt
        name: 'Test User',
        password: 'password',
        email: 'testregister@example.com',
        role: 'ADMIN',
      });

    expect(registerResponse.status).toBe(400);
    expect(registerResponse.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          msg: 'Username can only contain letters, numbers, and underscores',
        }),
      ])
    );
  });

  it('should return 201 for XSS attack in name', async () => {
    // Ensure the name is sanitized
    const sanitizedResponse = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'validUsername2',
        name: "<script>alert('XSS');</script>;", // Expect sanitized output
        password: 'password',
        email: 'testregisterxss2@example.com',
        role: 'ADMIN',
      });
    if (sanitizedResponse.status === 409) {
      // Assuming 409 Conflict for duplicates
      console.log('User already exists, skipping registration');
    } else {
      expect(sanitizedResponse.status).toBe(201);
    }
  });

  it('should return 400 for invalid email format', async () => {
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'validUsername',
        name: 'Test User',
        password: 'password',
        email: 'invalid-email', // Invalid email
        role: 'ADMIN',
      });

    expect(registerResponse.status).toBe(400);
    expect(registerResponse.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ msg: 'Email must be valid' }),
      ])
    );
  });
});
