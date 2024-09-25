import request from "supertest";
import app from "../src/app.js";
import { prisma } from "../src/database.js";


describe("User Login API", () => {
  let refreshToken;
  let token;

  beforeAll(async () => {
    await prisma.user.deleteMany({});
    // Register a user before tests to ensure login works
    const registerResponse = await request(app)
      .post("/api/auth/register")
      .send({
        username: "testlogin",
        name: "test",
        password: "password",
        email: "testlogin@example.com",
        role: "ADMIN",
      });

    // Handle potential duplicate registration errors
    if (registerResponse.status === 409) {
      // Assuming 409 Conflict for duplicates
      console.log("User already exists, skipping registration.");
    } else {
      expect(registerResponse.status).toBe(201);
    }
  });

  it("should login and return a token and set a refresh token cookie", async () => {
    const response = await request(app).post("/api/auth/login").send({
      username: "testlogin",
      password: "password",
    });

    expect(response.status).toBe(200);
    expect(response.body.token).toBeDefined();
    expect(response.headers["set-cookie"]).toBeDefined();

    const cookies = response.headers["set-cookie"];
    const refreshTokenCookie = cookies.find((cookie) =>
      cookie.startsWith("refreshToken=")
    );

    if (!refreshTokenCookie) {
      throw new Error("Refresh token cookie not found");
    }

    refreshToken = refreshTokenCookie.split(";")[0].split("=")[1];
    token = response.body.token;
  });

  afterAll(() => {
    // Cleanup if necessary
  });
});
