import { useMemo, useState } from "react";
import {
  Activity,
  Building2,
  CalendarDays,
  DoorOpen,
  FileText,
  Flame,
  GanttChart,
  LayoutGrid,
  List,
  Map,
  Search,
  ShieldAlert,
  Sparkles,
  Sun,
  Users,
  Wand2,
  X,
} from "lucide-react";
import {
  DAYS,
  LOCATIONS,
  SESSIONS,
  TRAINERS,
  applySchedule,
  kpisFor,
  locationById,
  tickerItems,
  trainerById,
  trainerLoad,
} from "./data";
import type { Session, ViewId } from "./types";
import { FillBar, Panel, ScoreRing, TagChip } from "./ui";
import {
  AnalyticsView,
  CityView,
  ControlView,
  GridView,
  HeatmapView,
  ListView,
  MultiView,
  ReportView,
  RoomsView,
  TimelineView,
  TrainerView,
} from "./views";

const VIEWS: { id: ViewId; label: string; icon: typeof LayoutGrid }[] = [
  { id: "grid", label: "Grid", icon: LayoutGrid },
  { id: "timeline", label: "Timeline", icon: GanttChart },
  { id: "list", label: "List", icon: List },
  { id: "trainer", label: "Trainers", icon: Users },
  { id: "multi", label: "Multi-location", icon: Building2 },
  { id: "city", label: "Intra-city", icon: Map },
  { id: "heatmap", label: "Heatmap", icon: Flame },
  { id: "rooms", label: "Rooms", icon: DoorOpen },
  { id: "analytics", label: "Analytics", icon: Activity },
  { id: "control", label: "Control", icon: ShieldAlert },
  { id: "report", label: "Report", icon: FileText },
];

const AI_STEPS = [
  "Reading historic fill & no-show curves…",
  "Balancing trainer constraints across houses…",
  "Protecting prime cycle and Strength Lab…",
  "Drafting the week of 10 August…",
];

