import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
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
} from "lucide-react";

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
}

const STEPS = [
  "Escaneamento Enviado",
  "Laboratório Vinculado",
  "Design 3D em Validação",
  "Triagem Física na Sede",
  "Produto Entregue",
];

const ORDERS: CaseOrder[] = [
  { id: "#1024", patient: "Marina Albuquerque", dentist: "Dr. Henrique Vasques", lab: "Lab Cerâmica Prime", type: "Prótese fixa cerâmica — 3 elementos", sentAt: "28 jun, 09:14", step: 0, status: "novo" },
  { id: "#1025", patient: "Carlos Eduardo Lima", dentist: "Dra. Beatriz Monteiro", lab: "Odonto Digital SP", type: "Coroa unitária em zircônia", sentAt: "27 jun, 16:42", step: 1, status: "producao" },
  { id: "#1026", patient: "Ana Paula Ribeiro", dentist: "Dr. Felipe Andrade", lab: "ProArt Laboratório", type: "Protocolo cerâmico superior", sentAt: "27 jun, 11:08", step: 2, status: "producao" },
  { id: "#1027", patient: "Jorge Mendes", dentist: "Dra. Camila Tavares", lab: "Lab Cerâmica Prime", type: "Faceta de porcelana — anteriores", sentAt: "26 jun, 14:30", step: 3, status: "triagem" },
  { id: "#1028", patient: "Renata Soares", dentist: "Dr. Henrique Vasques", lab: "Odonto Digital SP", type: "Prótese parcial removível", sentAt: "25 jun, 10:55", step: 4, status: "concluido" },
  { id: "#1029", patient: "Pedro Henrique Costa", dentist: "Dra. Beatriz Monteiro", lab: "ProArt Laboratório", type: "Coroa sobre implante — molar inferior", sentAt: "24 jun, 17:20", step: 2, status: "ajuste" },
];

const ROLE_LABEL: Record<Role, string> = {
  MODERADOR: "Moderador",
  DENTISTA: "Dentista",
  PROTETICO: "Protético Parceiro",
};

function Index() {
  const [role, setRole] = useState<Role>("MODERADOR");
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [openCase, setOpenCase] = useState<CaseOrder | null>(null);
  const [chatTarget, setChatTarget] = useState<"DENTISTA" | "PROTETICO">("DENTISTA");

  const filteredOrders = useMemo(() => {
    if (!activeFilter) return ORDERS;
    return ORDERS.filter((o) => o.status === activeFilter);
  }, [activeFilter]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <RoleSwitcher role={role} onChange={(r) => { setRole(r); setActiveFilter(null); }} />
      <Header role={role} />
      <main className="mx-auto max-w-[1400px] px-6 py-8 lg:px-10">
        <section className="mb-8">
          <div className="mb-5 flex items-end justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Visão geral</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Acompanhe pedidos, fluxos de produção e mensageria em tempo real.
              </p>
            </div>
            {activeFilter && (
              <button
                onClick={() => setActiveFilter(null)}
                className="text-xs font-medium text-muted-foreground transition hover:text-foreground"
              >
                Limpar filtro ✕
              </button>
            )}
          </div>
          <QuickCards role={role} activeFilter={activeFilter} onFilter={setActiveFilter} />
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
                Nenhum pedido neste filtro.
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
    </div>
  );
}

