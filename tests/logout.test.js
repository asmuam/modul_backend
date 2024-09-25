import request from "supertest";
import app from "../src/app.js";
import { prisma } from "../src/database.js";

describe("User Logout API", () => {
  let refreshToken;
  let token;

  beforeAll(async () => {
    await prisma.user.deleteMany({});
    // Register a user before tests
    const registerResponse = await request(app)
      .post("/api/auth/register")
      .send({
        username: "testlogout",
        name: "test",
        password: "password",
        email: "testlogout@example.com",
        role: "ADMIN",
      });

    // Handle potential duplicate registration errors
    if (registerResponse.status === 409) {
      // Assuming 409 Conflict for duplicates
      console.log("User already exists, skipping registration.");
    } else {
      expect(registerResponse.status).toBe(201);
    }

    // Login to get tokens
    const loginResponse = await request(app).post("/api/auth/login").send({
      username: "testlogout",
      password: "password",
    });

    expect(loginResponse.status).toBe(200);
    const cookies = loginResponse.headers["set-cookie"];
    const refreshTokenCookie = cookies.find((cookie) =>
      cookie.startsWith("refreshToken=")
    );

    if (!refreshTokenCookie) {
      throw new Error("Refresh token cookie not found");
    }

    refreshToken = refreshTokenCookie.split(";")[0].split("=")[1];
    token = loginResponse.body.token;
  });

  it("should logout and clear refresh token cookie", async () => {
    const logoutResponse = await request(app)
      .post("/api/auth/logout")
      .set("Cookie", `refreshToken=${refreshToken}`); // Only need the cookie header for logout

    expect(logoutResponse.status).toBe(200);

    // Verify that the refresh token cookie has been cleared
    const clearedCookie = logoutResponse.headers["set-cookie"].find((cookie) =>
      cookie.includes("refreshToken=;")
    );

    expect(clearedCookie).toBeDefined();
  });
});
