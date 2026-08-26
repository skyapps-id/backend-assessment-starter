import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import request from "supertest";
import express from "express";
import { authRouter } from "../src/auth";
import { usersRouter } from "../src/users";
import { notesRouter } from "../src/notes";
import { db } from "../src/db";
import bcrypt from "bcrypt";

describe("API Integration Tests", () => {
  let app: express.Express;
  let userToken: string;
  let secondUserToken: string;
  let noteId: number;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use("/auth", authRouter);
    app.use("/users", usersRouter);
    app.use("/notes", notesRouter);
  });

  beforeEach(() => {
    db.exec("DELETE FROM notes");
    db.exec("DELETE FROM users");
  });

  describe("Authentication & Registration", () => {
    it("should register a new user with valid credentials", async () => {
      const response = await request(app)
        .post("/users/register")
        .send({ email: "test@example.com", password: "Test1234" });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("ok", true);
    });

    it("should reject registration with invalid email format", async () => {
      const response = await request(app)
        .post("/users/register")
        .send({ email: "invalid-email", password: "Test1234" });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error");
    });

    it("should reject registration with weak password", async () => {
      const response = await request(app)
        .post("/users/register")
        .send({ email: "test@example.com", password: "weak" });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error");
    });

    it("should reject duplicate email registration", async () => {
      await request(app)
        .post("/users/register")
        .send({ email: "test@example.com", password: "Test1234" });

      const response = await request(app)
        .post("/users/register")
        .send({ email: "test@example.com", password: "Test1234" });

      expect(response.status).toBe(409);
      expect(response.body).toHaveProperty("error", "email taken");
    });

    it("should login with valid credentials and return JWT token", async () => {
      await request(app)
        .post("/users/register")
        .send({ email: "test@example.com", password: "Test1234" });

      const response = await request(app)
        .post("/auth/login")
        .send({ email: "test@example.com", password: "Test1234" });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("token");
      userToken = response.body.token;
    });

    it("should reject login with invalid credentials", async () => {
      await request(app)
        .post("/users/register")
        .send({ email: "test@example.com", password: "Test1234" });

      const response = await request(app)
        .post("/auth/login")
        .send({ email: "test@example.com", password: "WrongPassword123" });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("error", "invalid credentials");
    });
  });

  describe("SQL Injection Protection", () => {
    it("should prevent SQL injection in login", async () => {
      await request(app)
        .post("/users/register")
        .send({ email: "test@example.com", password: "Test1234" });

      const response = await request(app)
        .post("/auth/login")
        .send({ email: "test@example.com", password: "' OR 1=1 --" });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("error", "invalid credentials");
    });
  });

  describe("Note Authorization & Access Control", () => {
    beforeEach(async () => {
      const aliceRegister = await request(app)
        .post("/users/register")
        .send({ email: "alice@example.com", password: "Alice123" });

      const aliceLogin = await request(app)
        .post("/auth/login")
        .send({ email: "alice@example.com", password: "Alice123" });

      userToken = aliceLogin.body.token;

      await request(app)
        .post("/users/register")
        .send({ email: "bob@example.com", password: "Bob123" });

      const bobLogin = await request(app)
        .post("/auth/login")
        .send({ email: "bob@example.com", password: "Bob123" });

      secondUserToken = bobLogin.body.token;

      const noteResponse = await request(app)
        .post("/notes")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ title: "Alice's Secret Note", body: "Private content" });

      noteId = noteResponse.body.id;
    });

    it("should allow user to create a note", async () => {
      const response = await request(app)
        .post("/notes")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ title: "Test Note", body: "Test content" });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("id");
    });

    it("should reject note creation without authentication", async () => {
      const response = await request(app)
        .post("/notes")
        .send({ title: "Test Note", body: "Test content" });

      expect(response.status).toBe(401);
    });

    it("should allow user to see only their own notes", async () => {
      const response = await request(app)
        .get("/notes")
        .set("Authorization", `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it("should prevent user from accessing another user's note", async () => {
      const response = await request(app)
        .get(`/notes/${noteId}`)
        .set("Authorization", `Bearer ${secondUserToken}`);

      expect(response.status).toBe(401);
    });

    it("should allow user to access their own note", async () => {
      const response = await request(app)
        .get(`/notes/${noteId}`)
        .set("Authorization", `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("title", "Alice's Secret Note");
    });

    it("should reject note creation without title", async () => {
      const response = await request(app)
        .post("/notes")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ body: "Test content" });

      expect(response.status).toBe(400);
    });

    it("should reject note creation without body", async () => {
      const response = await request(app)
        .post("/notes")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ title: "Test Note" });

      expect(response.status).toBe(400);
    });
  });

  describe("Password Security", () => {
    it("should store passwords as bcrypt hashes", async () => {
      await request(app)
        .post("/users/register")
        .send({ email: "secure@example.com", password: "TestPassword123" });

      const user = db.prepare("SELECT password FROM users WHERE email = ?").get("secure@example.com") as any;

      expect(user.password).not.toBe("TestPassword123");
      expect(user.password.length).toBeGreaterThan(50);
      expect(user.password).toMatch(/^\$2[aby]\$\d+\$/);
    });
  });
});