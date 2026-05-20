import { describe, it, expect, beforeAll, afterAll } from "vitest";
import http from "node:http";
import type { AddressInfo } from "node:net";
import { app } from "../../src/index.js";
import { prisma } from "../../src/prisma.js";

let server: http.Server;
let baseUrl: string;
let testGymId: number;
const createdGymIds: number[] = [];

function request(path: string, options: RequestInit = {}) {
  return fetch(`${baseUrl}${path}`, options);
}

describe("Gym API integration tests", () => {
  beforeAll(async () => {
    server = http.createServer(app);

    await new Promise<void>((resolve) => {
      server.listen(0, () => {
        const address = server.address() as AddressInfo;
        baseUrl = `http://localhost:${address.port}`;
        resolve();
      });
    });

    const testGym = await prisma.gym.create({
      data: {
        name: "Integration Test Gym",
        location: "Stockholm",
      },
    });

    testGymId = testGym.id;
    createdGymIds.push(testGym.id);
  });

  afterAll(async () => {
    await prisma.review.deleteMany({
      where: {
        gymId: {
          in: createdGymIds,
        },
      },
    });
    await prisma.gym.deleteMany({
      where: {
        id: {
          in: createdGymIds,
        },
      },
    });
    await new Promise<void>((resolve) => server.close(() => resolve()));
    await prisma.$disconnect();
  });

  it("GET /gyms returns 200 and an array", async () => {
    const res = await request("/gyms");
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
  });

  it("GET /gyms/:id returns one gym", async () => {
    const res = await request(`/gyms/${testGymId}`);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.name).toBe("Integration Test Gym");
  });

  it("GET /gyms/:id returns 404 for unknown ID", async () => {
    const res = await request("/gyms/999999");

    expect(res.status).toBe(404);
  });

  it("POST /gyms without login returns 401", async () => {
    const res = await request("/gyms", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "Test Gym",
        location: "Malmö",
      }),
    });

    expect(res.status).toBe(401);
  });

  it("POST /gyms with a valid test session returns 201", async () => {
    const res = await request("/gyms", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-test-user": "true",
      },
      body: JSON.stringify({
        name: "Session Strength",
        location: "Uppsala",
      }),
    });
    const data = await res.json();

    expect(res.status).toBe(201);
    expect(data).toMatchObject({
      name: "Session Strength",
      location: "Uppsala",
    });
    expect(typeof data.id).toBe("number");
    createdGymIds.push(data.id);
  });

  it("POST /gyms/:id/reviews without login returns 401", async () => {
    const res = await request(`/gyms/${testGymId}/reviews`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        rating: 5,
        comment: "Great gym",
      }),
    });

    expect(res.status).toBe(401);
  });
});
