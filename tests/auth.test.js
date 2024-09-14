import request from 'supertest';
import app from '../src/app.js';
import { prisma } from '../src/database.js';

describe('Auth API', () => {
    beforeAll(async () => {
        // Clear existing data to ensure clean test state
        await prisma.user.deleteMany({});
    });

    it('should register a new user', async () => {
        const response = await request(app)
            .post('/api/auth/register')
            .send({
                username: 'testuser',
                password: 'password',
                email: 'test@example.com'
            });
        expect(response.status).toBe(201);
    });

    it('should login and return a token and set a refresh token cookie', async () => {
        await request(app)
            .post('/api/auth/register')
            .send({
                username: 'testuser',
                password: 'password',
                email: 'test@example.com'
            });
        const response = await request(app)
            .post('/api/auth/login')
            .send({
                username: 'testuser',
                password: 'password'
            });
        expect(response.status).toBe(200);
        expect(response.body.token).toBeDefined();
        expect(response.headers['set-cookie']).toBeDefined();
        const refreshTokenCookie = response.headers['set-cookie'].find(cookie => cookie.startsWith('refreshToken='));
        expect(refreshTokenCookie).toBeDefined();
    });

    it('should refresh token when access token is expired', async () => {
        await request(app)
            .post('/api/auth/register')
            .send({
                username: 'testuser',
                password: 'password',
                email: 'test@example.com'
            });
        const loginResponse = await request(app)
            .post('/api/auth/login')
            .send({
                username: 'testuser',
                password: 'password'
            });
        const { refreshToken } = loginResponse.headers['set-cookie']
            .find(cookie => cookie.startsWith('refreshToken='))
            .split(';')[0]
            .split('=')[1];
        
        // Simulate token expiration
        jest.spyOn(Date, 'now').mockImplementation(() => Date.now() + 10000000);

        // Attempt to refresh token
        const refreshResponse = await request(app)
            .post('/api/auth/refresh')
            .set('Cookie', `refreshToken=${refreshToken}`);
        expect(refreshResponse.status).toBe(200);
        expect(refreshResponse.body.token).toBeDefined();
    });

    it('should logout and clear refresh token cookie', async () => {
        await request(app)
            .post('/api/auth/register')
            .send({
                username: 'testuser',
                password: 'password',
                email: 'test@example.com'
            });
        const loginResponse = await request(app)
            .post('/api/auth/login')
            .send({
                username: 'testuser',
                password: 'password'
            });

        const refreshTokenCookie = loginResponse.headers['set-cookie'].find(cookie => cookie.startsWith('refreshToken='));

        const logoutResponse = await request(app)
            .post('/api/auth/logout')
            .set('Cookie', refreshTokenCookie);

        expect(logoutResponse.status).toBe(200);

        // Verify that the refresh token cookie has been cleared
        expect(logoutResponse.headers['set-cookie'].some(cookie => cookie.startsWith('refreshToken=deleted'))).toBe(true);
    });
});
