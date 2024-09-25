import request from 'supertest';
import app from '../src/app.js';
import { prisma } from "../src/database.js";


describe('User Management API', () => {
  let adminAgent;
  let userAgent;
  let adminToken;
  let userToken;
  let userId;

  beforeAll(async () => {
    await prisma.user.deleteMany({});
    adminAgent = request.agent(app); // Create an agent instance for admin
    userAgent = request.agent(app);  // Create an agent instance for user

    // Register users if not already registered
    await Promise.all([
      registerUser('testusersadmin', 'testusersadmin@example.com', 'ADMIN'),
      registerUser('testusersuser', 'testusersuser@example.com', 'USER')
    ]);
  });

  beforeEach(async () => {
    // Log in to get tokens
    const adminResponse = await adminAgent
      .post('/api/auth/login')
      .send({ username: 'testusersadmin', password: 'password' });

    expect(adminResponse.status).toBe(200);
    adminToken = adminResponse.body.token;

    const userResponse = await userAgent
      .post('/api/auth/login')
      .send({ username: 'testusersuser', password: 'password' });

    expect(userResponse.status).toBe(200);
    userToken = userResponse.body.token;

    // Create a user to perform operations on
    const createUserResponse = await adminAgent
      .post('/api/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        username: 'testinguserAPI',
        name: 'Test User',
        password: 'password',
        email: 'testinguserAPI@example.com',
        role: 'USER',
      });

        // Handle potential duplicate registration errors
        if (createUserResponse.status === 409) {
            console.log("User already exists, skipping registration.");
          } else {
            expect(createUserResponse.status).toBe(201);
            userId = createUserResponse.body.id;
          }
    console.log("UID == ",userId);    
  });

  afterAll(() => {
    jest.restoreAllMocks(); // Restore original implementations
  });

  it('should get all user data', async () => {
    const response = await adminAgent
      .get('/api/users/')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('should get a user data (own data in this case) with ADMIN role', async () => {
    console.log("UID == ",userId);
    const response = await adminAgent
      .get(`/api/users/${userId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(userId);
  });

  it('should update a user with ADMIN role', async () => {
    console.log("UID == ",userId);
    const response = await adminAgent
      .put(`/api/users/${userId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Updated Name' });

    expect(response.status).toBe(200);
    expect(response.body.name).toBe('Updated Name');
  });

  it('should partially update a user with ADMIN role', async () => {
    console.log("UID == ",userId);
    const response = await adminAgent
      .patch(`/api/users/${userId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Partially Updated Name' });

    expect(response.status).toBe(200);
    expect(response.body.name).toBe('Partially Updated Name');
  });

  it('should delete a user with ADMIN role', async () => {
    console.log("UID == ",userId);
    const response = await adminAgent
      .delete(`/api/users/${userId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
  });

  it('should not allow USER role to perform ADMIN operations', async () => {
    console.log("UID == ",userId);
    // Attempt to get all users with USER token
    const getUsersResponse = await userAgent
      .get('/api/users/')
      .set('Authorization', `Bearer ${userToken}`);

    expect(getUsersResponse.status).toBe(403); // Forbidden for non-admin users

    // Attempt to update a user with USER token
    const updateUserResponse = await userAgent
      .put(`/api/users/${userId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ name: 'Unauthorized Put Update' });

    expect(updateUserResponse.status).toBe(403); // Forbidden for non-admin users

    // Attempt to update a user with USER token
    const updatePatchUserResponse = await userAgent
      .patch(`/api/users/${userId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ name: 'Unauthorized Patch Update' });

    expect(updatePatchUserResponse.status).toBe(403); // Forbidden for non-admin users
    // Attempt to delete a user with USER token
    const deleteUserResponse = await userAgent
      .delete(`/api/users/${userId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(deleteUserResponse.status).toBe(403); // Forbidden for non-admin users
  });

  // Helper function to register a user
  async function registerUser(username, email, role) {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        username,
        name: 'test',
        password: 'password',
        email,
        role,
      });

    if (response.status === 409) {
      console.log(`User ${username} already exists, skipping registration.`);
    } else {
      expect(response.status).toBe(201);
    }
  }
});
