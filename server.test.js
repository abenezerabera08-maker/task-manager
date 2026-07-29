const request = require("supertest");
const app = require("./server");

describe("GET /tasks", () => {
  it("returns 200 and a JSON array", async () => {
    const res = await request(app).get("/tasks");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
