import path from 'path';
import request from 'supertest';
import app from '../src/app'; // Adjust according to your project structure

describe('Upload Profile Picture', () => {
  let userAgent;
  let userToken;
  let userId;

  beforeAll(async () => {
    userAgent = request.agent(app); // Create an agent instance for user

    const registerResponse = await userAgent.post('/api/auth/register').send({
      username: 'testfile',
      name: 'Test User',
      password: 'password',
      email: 'testfile@example.com',
      role: 'USER',
    });

    if (registerResponse.status === 409) {
      console.log('User already exists, skipping registration');
    } else {
      expect(registerResponse.status).toBe(201);
    }
  });

  beforeEach(async () => {
    const userResponse = await userAgent
      .post('/api/auth/login')
      .send({ login: 'testfile', password: 'password' });

    expect(userResponse.status).toBe(200);
    userToken = userResponse.body.data.token;
    userId = userResponse.body.data.uid;
  });

  it('should upload a HEIC file and convert it to JPEG', async () => {
    const response = await userAgent
      .post(`/api/users/${userId}/profile-picture`)
      .attach('profilePicture', path.join(__dirname, '../uploads/tes1.heic'))
      .set('Authorization', `Bearer ${userToken}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Profile picture uploaded successfully');
    expect(response.body.filename).toMatch(/\.jpg$/);
  });

  it('should upload jpg', async () => {
    const response = await userAgent
      .post(`/api/users/${userId}/profile-picture`)
      .attach('profilePicture', path.join(__dirname, '../uploads/tes2.jpg'))
      .set('Authorization', `Bearer ${userToken}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Profile picture uploaded successfully');
    expect(response.body.filename).toMatch(/\.jpg$/);
  });
});
