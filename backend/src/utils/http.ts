// GENERATED FROM COPILOT PROMPT: DevPilot Phase3 MVP - adapt as needed
import type { Response } from "express";

export type ApiResponse<T> = {
  ok: boolean;
  data?: T;
  error?: string;
};

export const sendOk = <T>(res: Response, data: T, status = 200): void => {
  res.status(status).json({ ok: true, data } satisfies ApiResponse<T>);
};

export const sendError = (res: Response, error: string, status = 400): void => {
  res.status(status).json({ ok: false, error } satisfies ApiResponse<never>);
};
