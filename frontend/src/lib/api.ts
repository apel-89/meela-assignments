import type { Answer } from "./schema";

export type Submission = {
  id: string;
  answers: Answer;
  current_step: number;
  completed: boolean;
};

const BASE = "/api/submissions";

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });

  if (!res.ok) {
    throw new ApiError(res.status, `${init?.method ?? "GET"} ${url}`);
  }

  return res.json() as Promise<T>;
}

export class ApiError extends Error {
  status: number;

  constructor(status: number, context: string) {
    super(`${context} failed with ${status}`);
    this.name = "ApiError";
    this.status = status;
  }

  get isNotFound() {
    return this.status === 404;
  }
}
export function createSubmission() {
  return request<{ id: string }>(BASE, { method: "POST" });
}

export function getSubmission(id: string) {
  return request<Submission>(`${BASE}/${id}`);
}

export interface PatchPayload {
  id: string;
  answers: Answer;
  currentStep: number;
  signal?: AbortSignal;
}

export function patchSubmission({
  id,
  answers,
  currentStep,
  signal,
}: PatchPayload) {
  return request<Submission>(`${BASE}/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ answers, current_step: currentStep }),
    signal,
  });
}

export function completeSubmission(id: string, answers: Answer) {
  return request<Submission>(`${BASE}/${id}/complete`, {
    method: "POST",
    body: JSON.stringify({ answers }),
  });
}
