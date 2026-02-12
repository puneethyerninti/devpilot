// GENERATED FROM COPILOT PROMPT: DevPilot Phase3 MVP - adapt as needed
import express from "express";
import request from "supertest";
import { sendOk } from "../utils/http";

describe("response helpers", () => {
  it("wraps payloads in the standard envelope", async () => {
    const app = express();
    app.get("/", (_req, res) => sendOk(res, { hello: "world" }));

    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true, data: { hello: "world" } });
  });
});
