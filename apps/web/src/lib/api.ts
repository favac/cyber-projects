import type { Area, User, Project } from "@cyber/domain";

const API_BASE_URL = "http://localhost:3001";

interface AuthResponse {
  user: User;
  token: string;
}

interface RegisterData {
  email: string;
  password: string;
  displayName: string;
}

interface LoginData {
  email: string;
  password: string;
}

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem("auth_token");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (options.headers) {
    Object.assign(headers, options.headers);
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = (await response.json().catch(() => ({
      message: response.statusText,
    }))) as { message?: string };
    throw new Error(error.message ?? "Request failed");
  }

  return response.json() as Promise<T>;
}

export async function register(data: RegisterData): Promise<AuthResponse> {
  const response = await fetchApi<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });

  localStorage.setItem("auth_token", response.token);
  return response;
}

export async function login(data: LoginData): Promise<AuthResponse> {
  const response = await fetchApi<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });

  localStorage.setItem("auth_token", response.token);
  return response;
}

export async function getCurrentUser(): Promise<User> {
  return fetchApi<User>("/auth/me");
}

export function logout(): void {
  localStorage.removeItem("auth_token");
}

export function isAuthenticated(): boolean {
  return !!localStorage.getItem("auth_token");
}

export async function getAreas(): Promise<Area[]> {
  return fetchApi<Area[]>("/areas");
}

export async function getProjects(): Promise<Project[]> {
  return fetchApi<Project[]>("/projects");
}

export async function createArea(data: {
  name: string;
  description: string;
  colorHex: string;
  iconName: string;
}): Promise<Area> {
  return fetchApi<Area>("/areas", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function createProject(data: { title: string; description: string; status: string; areaId: string; }): Promise<Project> {
  return fetchApi<Project>("/projects", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
