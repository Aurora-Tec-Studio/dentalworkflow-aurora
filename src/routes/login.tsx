import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, EyeOff, Lock, Mail, ShieldCheck } from "lucide-react";
import { login, DEMO_CREDENTIALS } from "../lib/auth";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login — Aurora Tec Studio" },
      { name: "description", content: "Acesso restrito à plataforma Aurora Dental Workflow." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Simula latência de rede para parecer real
    setTimeout(() => {
      const session = login(email, password);
      if (session) {
        navigate({ to: "/" });
      } else {
        setError("E-mail ou senha inválidos. Verifique suas credenciais.");
        setLoading(false);
      }
    }, 700);
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Painel esquerdo — marca */}
      <div className="relative hidden w-[46%] flex-col justify-between overflow-hidden bg-[#0979b0] p-12 lg:flex">
        {/* Padrão de grade sutil */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        {/* Círculo decorativo */}
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-white/5" />
        <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-white/5" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
            <span className="text-base font-bold text-white">A</span>
          </div>
          <div className="leading-none">
            <div className="text-sm font-semibold tracking-tight text-white">Aurora Tec Studio</div>
            <div className="mt-0.5 text-[10px] uppercase tracking-[0.18em] text-white/60">Dental Workflow</div>
          </div>
        </div>

        {/* Conteúdo central */}
        <div className="relative z-10">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-white/80" />
            <span className="text-[11px] font-medium tracking-wide text-white/80">Plataforma B2B Segura</span>
          </div>
          <h1 className="text-4xl font-bold leading-tight tracking-tight text-white">
            Gestão inteligente<br />de próteses<br />odontológicas.
          </h1>
          <p className="mt-4 text-base leading-relaxed text-white/70">
            Conectamos clínicas, laboratórios e moderação num único ecossistema com rastreabilidade total do fluxo de produção.
          </p>

          <div className="mt-8 grid grid-cols-3 gap-4">
            {[
              { value: "1.200+", label: "Casos gerenciados" },
              { value: "98%", label: "Satisfação clínicas" },
              { value: "48h", label: "Tempo médio entrega" },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-white/15 bg-white/8 p-3 backdrop-blur-sm">
                <div className="text-xl font-bold text-white">{s.value}</div>
                <div className="mt-0.5 text-[11px] text-white/60">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Rodapé */}
        <div className="relative z-10 text-[11px] text-white/40">
          &copy; {new Date().getFullYear()} Aurora Tec Studio. Todos os direitos reservados.
        </div>
      </div>

      {/* Painel direito — formulário */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        {/* Logo mobile */}
        <div className="mb-8 flex items-center gap-2 lg:hidden">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <span className="text-sm font-bold">A</span>
          </div>
          <div className="leading-none">
            <div className="text-sm font-semibold tracking-tight">Aurora Tec Studio</div>
            <div className="mt-0.5 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Dental Workflow</div>
          </div>
        </div>

        <div className="w-full max-w-[400px]">
          <div className="mb-8">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Entrar na plataforma</h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Use suas credenciais de acesso para continuar.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* E-mail */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-medium uppercase tracking-[0.1em] text-muted-foreground">
                E-mail
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com.br"
                  className="w-full rounded-xl border border-border bg-card py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/60 transition focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/15"
                />
              </div>
            </div>

            {/* Senha */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="text-xs font-medium uppercase tracking-[0.1em] text-muted-foreground">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-border bg-card py-3 pl-10 pr-11 text-sm text-foreground placeholder:text-muted-foreground/60 transition focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/15"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Erro */}
            {error && (
              <div className="rounded-xl border border-destructive/30 bg-destructive/8 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

            {/* Botão */}
            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Verificando..." : "Entrar"}
            </button>
          </form>

          {/* Credenciais de demo */}
          <div className="mt-8 rounded-xl border border-border/80 bg-card p-4">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Credenciais de demonstração
            </p>
            <div className="space-y-2">
              {DEMO_CREDENTIALS.map((c) => (
                <button
                  key={c.email}
                  type="button"
                  onClick={() => { setEmail(c.email); setPassword(c.password); setError(null); }}
                  className="flex w-full items-center gap-3 rounded-lg border border-border/60 bg-background px-3 py-2.5 text-left transition hover:border-primary/40 hover:bg-secondary"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#0979b0] to-[#0cb7f2] text-[10px] font-bold text-white">
                    {c.name.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-xs font-medium text-foreground">{c.name}</div>
                    <div className="truncate text-[10px] text-muted-foreground">{c.email}</div>
                  </div>
                  <span className="shrink-0 rounded-full bg-secondary px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">
                    {c.role}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
