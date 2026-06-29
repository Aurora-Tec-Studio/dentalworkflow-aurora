import { createFileRoute, useNavigate } from "@tanstack/react-router";
import React, { useMemo, useState, useEffect, useRef } from "react";
import {
  Search,
  Bell,
  Inbox,
  Settings as SettingsIcon,
  ShieldCheck,
  CheckCircle2,
  Globe,
  Wrench,
  AlertTriangle,
  Plus,
  Clock,
  Truck,
  X,
  Send,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Move3d,
  History,
  MessageSquare,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { getSession, logout, type AuthSession } from "../lib/auth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Aurora Tec Studio — Gestão de Próteses Odontológicas" },
      { name: "description", content: "Ecossistema B2B premium para gestão e intermediação de próteses odontológicas." },
      { property: "og:title", content: "Aurora Tec Studio" },
      { property: "og:description", content: "Plataforma B2B de gestão e intermediação de próteses odontológicas." },
    ],
  }),
  component: Index,
});

type Role = "MODERADOR" | "DENTISTA" | "PROTETICO";

type StepIndex = 0 | 1 | 2 | 3 | 4;

interface CaseOrder {
  id: string;
  patient: string;
  dentist: string;
  lab: string;
  type: string;
  sentAt: string;
  step: StepIndex; // current completed step index
  status: "novo" | "producao" | "triagem" | "concluido" | "ajuste" | "analise" | "caminho" | "rede";
  messages: string;
}

const STEPS = [
  "Escaneamento Enviado",
  "Laboratório Vinculado",
  "Design 3D em Validação",
  "Triagem Física na Sede",
  "Produto Entregue",
];

const ORDERS: CaseOrder[] = [
  { id: "#1024", patient: "Marina Albuquerque", dentist: "Dr. Henrique Vasques", lab: "Lab Cerâmica Prime", type: "Prótese fixa cerâmica — 3 elementos", sentAt: "28 jun, 09:14", step: 0, status: "novo", messages: "5 mensagens · última há 4 min" },
  { id: "#1025", patient: "Carlos Eduardo Lima", dentist: "Dra. Beatriz Monteiro", lab: "Odonto Digital SP", type: "Coroa unitária em zircônia", sentAt: "27 jun, 16:42", step: 1, status: "producao", messages: "Sem mensagens recentes" },
  { id: "#1026", patient: "Ana Paula Ribeiro", dentist: "Dr. Felipe Andrade", lab: "ProArt Laboratório", type: "Protocolo cerâmico superior", sentAt: "27 jun, 11:08", step: 2, status: "producao", messages: "8 mensagens · última há 23 min" },
  { id: "#1027", patient: "Jorge Mendes", dentist: "Dra. Camila Tavares", lab: "Lab Cerâmica Prime", type: "Faceta de porcelana — anteriores", sentAt: "26 jun, 14:30", step: 3, status: "triagem", messages: "2 mensagens · última há 1 hora" },
  { id: "#1028", patient: "Renata Soares", dentist: "Dr. Henrique Vasques", lab: "Odonto Digital SP", type: "Prótese parcial removível", sentAt: "25 jun, 10:55", step: 4, status: "concluido", messages: "Conversa encerrada · 14 mensagens" },
  { id: "#1029", patient: "Pedro Henrique Costa", dentist: "Dra. Beatriz Monteiro", lab: "ProArt Laboratório", type: "Coroa sobre implante — molar inferior", sentAt: "24 jun, 17:20", step: 2, status: "ajuste", messages: "7 mensagens · última há 2 min" },
];

const ROLE_LABEL: Record<Role, string> = {
  MODERADOR: "Moderador",
  DENTISTA: "Dentista",
  PROTETICO: "Protético Parceiro",
};