function RoleSwitcher({ role, onChange }: { role: Role; onChange: (r: Role) => void }) {
  const roles: Role[] = ["MODERADOR", "DENTISTA", "PROTETICO"];
  return (
    <div className="border-b border-border bg-[oklch(0.97_0.002_247)]">
      <div className="mx-auto flex max-w-[1400px] items-center gap-3 px-6 py-2 lg:px-10">
        <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Modo de simulação
        </span>
        <div className="flex items-center gap-1 rounded-full border border-border bg-card p-1">
          {roles.map((r) => (
            <button
              key={r}
              onClick={() => onChange(r)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                role === r
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {ROLE_LABEL[r]}
            </button>
          ))}
        </div>
        <span className="ml-auto text-[11px] text-muted-foreground">
          MVP — alterne perfis para inspecionar permissões e fluxos
        </span>
      </div>
    </div>
  );
}

function Header({ role }: { role: Role }) {
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
          />
          <kbd className="hidden rounded border border-border bg-card px-1.5 py-0.5 text-[10px] text-muted-foreground sm:inline">
            ⌘K
          </kbd>
        </div>

        <div className="flex items-center gap-3">
          <button className="rounded-full p-2 text-muted-foreground transition hover:bg-secondary hover:text-foreground">
            <Bell className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-2.5 rounded-full border border-border bg-card py-1 pl-1 pr-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#0979b0] to-[#0cb7f2] text-[11px] font-semibold text-white">
              SR
            </div>
            <div className="leading-tight">
              <div className="text-xs font-medium">Sofia R.</div>
              <div className="text-[9px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                {role}
              </div>
            </div>
          </div>
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
}: {
  role: Role;
  activeFilter: string | null;
  onFilter: (f: string | null) => void;
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
            onClick={() => onFilter(c.filter === activeFilter ? null : c.filter)}
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
  return (
    <div className="group rounded-2xl border border-border bg-card p-5 transition-all hover:border-primary/25 hover:shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
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
        <Stepper current={order.step} />
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <MessageSquare className="h-3.5 w-3.5" />
          <span>3 mensagens · última há 12 min</span>
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

function Stepper({ current }: { current: StepIndex }) {
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
                      ? "border-[#0cb7f2] bg-[#0cb7f2]"
                      : "border-border bg-card"
                }`}
              >
                {done ? (
                  <CheckCircle2 className="h-3 w-3 text-white" strokeWidth={3} />
                ) : active ? (
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
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
            <SectionHeader title="Visualização 3D" subtitle="Arquivo STL/OBJ — escaneamento intraoral" />
            <div className="relative mt-3 overflow-hidden rounded-xl border border-border bg-[oklch(0.18_0_0)]">
              <div className="relative h-64 w-full">
                {/* Grid */}
                <div
                  className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage:
                      "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)",
                    backgroundSize: "24px 24px",
                  }}
                />
                {/* Fake tooth shape */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative">
                    <div className="h-32 w-24 rounded-[40%_40%_45%_45%/55%_55%_45%_45%] bg-gradient-to-b from-white/95 via-white/80 to-white/40 shadow-[0_30px_60px_-20px_rgba(255,255,255,0.3)]" />
                    <div className="absolute -bottom-2 left-1/2 h-3 w-20 -translate-x-1/2 rounded-full bg-white/20 blur-md" />
                  </div>
                </div>
                <div className="absolute left-3 top-3 rounded-md border border-white/10 bg-black/40 px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-white/70">
                  Viewport · STL
                </div>
                <div className="absolute right-3 top-3 flex gap-1">
                  {[Move3d, RotateCw, ZoomIn, ZoomOut].map((Ic, i) => (
                    <button
                      key={i}
                      className="rounded-md border border-white/10 bg-white/5 p-1.5 text-white/70 transition hover:bg-white/10 hover:text-white"
                    >
                      <Ic className="h-3.5 w-3.5" />
                    </button>
                  ))}
                </div>
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[10px] text-white/50">
                  <span>Vértices: 248.502</span>
                  <span>Faces: 124.301</span>
                  <span>Escala 1:1 mm</span>
                </div>
              </div>
            </div>
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
              <div className="flex flex-col gap-3 p-4">
                <ChatMsg
                  from={role === "MODERADOR" ? (chatTarget === "DENTISTA" ? "Dr. Henrique" : "Lab Cerâmica Prime") : "Moderação Aurora"}
                  side="left"
                  text={
                    role === "MODERADOR"
                      ? chatTarget === "DENTISTA"
                        ? "Bom dia, conseguem confirmar a cor A2 no protocolo cerâmico?"
                        : "Material entregue ontem, aguardando triagem na sede."
                      : "Olá, recebemos a proposta v3 do laboratório. Pode validar a oclusão?"
                  }
                  at="09:14"
                />
                <ChatMsg
                  from="Você"
                  side="right"
                  text={
                    role === "MODERADOR"
                      ? "Confirmado A2. Sigam com a usinagem cerâmica."
                      : "Validado. Pode seguir para triagem física."
                  }
                  at="09:16"
                />
                <ChatMsg
                  from={role === "MODERADOR" ? (chatTarget === "DENTISTA" ? "Dr. Henrique" : "Lab Cerâmica Prime") : "Moderação Aurora"}
                  side="left"
                  text="Perfeito, anexei o relatório do escaneamento intraoral atualizado."
                  at="09:22"
                />
              </div>
              <div className="flex items-center gap-2 border-t border-border p-3">
                <input
                  className="flex-1 rounded-full border border-border bg-card px-4 py-2 text-sm placeholder:text-muted-foreground focus:border-foreground/40 focus:outline-none"
                  placeholder={`Mensagem para ${
                    role === "MODERADOR" ? (chatTarget === "DENTISTA" ? "Dentista" : "Protético") : "Moderação"
                  }...`}
                />
                <button className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground transition hover:opacity-90">
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>

            {role !== "MODERADOR" && (
              <p className="mt-2 text-[11px] text-muted-foreground">
                🔒 Os dados de contato da contraparte são preservados pela moderação Aurora.
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
