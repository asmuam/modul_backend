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
      username: 'testfiletxt',
      name: 'Test User',
      password: 'password',
      email: 'testfiletxt@example.com',
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

  it('should return an error for unsupported file type', async () => {
    const response = await userAgent
      .post(`/api/users/${userId}/profile-picture`)
      .attach('profilePicture', path.join(__dirname, '../uploads/tes3.txt'))
      .set('Authorization', `Bearer ${userToken}`);
    expect(response.status).toBe(400);
    expect(response.body.message).toContain(
      'File upload only supports the following filetypes'
    );
  });
});