function Index() {
  const navigate = useNavigate();
  const [session, setSession] = useState<AuthSession | null>(null);
  const [role, setRole] = useState<Role>("MODERADOR");
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [openCase, setOpenCase] = useState<CaseOrder | null>(null);
  const [chatTarget, setChatTarget] = useState<"DENTISTA" | "PROTETICO">("DENTISTA");
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);

  useEffect(() => {
    const s = getSession();
    if (!s) {
      navigate({ to: "/login" });
    } else {
      setSession(s);
      // Define o perfil baseado na sessão
      if (s.role === "DENTISTA") setRole("DENTISTA");
      else if (s.role === "PROTETICO") setRole("PROTETICO");
      else setRole("MODERADOR");
    }
  }, [navigate]);

  function handleLogout() {
    logout();
    navigate({ to: "/login" });
  }

  const filteredOrders = useMemo(() => {
    let orders = ORDERS;
    if (activeFilter) {
      orders = orders.filter((o) => o.status === activeFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      orders = orders.filter(
        (o) =>
          o.patient.toLowerCase().includes(q) ||
          o.dentist.toLowerCase().includes(q) ||
          o.lab.toLowerCase().includes(q) ||
          o.id.toLowerCase().includes(q) ||
          o.type.toLowerCase().includes(q)
      );
    }
    return orders;
  }, [activeFilter, searchQuery]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <RoleSwitcher role={role} onChange={(r) => { setRole(r); setActiveFilter(null); }} />
      <Header role={role} session={session} onLogout={handleLogout} searchQuery={searchQuery} onSearch={setSearchQuery} />
      <main className="mx-auto max-w-[1400px] px-6 py-8 lg:px-10">
        <section className="mb-8">
          <div className="mb-5 flex items-end justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Visão geral</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Acompanhe pedidos, fluxos de produção e mensageria em tempo real.
              </p>
            </div>
            {(activeFilter || searchQuery) && (
              <button
                onClick={() => { setActiveFilter(null); setSearchQuery(""); }}
                className="text-xs font-medium text-muted-foreground transition hover:text-foreground"
              >
                Limpar filtros
              </button>
            )}
          </div>
          <QuickCards role={role} activeFilter={activeFilter} onFilter={setActiveFilter} onNewOrder={() => setShowNewOrderModal(true)} />
        </section>

        <section>
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="text-lg font-semibold tracking-tight">Pipeline de pedidos</h2>
            <span className="text-xs text-muted-foreground">{filteredOrders.length} ordens ativas</span>
          </div>
          <div className="space-y-3">
            {filteredOrders.map((order) => (
              <OrderCard key={order.id} order={order} onOpen={() => setOpenCase(order)} />
            ))}
            {filteredOrders.length === 0 && (
              <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
                {searchQuery ? `Nenhum resultado para "${searchQuery}".` : "Nenhum pedido neste filtro."}
              </div>
            )}
          </div>
        </section>
      </main>

      {openCase && (
        <CaseDrawer
          order={openCase}
          role={role}
          chatTarget={chatTarget}
          onChatTargetChange={setChatTarget}
          onClose={() => setOpenCase(null)}
        />
      )}

      {showNewOrderModal && (
        <NewOrderModal onClose={() => setShowNewOrderModal(false)} />
      )}
    </div>
  );
}

