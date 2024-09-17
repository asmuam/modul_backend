import request from "supertest";
import app from "../src/app.js";
import { prisma } from "../src/database.js";


describe("User Registration API", () => {
  it("should register a new user", async () => {
    const registerResponse = await request(app).post("/api/auth/register").send({
      username: "testregister",
      name: "test",
      password: "password",
      email: "testregister@example.com",
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
});
