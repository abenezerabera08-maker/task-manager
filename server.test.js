const request = require("supertest");
const app = require("./server");

let token;

beforeAll(async () => {
  const email = `test-${Date.now()}@example.com`;
  await request(app)
    .post("/auth/register")
    .send({ email, password: "password123" })
    .expect(201);

  const res = await request(app)
    .post("/auth/login")
    .send({ email, password: "password123" })
    .expect(200);

  token = res.body.token;
});

describe("GET /tasks", () => {
  it("returns 200 and a JSON array", async () => {
    const res = await request(app)
      .get("/tasks")
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