function RoleSwitcher({ role, onChange }: { role: Role; onChange: (r: Role) => void }) {
  const roles: Role[] = ["MODERADOR", "DENTISTA", "PROTETICO"];
  return (
    <div className="border-b border-border/60 bg-card/70 backdrop-blur">
      <div className="mx-auto flex max-w-[1400px] items-center justify-end gap-2 px-6 py-1.5 lg:px-10">
        <span className="flex items-center gap-1.5 text-[9px] font-medium uppercase tracking-[0.18em] text-muted-foreground/70">
          <span className="h-1 w-1 rounded-full bg-[#0cb7f2]" />
          Dev · perfil
        </span>
        <div className="flex items-center gap-0.5 rounded-full border border-border/60 bg-background/60 p-0.5">
          {roles.map((r) => (
            <button
              key={r}
              onClick={() => onChange(r)}
              className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium tracking-wide transition ${
                role === r
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {ROLE_LABEL[r]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Header({
  role,
  session,
  onLogout,
  searchQuery,
  onSearch,
}: {
  role: Role;
  session: AuthSession | null;
  onLogout: () => void;
  searchQuery: string;
  onSearch: (q: string) => void;
}) {
  const initials = session?.name
    ? session.name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase()
    : "SR";
  const displayName = session?.name?.split(" ")[0] ?? "Sofia";

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-card shadow-[0_1px_0_rgba(0,0,0,0.02)]">
      <div className="mx-auto flex max-w-[1400px] items-center gap-6 px-6 py-3 lg:px-10">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <span className="text-sm font-bold">A</span>
          </div>
          <div className="leading-none">
            <div className="text-sm font-semibold tracking-tight">Aurora Tec Studio</div>
            <div className="mt-0.5 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              Dental Workflow
            </div>
          </div>
        </div>

        <div className="mx-auto flex w-full max-w-2xl items-center gap-2 rounded-full border border-border bg-secondary px-4 py-2 transition focus-within:border-foreground/30 focus-within:bg-card">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            className="w-full bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none"
            placeholder="Buscar paciente, dentista, laboratório ou ID do caso..."
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
          />
          {searchQuery && (
            <button onClick={() => onSearch("")} className="text-muted-foreground hover:text-foreground">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button className="rounded-full p-2 text-muted-foreground transition hover:bg-secondary hover:text-foreground">
            <Bell className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-2.5 rounded-full border border-border bg-card py-1 pl-1 pr-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#0979b0] to-[#0cb7f2] text-[11px] font-semibold text-white">
              {initials}
            </div>
            <div className="leading-tight">
              <div className="text-xs font-medium">{displayName}</div>
              <div className="text-[9px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                {role}
              </div>
            </div>
          </div>
          <button
            onClick={onLogout}
            title="Sair"
            className="rounded-full p-2 text-muted-foreground transition hover:bg-secondary hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}

interface QuickCard {
  key: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  count: string;
  filter: string | null;
  primary?: boolean;
}

function QuickCards({
  role,
  activeFilter,
  onFilter,
  onNewOrder,
}: {
  role: Role;
  activeFilter: string | null;
  onFilter: (f: string | null) => void;
  onNewOrder: () => void;
}) {
  const cards: QuickCard[] = useMemo(() => {
    if (role === "MODERADOR") {
      return [
        { key: "novo", icon: <Inbox className="h-4 w-4" />, title: "Novos Pedidos", subtitle: "Aguardando triagem", count: "05", filter: "novo" },
        { key: "producao", icon: <SettingsIcon className="h-4 w-4" />, title: "Em Produção", subtitle: "Com os laboratórios", count: "12", filter: "producao" },
        { key: "triagem", icon: <ShieldCheck className="h-4 w-4" />, title: "Na Sede / Triagem", subtitle: "Peças físicas em fiscalização", count: "04", filter: "triagem" },
        { key: "concluido", icon: <CheckCircle2 className="h-4 w-4" />, title: "Concluídos", subtitle: "Entregues no mês", count: "48", filter: "concluido" },
      ];
    }
    if (role === "PROTETICO") {
      return [
        { key: "rede", icon: <Globe className="h-4 w-4" />, title: "Rede Pública", subtitle: "Novos casos disponíveis", count: "15", filter: "novo" },
        { key: "meus", icon: <Wrench className="h-4 w-4" />, title: "Meus Serviços", subtitle: "Em andamento", count: "04", filter: "producao" },
        { key: "ajuste", icon: <AlertTriangle className="h-4 w-4" />, title: "Ajustes Solicitados", subtitle: "Correções pendentes", count: "01", filter: "ajuste" },
        { key: "concl", icon: <CheckCircle2 className="h-4 w-4" />, title: "Histórico", subtitle: "Casos finalizados", count: "32", filter: "concluido" },
      ];
    }
    return [
      { key: "novo", icon: <Plus className="h-4 w-4" />, title: "Novo Pedido", subtitle: "Enviar escaneamento intraoral", count: "+", filter: null, primary: true },
      { key: "analise", icon: <Clock className="h-4 w-4" />, title: "Em Análise", subtitle: "Designs aguardando aprovação", count: "02", filter: "producao" },
      { key: "caminho", icon: <Truck className="h-4 w-4" />, title: "A Caminho", subtitle: "Próteses físicas despachadas", count: "01", filter: "triagem" },
      { key: "hist", icon: <CheckCircle2 className="h-4 w-4" />, title: "Concluídos", subtitle: "Entregues à clínica", count: "17", filter: "concluido" },
    ];
  }, [role]);

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((c) => {
        const isActive = activeFilter === c.filter && c.filter !== null;
        const isPrimary = c.primary;
        return (
          <button
            key={c.key}
            onClick={() => isPrimary ? onNewOrder() : onFilter(c.filter === activeFilter ? null : c.filter)}
            className={`group relative overflow-hidden rounded-2xl border p-5 text-left transition-all duration-200 ${
              isPrimary
                ? "border-primary bg-primary text-primary-foreground hover:opacity-95"
                : isActive
                  ? "border-primary bg-card shadow-sm"
                  : "border-border bg-card hover:border-primary/40 hover:shadow-sm"
            }`}
          >
            <div className="flex items-start justify-between">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                  isPrimary ? "bg-background/10 text-background" : "bg-secondary text-foreground"
                }`}
              >
                {c.icon}
              </div>
              <ChevronRight
                className={`h-4 w-4 transition ${
                  isPrimary ? "text-background/60" : "text-muted-foreground group-hover:translate-x-0.5 group-hover:text-foreground"
                }`}
              />
            </div>
            <div className="mt-6 flex items-baseline gap-2">
              <div className={`text-3xl font-semibold tracking-tight ${isPrimary ? "text-background" : ""}`}>
                {c.count}
              </div>
            </div>
            <div className="mt-1 text-sm font-medium">{c.title}</div>
            <div className={`mt-0.5 text-xs ${isPrimary ? "text-background/70" : "text-muted-foreground"}`}>
              {c.subtitle}
            </div>
          </button>
        );
      })}
    </div>
  );
}

function OrderCard({ order, onOpen }: { order: CaseOrder; onOpen: () => void }) {
  const isAlert = order.status === "ajuste";
  return (
    <div
      className={`group relative rounded-2xl border bg-card p-5 transition-all hover:shadow-[0_2px_12px_rgba(0,0,0,0.04)] ${
        isAlert
          ? "border-[#f5a26333] bg-[linear-gradient(180deg,#fff8f3_0%,#ffffff_55%)] shadow-[0_0_0_1px_rgba(245,162,99,0.18)]"
          : "border-border hover:border-primary/25"
      }`}
    >
      {isAlert && (
        <span className="absolute left-0 top-5 h-8 w-[3px] rounded-r-full bg-[#f59e0b]" />
      )}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-xs font-semibold text-muted-foreground">{order.id}</span>
            <span className="h-1 w-1 rounded-full bg-border" />
            <span className="truncate text-[15px] font-semibold tracking-tight">{order.patient}</span>
            <StatusPill status={order.status} />
          </div>
          <div className="mt-1.5 text-xs text-muted-foreground">
            {order.type} · <span className="text-foreground/80">{order.dentist}</span> ·{" "}
            <span className="text-foreground/80">{order.lab}</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Enviado</div>
          <div className="text-xs font-medium">{order.sentAt}</div>
        </div>
      </div>

      <div className="mt-5">
        <Stepper current={order.step} alert={isAlert} />
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <MessageSquare className="h-3.5 w-3.5" />
          <span>{order.messages}</span>
        </div>
        <button
          onClick={onOpen}
          className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-foreground transition hover:border-primary hover:bg-primary hover:text-primary-foreground"
        >
          Ver Detalhes e Mensagens
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

function Stepper({ current, alert = false }: { current: StepIndex; alert?: boolean }) {
  const activeColor = alert ? "#f59e0b" : "#0cb7f2";
  return (
    <div className="flex items-center">
      {STEPS.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={label} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-full border-2 transition ${
                  done
                    ? "border-[#0979b0] bg-[#0979b0]"
                    : active
                      ? "animate-pulse"
                      : "border-border bg-card"
                }`}
                style={
                  active
                    ? {
                        borderColor: activeColor,
                        backgroundColor: activeColor,
                        boxShadow: `0 0 0 4px ${activeColor}33`,
                      }
                    : undefined
                }
              >
                {done ? (
                  <CheckCircle2 className="h-3 w-3 text-white" strokeWidth={3} />
                ) : active ? (
                  <span className="h-1.5 w-1.5 rounded-full bg-white" />
                ) : (
                  <span className="h-1.5 w-1.5 rounded-full bg-border" />
                )}
              </div>
              <div
                className={`hidden text-center text-[10px] leading-tight md:block ${
                  done || active ? "text-foreground" : "text-muted-foreground"
                }`}
                style={{ maxWidth: 84 }}
              >
                {label}
              </div>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`mx-2 h-px flex-1 transition ${
                  done ? "bg-[#0979b0]" : "bg-border"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function StatusPill({ status }: { status: CaseOrder["status"] }) {
  const map: Record<CaseOrder["status"], { label: string; cls: string }> = {
    novo: { label: "Novo", cls: "bg-[#e6f7ff] text-[#0979b0]" },
    producao: { label: "Em produção", cls: "bg-[#e0f7ff] text-[#0a6a99]" },
    triagem: { label: "Triagem", cls: "bg-[#e6f0ff] text-[#0979b0]" },
    concluido: { label: "Concluído", cls: "bg-[#d4f5ff] text-[#0979b0]" },
    ajuste: { label: "Ajuste", cls: "bg-[#fff3e0] text-[#b35900]" },
    analise: { label: "Análise", cls: "bg-secondary text-foreground" },
    caminho: { label: "A caminho", cls: "bg-secondary text-foreground" },
    rede: { label: "Rede", cls: "bg-secondary text-foreground" },
  };
  const s = map[status];
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${s.cls}`}>
      {s.label}
    </span>
  );
}

function FileViewer3D({ order }: { order: CaseOrder }) {
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [activeView, setActiveView] = useState<"perspectiva" | "superior" | "lateral">("perspectiva");
  const [rotationAngle, setRotationAngle] = useState(0);
  const animRef = useRef<number | null>(null);
  const isAnimating = useRef(false);

  // Rotação contínua suave via requestAnimationFrame
  useEffect(() => {
    let start: number | null = null;
    function step(ts: number) {
      if (start === null) start = ts;
      const elapsed = ts - start;
      setRotationAngle((elapsed / 80) % 360);
      animRef.current = requestAnimationFrame(step);
    }
    animRef.current = requestAnimationFrame(step);
    return () => {
      if (animRef.current !== null) cancelAnimationFrame(animRef.current);
    };
  }, []);

  function handleDownload() {
    if (downloading || downloaded) return;
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      setDownloaded(true);
    }, 2200);
  }

  const fileName = `${order.id}_${order.patient.replace(/\s/g, "_")}_v3.stl`;
  const fileSize = "14,8 MB";
  const vertices = "248.502";
  const faces = "124.301";

  const viewAngles: Record<"perspectiva" | "superior" | "lateral", { rotX: number; label: string }> = {
    perspectiva: { rotX: -18, label: "Perspectiva" },
    superior:    { rotX: -90, label: "Superior" },
    lateral:     { rotX: 0,   label: "Lateral" },
  };

  const currentRotX = viewAngles[activeView].rotX;

  return (
    <div className="mt-3 overflow-hidden rounded-xl border border-white/5 bg-[#0d0f12]">
      {/* Viewport principal */}
      <div className="relative h-72 w-full select-none overflow-hidden">
        {/* Grade de fundo */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(9,121,176,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(9,121,176,0.06) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        {/* Radial glow central */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_55%,rgba(12,183,242,0.07),transparent)]" />

        {/* Eixos XYZ */}
        <div className="absolute bottom-10 left-5 flex flex-col gap-1.5">
          <span className="flex items-center gap-1.5 font-mono text-[10px] font-bold text-[#ff5f5f]">
            <span className="h-px w-5 bg-[#ff5f5f]" />X
          </span>
          <span className="flex items-center gap-1.5 font-mono text-[10px] font-bold text-[#5fff8f]">
            <span className="h-px w-5 bg-[#5fff8f]" />Y
          </span>
          <span className="flex items-center gap-1.5 font-mono text-[10px] font-bold text-[#5fb8ff]">
            <span className="h-px w-5 bg-[#5fb8ff]" />Z
          </span>
        </div>

        {/* Modelo 3D simulado — dente com rotação */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="relative"
            style={{
              transform: `rotateY(${rotationAngle}deg) rotateX(${currentRotX}deg)`,
              transformStyle: "preserve-3d",
              transition: "transform 0.4s ease",
            }}
          >
            {/* Corpo do dente — face frontal */}
            <div
              className="h-36 w-[88px] rounded-[42%_42%_48%_48%/58%_58%_42%_42%]"
              style={{
                background: "linear-gradient(160deg, rgba(255,255,255,0.97) 0%, rgba(220,235,255,0.85) 45%, rgba(180,210,240,0.55) 100%)",
                boxShadow: "0 0 0 1.5px rgba(12,183,242,0.35), 0 20px 50px -10px rgba(12,183,242,0.25), inset 0 2px 4px rgba(255,255,255,0.9)",
                backfaceVisibility: "hidden",
              }}
            />
            {/* Raízes */}
            <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
              <div
                className="h-8 w-4 rounded-b-full"
                style={{
                  background: "linear-gradient(180deg, rgba(200,220,240,0.8) 0%, rgba(160,185,215,0.4) 100%)",
                  boxShadow: "0 0 0 1px rgba(12,183,242,0.2)",
                }}
              />
              <div
                className="h-9 w-4 rounded-b-full"
                style={{
                  background: "linear-gradient(180deg, rgba(200,220,240,0.8) 0%, rgba(160,185,215,0.4) 100%)",
                  boxShadow: "0 0 0 1px rgba(12,183,242,0.2)",
                }}
              />
            </div>
            {/* Sombra no chão */}
            <div className="absolute -bottom-9 left-1/2 h-3 w-20 -translate-x-1/2 rounded-full bg-[#0cb7f2]/10 blur-lg" />
          </div>
        </div>

        {/* Tag superior esquerda — tipo de arquivo */}
        <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-md border border-white/8 bg-black/50 px-2.5 py-1.5 backdrop-blur-sm">
          <span className="h-2 w-2 animate-pulse rounded-full bg-[#0cb7f2]" />
          <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-white/80">STL · Malha 3D</span>
        </div>

        {/* Controles de câmera */}
        <div className="absolute right-3 top-3 flex gap-1">
          {[Move3d, RotateCw, ZoomIn, ZoomOut].map((Ic, i) => (
            <button
              key={i}
              className="rounded-md border border-white/8 bg-black/40 p-1.5 text-white/60 backdrop-blur-sm transition hover:border-[#0cb7f2]/40 hover:bg-[#0cb7f2]/10 hover:text-[#0cb7f2]"
            >
              <Ic className="h-3.5 w-3.5" />
            </button>
          ))}
        </div>

        {/* Alternância de ângulo de câmera */}
        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full border border-white/8 bg-black/50 p-1 backdrop-blur-sm">
          {(["perspectiva", "superior", "lateral"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setActiveView(v)}
              className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wider transition ${
                activeView === v
                  ? "bg-[#0cb7f2] text-[#0d0f12]"
                  : "text-white/50 hover:text-white/80"
              }`}
            >
              {viewAngles[v].label}
            </button>
          ))}
        </div>

        {/* Metadados técnicos */}
        <div className="absolute right-3 bottom-3 flex flex-col items-end gap-0.5">
          <span className="font-mono text-[9px] text-white/35">Vértices: {vertices}</span>
          <span className="font-mono text-[9px] text-white/35">Faces: {faces}</span>
          <span className="font-mono text-[9px] text-white/35">Escala 1:1 mm</span>
        </div>
      </div>

      {/* Rodapé — arquivo + download */}
      <div className="flex items-center justify-between gap-4 border-t border-white/5 px-4 py-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-[#0979b0]/20 text-[#0cb7f2]">
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="truncate font-mono text-[11px] font-semibold text-white/80">{fileName}</p>
              <p className="text-[10px] text-white/40">{fileSize} · Versão 3 · Aprovado em 28 jun</p>
            </div>
          </div>
        </div>

        <button
          onClick={handleDownload}
          disabled={downloading}
          className={`flex flex-shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
            downloaded
              ? "bg-[#1a3a2a] text-[#4ade80] cursor-default"
              : downloading
              ? "cursor-wait bg-[#0979b0]/30 text-[#0cb7f2]/60"
              : "bg-[#0979b0] text-white hover:bg-[#0cb7f2] hover:shadow-[0_0_16px_rgba(12,183,242,0.4)]"
          }`}
        >
          {downloaded ? (
            <>
              <CheckCircle2 className="h-3.5 w-3.5" />
              Arquivo salvo
            </>
          ) : downloading ? (
            <>
              <RotateCw className="h-3.5 w-3.5 animate-spin" />
              Preparando...
            </>
          ) : (
            <>
              <svg viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5">
                <path d="M7.25 1a.75.75 0 011.5 0v7.19l2.47-2.47a.75.75 0 111.06 1.06l-3.75 3.75a.75.75 0 01-1.06 0L3.72 6.78a.75.75 0 111.06-1.06l2.47 2.47V1z" />
                <path d="M1.5 11.75A.75.75 0 012.25 11h11.5a.75.75 0 010 1.5H2.25a.75.75 0 01-.75-.75z" />
              </svg>
              Baixar Arquivo 3D para Impressão
            </>
          )}
        </button>
      </div>
    </div>
  );
}

interface ChatMessage {
  id: number;
  from: string;
  side: "left" | "right";
  text: string;
  at: string;
}

function getInitialMessages(order: CaseOrder, role: Role, chatTarget: "DENTISTA" | "PROTETICO"): ChatMessage[] {
  const counterpart = role === "MODERADOR"
    ? (chatTarget === "DENTISTA" ? order.dentist : order.lab)
    : "Moderação Aurora";
  const isAjuste = order.status === "ajuste";
  return [
    { id: 1, from: counterpart, side: "left", text: isAjuste ? "Precisamos revisar a oclusão do caso. O dentista sinalizou interferência na distal." : "Bom dia! Recebemos o escaneamento intraoral. Tudo certo para prosseguir.", at: "09:14" },
    { id: 2, from: "Você", side: "right", text: isAjuste ? "Entendido. Vou solicitar ajuste ao laboratório e retorno em 24h." : "Perfeito. Pode vincular ao laboratório e iniciar o design.", at: "09:16" },
    { id: 3, from: counterpart, side: "left", text: "Confirmado! Já atualizei o status no sistema.", at: "09:22" },
  ];
}

function CaseDrawer({
  order,
  role,
  chatTarget,
  onChatTargetChange,
  onClose,
}: {
  order: CaseOrder;
  role: Role;
  chatTarget: "DENTISTA" | "PROTETICO";
  onChatTargetChange: (t: "DENTISTA" | "PROTETICO") => void;
  onClose: () => void;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    getInitialMessages(order, role, chatTarget)
  );
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Recria mensagens quando muda o target (moderador trocando de conversa)
  useEffect(() => {
    setMessages(getInitialMessages(order, role, chatTarget));
  }, [chatTarget, order, role]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function sendMessage() {
    const text = inputText.trim();
    if (!text) return;

    const counterpart = role === "MODERADOR"
      ? (chatTarget === "DENTISTA" ? order.dentist : order.lab)
      : "Moderação Aurora";

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    const newMsg: ChatMessage = {
      id: Date.now(),
      from: "Você",
      side: "right",
      text,
      at: timeStr,
    };
    setMessages((prev) => [...prev, newMsg]);
    setInputText("");

    // Simula resposta automática após 1.5s
    setTimeout(() => {
      const autoReplies = [
        "Recebido! Vou verificar e retorno em breve.",
        "Certo, anotado. Seguindo com o processo.",
        "Perfeito, obrigado pela atualização!",
        "Ok, estamos acompanhando o caso.",
        "Entendido. Qualquer novidade, avisamos aqui.",
      ];
      const reply: ChatMessage = {
        id: Date.now() + 1,
        from: counterpart,
        side: "left",
        text: autoReplies[Math.floor(Math.random() * autoReplies.length)],
        at: `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes() + 1).padStart(2, "0")}`,
      };
      setMessages((prev) => [...prev, reply]);
    }, 1500);
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      <div
        className="flex-1 bg-foreground/20 backdrop-blur-[2px] transition"
        onClick={onClose}
      />
      <aside className="flex h-full w-full max-w-[640px] flex-col bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-semibold text-muted-foreground">{order.id}</span>
              <span className="h-1 w-1 rounded-full bg-border" />
              <h3 className="text-base font-semibold tracking-tight">{order.patient}</h3>
            </div>
            <div className="mt-0.5 text-xs text-muted-foreground">{order.type}</div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-muted-foreground transition hover:bg-secondary hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* 3D Viewer */}
          <section className="px-6 pt-5">
            <SectionHeader title="Arquivo 3D do Caso" subtitle="Escaneamento intraoral · pronto para impressão" />
            <FileViewer3D order={order} />
          </section>

          {/* History */}
          <section className="px-6 pt-6">
            <SectionHeader
              title="Histórico de Refações"
              subtitle="Etapas que se repetiram até a aprovação"
              icon={<History className="h-3.5 w-3.5" />}
            />
            <ol className="mt-3 space-y-2">
              {[
                { v: "v3", t: "Design 3D aprovado pela clínica", at: "28 jun · 09:14", tone: "good" },
                { v: "v2", t: "Ajuste de oclusão solicitado pelo dentista", at: "27 jun · 18:02", tone: "warn" },
                { v: "v1", t: "Primeira proposta enviada pelo laboratório", at: "26 jun · 11:30", tone: "muted" },
              ].map((h) => (
                <li
                  key={h.v}
                  className="flex items-center gap-3 rounded-lg border border-border bg-background px-3 py-2.5"
                >
                  <span
                    className={`flex h-6 w-10 items-center justify-center rounded-md font-mono text-[10px] font-semibold ${
                      h.tone === "good"
                        ? "bg-[#b6ffff] text-[#0979b0]"
                        : h.tone === "warn"
                          ? "bg-[#ffe8cc] text-[#b35900]"
                          : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {h.v}
                  </span>
                  <span className="flex-1 text-xs">{h.t}</span>
                  <span className="text-[10px] text-muted-foreground">{h.at}</span>
                </li>
              ))}
            </ol>
          </section>

          {/* Chat */}
          <section className="px-6 pb-6 pt-6">
            <SectionHeader
              title="Chat blindado"
              subtitle={
                role === "MODERADOR"
                  ? "Mensageria isolada — pontas não se comunicam diretamente"
                  : "Comunicação exclusiva com a Moderação Aurora"
              }
              icon={<MessageSquare className="h-3.5 w-3.5" />}
            />

            {role === "MODERADOR" && (
              <div className="mt-3 inline-flex items-center gap-1 rounded-full border border-border bg-secondary p-1">
                {(["DENTISTA", "PROTETICO"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => onChatTargetChange(t)}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                      chatTarget === t
                        ? "bg-card text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {t === "DENTISTA" ? "↔ Dentista" : "↔ Protético"}
                  </button>
                ))}
              </div>
            )}

            <div className="mt-3 rounded-xl border border-border bg-background">
              <div className="flex max-h-64 flex-col gap-3 overflow-y-auto p-4">
                {messages.map((msg) => (
                  <ChatMsg key={msg.id} from={msg.from} side={msg.side} text={msg.text} at={msg.at} />
                ))}
                <div ref={messagesEndRef} />
              </div>
              <div className="flex items-center gap-2 border-t border-border p-3">
                <input
                  className="flex-1 rounded-full border border-border bg-card px-4 py-2 text-sm placeholder:text-muted-foreground focus:border-foreground/40 focus:outline-none"
                  placeholder={`Mensagem para ${
                    role === "MODERADOR" ? (chatTarget === "DENTISTA" ? "Dentista" : "Protético") : "Moderação"
                  }...`}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.nativeEvent.isComposing) sendMessage();
                  }}
                />
                <button
                  onClick={sendMessage}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground transition hover:opacity-90"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>

            {role !== "MODERADOR" && (
              <p className="mt-2 text-[11px] text-muted-foreground">
                Os dados de contato da contraparte são preservados pela moderação Aurora.
              </p>
            )}
          </section>
        </div>
      </aside>
    </div>
  );
}

function SectionHeader({ title, subtitle, icon }: { title: string; subtitle: string; icon?: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {icon}
        {title}
      </div>
      <div className="mt-0.5 text-xs text-muted-foreground">{subtitle}</div>
    </div>
  );
}

function ChatMsg({ from, side, text, at }: { from: string; side: "left" | "right"; text: string; at: string }) {
  return (
    <div className={`flex ${side === "right" ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[80%] ${side === "right" ? "items-end" : "items-start"} flex flex-col gap-1`}>
        <div className="text-[10px] text-muted-foreground">{from} · {at}</div>
        <div
          className={`rounded-2xl px-3.5 py-2 text-sm ${
              side === "right"
              ? "rounded-br-sm bg-primary text-primary-foreground"
              : "rounded-bl-sm border border-border bg-card text-foreground"
          }`}
        >
          {text}
        </div>
      </div>
    </div>
  );
}

const PROSTHESIS_TYPES = [
  "Prótese fixa cerâmica",
  "Coroa unitária em zircônia",
  "Protocolo cerâmico superior",
  "Faceta de porcelana",
  "Prótese parcial removível",
  "Coroa sobre implante",
  "Overdenture sobre implantes",
  "Prótese total (bimaxilar)",
];

const LABS = ["Lab Cerâmica Prime", "Odonto Digital SP", "ProArt Laboratório", "Zircônia Tech Lab"];

function NewOrderModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [patientName, setPatientName] = useState("");
  const [prosthesisType, setProsthesisType] = useState("");
  const [selectedLab, setSelectedLab] = useState("");
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (step < 3) {
      setStep((s) => (s + 1) as 2 | 3);
      return;
    }
    setSubmitted(true);
    setTimeout(onClose, 2000);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-foreground/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl bg-card shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h2 className="text-base font-semibold tracking-tight">Novo Pedido de Prótese</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">Passo {step} de 3</p>
          </div>
          <button onClick={onClose} className="rounded-full p-2 text-muted-foreground transition hover:bg-secondary hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Progress */}
        <div className="flex gap-1 px-6 pt-4">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full transition-all ${
                s <= step ? "bg-primary" : "bg-border"
              }`}
            />
          ))}
        </div>

        {submitted ? (
          <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#e6f7ff]">
              <CheckCircle2 className="h-7 w-7 text-primary" />
            </div>
            <div className="text-base font-semibold">Pedido enviado com sucesso!</div>
            <div className="text-sm text-muted-foreground">O laboratório será notificado e o caso aparecerá no pipeline em breve.</div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-6 py-5">
            {step === 1 && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold">Dados do Paciente</h3>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium uppercase tracking-[0.1em] text-muted-foreground">Nome completo do paciente</label>
                  <input
                    required
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="Ex: Maria Fernanda Santos"
                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/15"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium uppercase tracking-[0.1em] text-muted-foreground">Tipo de prótese</label>
                  <select
                    required
                    value={prosthesisType}
                    onChange={(e) => setProsthesisType(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/15"
                  >
                    <option value="">Selecione o tipo...</option>
                    {PROSTHESIS_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
            {step === 2 && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold">Escolha o Laboratório</h3>
                <div className="space-y-2">
                  {LABS.map((lab) => (
                    <button
                      key={lab}
                      type="button"
                      onClick={() => setSelectedLab(lab)}
                      className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition ${
                        selectedLab === lab ? "border-primary bg-[#e6f7ff] text-primary" : "border-border bg-background hover:border-primary/40"
                      }`}
                    >
                      <div className={`h-3 w-3 rounded-full border-2 ${selectedLab === lab ? "border-primary bg-primary" : "border-border"}`} />
                      {lab}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {step === 3 && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold">Observações Clínicas</h3>
                <div className="rounded-xl border border-border bg-background p-3.5 text-xs text-muted-foreground">
                  <strong className="text-foreground">Resumo:</strong> {patientName} — {prosthesisType} — {selectedLab}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium uppercase tracking-[0.1em] text-muted-foreground">Observações para o laboratório</label>
                  <textarea
                    rows={4}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Cor dental, considerações oclusais, arquivos de referência, etc."
                    className="w-full resize-none rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/15"
                  />
                </div>
              </div>
            )}

            <div className="mt-6 flex items-center justify-between">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep((s) => (s - 1) as 1 | 2)}
                  className="text-sm text-muted-foreground transition hover:text-foreground"
                >
                  Voltar
                </button>
              ) : <span />}
              <button
                type="submit"
                disabled={step === 2 && !selectedLab}
                className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
              >
                {step === 3 ? "Enviar Pedido" : "Continuar"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