export default function App() {
  const [locationId, setLocationId] = useState("kwality");
  const [view, setView] = useState<ViewId>("grid");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [focusTrainer, setFocusTrainer] = useState<string | null>(null);
  const [pinned, setPinned] = useState<string[]>([]);
  const [reassigned, setReassigned] = useState<Record<string, string>>({});
  const [optimized, setOptimized] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiStep, setAiStep] = useState(0);
  const [railOpen, setRailOpen] = useState(false);

  const location = locationById(locationId);
  const all = useMemo(() => applySchedule(SESSIONS, { pinned, reassigned, optimized }), [pinned, reassigned, optimized]);
  const sessions = useMemo(() => all.filter((s) => s.locationId === locationId), [all, locationId]);
  const kpis = kpisFor(sessions, pinned);
  const loads = trainerLoad(sessions);
  const ticker = tickerItems(sessions, location.name);
  const selected = sessions.find((s) => s.id === selectedId) ?? all.find((s) => s.id === selectedId) ?? null;

  function runAi(kind: "generate" | "optimize") {
    setAiOpen(true);
    setAiStep(0);
    let i = 0;
    const timer = setInterval(() => {
      i += 1;
      setAiStep(i);
      if (i >= AI_STEPS.length) {
        clearInterval(timer);
        setTimeout(() => {
          if (kind === "optimize") setOptimized(true);
          setAiOpen(false);
        }, 500);
      }
    }, 700);
  }

  function onSelect(s: Session) {
    setSelectedId(s.id);
  }

  return (
    <div className="min-h-screen bg-white text-ivory">
      <div className="grain" />
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-24 -top-32 h-[28rem] w-[28rem] rounded-full bg-[#005eed]/8 blur-[120px]" />
        <div className="absolute right-0 top-1/4 h-[26rem] w-[26rem] rounded-full bg-[#0e1729]/5 blur-[120px]" />
      </div>

      <div className="relative flex min-h-screen">
        <aside
          className={`${
            railOpen ? "fixed inset-y-0 left-0 z-40" : "hidden"
          } w-[88px] flex-col border-r border-line bg-white/80 backdrop-blur-xl lg:flex`}
        >
          <div className="flex h-[72px] items-center justify-center border-b border-line">
            <img src="/images/athena-mark.png" alt="Athena" className="h-10 w-10 rounded-xl object-cover ring-1 ring-gold/30" />
          </div>
          <nav className="flex flex-1 flex-col items-center gap-1 py-3">
            {VIEWS.map((v) => (
              <button
                key={v.id}
                title={v.label}
                data-active={view === v.id}
                onClick={() => {
                  setView(v.id);
                  setRailOpen(false);
                }}
                className="rail-btn flex h-12 w-12 flex-col items-center justify-center rounded-2xl text-mist transition hover:text-ivory"
              >
                <v.icon className="h-4 w-4" />
                <span className="mt-1 text-[8px] uppercase tracking-wider">{v.label.split("-")[0]}</span>
              </button>
            ))}
          </nav>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex flex-wrap items-center gap-3 border-b border-line bg-white px-4 py-3 lg:px-6">
            <button
              className="rounded-xl p-2 text-mist ring-1 ring-line lg:hidden"
              onClick={() => setRailOpen((o) => !o)}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <div className="min-w-[180px]">
              <p className="font-serif text-[28px] leading-none tracking-tight text-ivory">
                Athena <span className="italic text-gold">Scheduler</span>
              </p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.22em] text-mist">AI class schedule intelligence</p>
            </div>
            <div className="relative min-w-[200px] flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mist" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search class, trainer, studio…"
                className="w-full rounded-2xl border border-line bg-[#efefef] py-2.5 pl-10 pr-3 text-sm outline-none placeholder:text-mist/70 focus:border-[#005eed]"
              />
            </div>
            <div className="flex items-center gap-2 text-xs text-mist">
              <span className="hidden items-center gap-1.5 rounded-full bg-white px-3 py-1.5 ring-1 ring-line sm:inline-flex">
                <span className="live-dot h-1.5 w-1.5 rounded-full bg-gold" />
                Working solo
              </span>
              <span className="hidden items-center gap-1.5 rounded-full bg-white px-3 py-1.5 ring-1 ring-line md:inline-flex">
                <Sun className="h-3.5 w-3.5 text-gold" />
                Week of 10–16 Aug
              </span>
              <span className="hidden items-center gap-1.5 rounded-full bg-white px-3 py-1.5 ring-1 ring-line xl:inline-flex">
                <CalendarDays className="h-3.5 w-3.5" />
                10 / 08 / 2026
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button className="rounded-xl bg-white px-3 py-2 text-xs text-mist ring-1 ring-line hover:text-ivory">Finalize PDF</button>
              <button
                onClick={() => runAi("generate")}
                className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-2 text-xs text-ivory ring-1 ring-line hover:bg-ink"
              >
                <Sparkles className="h-3.5 w-3.5 text-gold" />
                Generate
              </button>
              <button
                onClick={() => runAi("optimize")}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#005eed] px-3 py-2 text-xs font-semibold text-white shadow-[0_8px_24px_-10px_rgba(0,94,237,0.55)]"
              >
                <Wand2 className="h-3.5 w-3.5" />
                Optimize with AI
              </button>
            </div>
          </header>

          <div className="overflow-hidden border-b border-line bg-[#efefef]">
            <div className="marquee flex w-max gap-6 py-2 pr-6 text-[11px]">
              {[...ticker, ...ticker].map((item, i) => (
                <span key={i} className="inline-flex items-center gap-2">
                  <span className="text-mist">{item.label}</span>
                  <span
                    className={
                      item.tone === "good"
                        ? "text-emerald-700"
                        : item.tone === "warn"
                          ? "text-amber-700"
                          : item.tone === "bad"
                            ? "text-rose-700"
                            : item.tone === "gold"
                              ? "text-gold"
                              : "text-ivory"
                    }
                  >
                    {item.value}
                  </span>
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 border-b border-line px-4 py-3 lg:px-6">
            {LOCATIONS.map((loc) => {
              const active = loc.id === locationId;
              const n = all.filter((s) => s.locationId === loc.id).length;
              return (
                <button
                  key={loc.id}
                  onClick={() => setLocationId(loc.id)}
                  className={`rounded-full px-3.5 py-1.5 text-sm transition ${
                    active ? "bg-gold text-white" : "bg-white text-mist ring-1 ring-line hover:text-ivory"
                  }`}
                >
                  {loc.name}
                  <span className={`ml-2 text-[10px] ${active ? "text-white/80" : "text-mist"}`}>{n}</span>
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-2 gap-2 px-4 py-4 sm:grid-cols-3 xl:grid-cols-9 lg:px-6">
            {kpis.map((k) => (
              <div key={k.key} className="panel rounded-2xl px-3 py-3">
                <p className="text-[9px] uppercase tracking-[0.16em] text-mist">{k.label}</p>
                <p
                  className={`mt-1 font-serif text-[26px] leading-none ${
                    k.tone === "good" ? "text-emerald-700" : k.tone === "warn" ? "text-amber-700" : k.tone === "bad" ? "text-rose-700" : "text-ivory"
                  }`}
                >
                  {k.value}
                </p>
                <p className="mt-1 text-[10px] text-mist">{k.hint}</p>
              </div>
            ))}
          </div>

          {(view === "grid" || view === "trainer") && (
            <div className="px-4 pb-3 lg:px-6">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-[10px] uppercase tracking-[0.2em] text-mist">Trainer workload</p>
                <p className="text-[11px] text-mist">{loads.length} on the floor</p>
              </div>
              <div className="hide-scroll flex gap-2 overflow-x-auto pb-1">
                {loads.map((t) => {
                  const active = focusTrainer === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setFocusTrainer(active ? null : t.id)}
                      className={`min-w-[132px] rounded-2xl p-2.5 text-left ring-1 transition ${
                        active ? "bg-gold/10 ring-gold/40" : "bg-white ring-line hover:ring-gold/25"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <img src={t.photo} alt="" className="h-8 w-8 rounded-full object-cover" />
                        <div className="min-w-0">
                          <p className="truncate text-[12px] text-ivory">{t.name.split(" ")[0]}</p>
                          <p className="text-[10px] text-mist">{t.hours}h · {t.classes}</p>
                        </div>
                      </div>
                      <div className="mt-2 h-1 overflow-hidden rounded-full bg-line">
                        <div className="h-full rounded-full bg-gold" style={{ width: `${Math.min(100, t.hours * 10)}%` }} />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <main className="min-h-0 flex-1 px-4 pb-8 lg:px-6">
            {view === "grid" && (
              <GridView sessions={sessions} pinned={pinned} focusTrainer={focusTrainer} query={query} onSelect={onSelect} />
            )}
            {view === "timeline" && <TimelineView sessions={sessions} onSelect={onSelect} />}
            {view === "list" && <ListView sessions={sessions} pinned={pinned} onSelect={onSelect} />}
            {view === "trainer" && <TrainerView sessions={sessions} onSelect={onSelect} />}
            {view === "multi" && <MultiView all={all} onJump={(id) => { setLocationId(id); setView("grid"); }} />}
            {view === "city" && <CityView all={all} onJump={(id) => { setLocationId(id); setView("grid"); }} />}
            {view === "heatmap" && <HeatmapView sessions={sessions} />}
            {view === "rooms" && <RoomsView sessions={sessions} />}
            {view === "analytics" && <AnalyticsView sessions={sessions} />}
            {view === "control" && <ControlView sessions={sessions} onSelect={onSelect} />}
            {view === "report" && <ReportView sessions={sessions} locationName={location.name} />}
          </main>
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm" onClick={() => setSelectedId(null)}>
          <aside className="h-full w-full max-w-md overflow-y-auto border-l border-line bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-mist">{selected.studio}</p>
                <h2 className="font-serif text-3xl text-ivory">{selected.name}</h2>
                <p className="mt-1 text-sm text-mist">
                  {DAYS[selected.day].label} {DAYS[selected.day].date} · {selected.time} · {selected.duration} min
                </p>
              </div>
              <button onClick={() => setSelectedId(null)} className="rounded-xl p-2 text-mist hover:bg-ink">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-6 flex items-center gap-4">
              <ScoreRing score={selected.score} size={64} />
              <div className="flex-1">
                <FillBar fill={selected.fill} />
                <p className="mt-1 text-xs text-mist">Historic avg {selected.avg.toFixed(1)}</p>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-1.5">
              {selected.tags.map((t) => (
                <TagChip key={t} tag={t} />
              ))}
            </div>
            <Panel className="mt-6 p-4">
              <p className="text-[10px] uppercase tracking-[0.18em] text-mist">Instructor</p>
              {(() => {
                const t = trainerById(selected.trainerId);
                return (
                  <div className="mt-3 flex items-center gap-3">
                    <img src={t.photo} alt="" className="h-14 w-14 rounded-2xl object-cover" />
                    <div>
                      <p className="text-ivory">{t.name}</p>
                      <p className="text-xs text-mist">{t.specialty}</p>
                    </div>
                  </div>
                );
              })()}
              <label className="mt-4 block text-[11px] text-mist">Reassign</label>
              <select
                value={selected.trainerId}
                onChange={(e) => setReassigned((r) => ({ ...r, [selected.id]: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-line bg-ink px-3 py-2 text-sm outline-none"
              >
                {TRAINERS.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </Panel>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                onClick={() =>
                  setPinned((p) => (p.includes(selected.id) ? p.filter((id) => id !== selected.id) : [...p, selected.id]))
                }
                className={`rounded-2xl py-3 text-sm ${
                  pinned.includes(selected.id) ? "bg-gold text-white" : "bg-ink text-ivory ring-1 ring-line"
                }`}
              >
                {pinned.includes(selected.id) ? "Unpin slot" : "Pin slot"}
              </button>
              <button onClick={() => setSelectedId(null)} className="rounded-2xl bg-ink py-3 text-sm text-ivory ring-1 ring-line">
                Close
              </button>
            </div>
          </aside>
        </div>
      )}

      {aiOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-md">
          <div className="w-[min(420px,92vw)] rounded-3xl border border-gold/20 bg-white p-6 shadow-2xl">
            <p className="text-[10px] uppercase tracking-[0.22em] text-gold">Athena is thinking</p>
            <h3 className="mt-1 font-serif text-3xl text-ivory">Composing the week</h3>
            <div className="mt-5 space-y-2">
              {AI_STEPS.map((step, i) => (
                <div key={step} className={`rounded-xl px-3 py-2 text-sm ${i <= aiStep ? "bg-gold/10 text-ivory" : "text-mist"}`}>
                  {i === aiStep && <span className="shimmer mr-2 inline-block h-2 w-2 rounded-full bg-gold align-middle" />}
                  {step}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
