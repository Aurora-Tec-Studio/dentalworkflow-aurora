// Autenticação client-side simples para demonstração ao cliente
// Credenciais fixas para demo — substitua por auth real em produção

const AUTH_KEY = "aurora_admin_auth";

export interface AuthSession {
  email: string;
  name: string;
  role: string;
  loginAt: number;
}

export const DEMO_CREDENTIALS = [
  { email: "admin@auroratec.com.br", password: "aurora2024", name: "Sofia Rodrigues", role: "MODERADOR" },
  { email: "dentista@clinica.com.br", password: "dentista123", name: "Dr. Henrique Vasques", role: "DENTISTA" },
  { email: "lab@ceramicaprime.com.br", password: "lab123", name: "Lab Cerâmica Prime", role: "PROTETICO" },
];

export function login(email: string, password: string): AuthSession | null {
  const match = DEMO_CREDENTIALS.find(
    (c) => c.email.toLowerCase() === email.toLowerCase() && c.password === password
  );
  if (!match) return null;

  const session: AuthSession = {
    email: match.email,
    name: match.name,
    role: match.role,
    loginAt: Date.now(),
  };

  if (typeof window !== "undefined") {
    sessionStorage.setItem(AUTH_KEY, JSON.stringify(session));
  }
  return session;
}

export function logout(): void {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem(AUTH_KEY);
  }
}

export function getSession(): AuthSession | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(AUTH_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  return getSession() !== null;
}
