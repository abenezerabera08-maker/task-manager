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

describe("POST /tasks with priority", () => {
  it("creates a task with the specified priority", async () => {
    const res = await request(app)
      .post("/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Priority test", priority: "high" });
    expect(res.statusCode).toBe(201);
    expect(res.body.title).toBe("Priority test");
    expect(res.body.priority).toBe("high");
  });

  it("defaults priority to medium when not provided", async () => {
    const res = await request(app)
      .post("/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "No priority" });
    expect(res.statusCode).toBe(201);
    expect(res.body.priority).toBe("medium");
  });
});

describe("PATCH /tasks/:id/priority", () => {
  it("updates the priority and persists the change", async () => {
    const created = await request(app)
      .post("/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Change me", priority: "low" });
    expect(created.statusCode).toBe(201);

    const updated = await request(app)
      .patch(`/tasks/${created.body.id}/priority`)
      .set("Authorization", `Bearer ${token}`)
      .send({ priority: "high" });
    expect(updated.statusCode).toBe(200);
    expect(updated.body.priority).toBe("high");

    const fetched = await request(app)
      .get("/tasks")
      .set("Authorization", `Bearer ${token}`);
    const task = fetched.body.find((t) => t.id === created.body.id);
    expect(task).toBeDefined();
    expect(task.priority).toBe("high");
  });

  it("rejects an invalid priority value", async () => {
    const created = await request(app)
      .post("/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Invalid priority test" });
    expect(created.statusCode).toBe(201);

    const res = await request(app)
      .patch(`/tasks/${created.body.id}/priority`)
      .set("Authorization", `Bearer ${token}`)
      .send({ priority: "urgent" });
    expect(res.statusCode).toBe(400);
  });
});
