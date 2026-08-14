import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { DAYS, FORMATS, LOCATIONS, TIMES, locationById, trainerById, trainerLoad } from "./data";
import type { Session } from "./types";
import { ClassCard, FillBar, Panel, ScoreRing, TagChip } from "./ui";

function Tip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-line bg-white px-3 py-2 text-xs text-ivory shadow-2xl">
      <p className="mb-1 font-medium">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
}

export function GridView({
  sessions,
  pinned,
  focusTrainer,
  query,
  onSelect,
}: {
  sessions: Session[];
  pinned: string[];
  focusTrainer: string | null;
  query: string;
  onSelect: (s: Session) => void;
}) {
  const q = query.toLowerCase();
  const matches = (s: Session) => {
    if (focusTrainer && s.trainerId !== focusTrainer) return false;
    if (!q) return true;
    const t = trainerById(s.trainerId);
    return [s.name, s.studio, t.name, s.time].join(" ").toLowerCase().includes(q);
  };

  return (
    <div className="overflow-auto pb-8">
      <div className="min-w-[1180px]">
        <div className="grid grid-cols-[72px_repeat(7,minmax(0,1fr))] gap-2 pb-2">
          <div />
          {DAYS.map((d) => {
            const count = sessions.filter((s) => s.day === d.key).length;
            return (
              <div
                key={d.key}
                className={`rounded-2xl px-3 py-2.5 text-center ${
                  d.today ? "bg-gold/10 ring-1 ring-gold/30" : "bg-white ring-1 ring-line"
                }`}
              >
                <p className="text-[10px] uppercase tracking-[0.2em] text-mist">{d.label}</p>
                <p className="font-serif text-lg text-ivory">{d.date}</p>
                <p className="text-[10px] text-gold/80">{count} classes</p>
              </div>
            );
          })}
        </div>
        <div className="space-y-2">
          {TIMES.map((time) => {
            const any = sessions.some((s) => s.time === time);
            if (!any) return null;
            return (
              <div key={time} className="grid grid-cols-[72px_repeat(7,minmax(0,1fr))] gap-2">
                <div className="sticky left-0 flex flex-col items-center pt-3">
                  <span className="font-serif text-sm text-gold">{time}</span>
                </div>
                {DAYS.map((d) => {
                  const cells = sessions.filter((s) => s.day === d.key && s.time === time);
                  return (
                    <div
                      key={d.key}
                      className={`min-h-[72px] space-y-2 rounded-2xl p-1 ${
                        d.today ? "bg-[#005eed]/[0.06]" : "bg-[#efefef]/70"
                      }`}
                    >
                      {cells.map((s) => (
                        <ClassCard
                          key={s.id}
                          session={s}
                          pinned={pinned.includes(s.id)}
                          dimmed={!matches(s)}
                          onSelect={onSelect}
                        />
                      ))}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function TimelineView({ sessions, onSelect }: { sessions: Session[]; onSelect: (s: Session) => void }) {
  const studios = [...new Set(sessions.map((s) => s.studio))];
  return (
    <div className="space-y-3 overflow-auto pb-8">
      {studios.map((studio) => (
        <Panel key={studio} className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-medium text-ivory">{studio}</h3>
            <span className="text-[11px] text-mist">{sessions.filter((s) => s.studio === studio).length} sessions</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {DAYS.map((d) => (
              <div key={d.key} className="min-w-[220px] flex-1 space-y-2">
                <p className="text-[10px] uppercase tracking-[0.16em] text-mist">
                  {d.label} {d.date}
                </p>
                {sessions
                  .filter((s) => s.studio === studio && s.day === d.key)
                  .sort((a, b) => a.time.localeCompare(b.time))
                  .map((s) => (
                    <button
                      key={s.id}
                      onClick={() => onSelect(s)}
                      className="ticket flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left ring-1 ring-line hover:ring-gold/30"
                    >
                      <span className="w-10 text-[11px] tabular-nums text-gold">{s.time}</span>
                      <span className="min-w-0 flex-1 truncate text-[12px] text-ivory">{s.name}</span>
                      <ScoreRing score={s.score} size={28} />
                    </button>
                  ))}
              </div>
            ))}
          </div>
        </Panel>
      ))}
    </div>
  );
}

export function ListView({
  sessions,
  pinned,
  onSelect,
}: {
  sessions: Session[];
  pinned: string[];
  onSelect: (s: Session) => void;
}) {
  const rows = [...sessions].sort((a, b) => a.day - b.day || a.time.localeCompare(b.time));
  return (
    <Panel className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line text-[10px] uppercase tracking-[0.16em] text-mist">
              <th className="px-4 py-3 font-medium">When</th>
              <th className="px-4 py-3 font-medium">Class</th>
              <th className="px-4 py-3 font-medium">Studio</th>
              <th className="px-4 py-3 font-medium">Trainer</th>
              <th className="px-4 py-3 font-medium">Fill</th>
              <th className="px-4 py-3 font-medium">Score</th>
              <th className="px-4 py-3 font-medium">Signals</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((s) => {
              const t = trainerById(s.trainerId);
              const day = DAYS[s.day];
              return (
                <tr key={s.id} onClick={() => onSelect(s)} className="cursor-pointer transition hover:bg-ink">
                  <td className="px-4 py-3">
                    <p className="text-ivory">
                      {day.label} {day.date}
                    </p>
                    <p className="text-[11px] text-mist">{s.time}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-ivory">{s.name}</p>
                    {pinned.includes(s.id) && <p className="text-[10px] text-gold">Pinned</p>}
                  </td>
                  <td className="px-4 py-3 text-mist">{s.studio}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <img src={t.photo} alt="" className="h-7 w-7 rounded-full object-cover" />
                      <span>{t.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 w-40">
                    <FillBar fill={s.fill} />
                  </td>
                  <td className="px-4 py-3">
                    <ScoreRing score={s.score} size={30} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {s.tags.slice(0, 3).map((tag) => (
                        <TagChip key={tag} tag={tag} />
                      ))}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

export function TrainerView({ sessions, onSelect }: { sessions: Session[]; onSelect: (s: Session) => void }) {
  const loads = trainerLoad(sessions);
  return (
    <div className="grid gap-3 xl:grid-cols-2">
      {loads.map((t) => {
        const mine = sessions.filter((s) => s.trainerId === t.id).sort((a, b) => a.day - b.day || a.time.localeCompare(b.time));
        return (
          <Panel key={t.id} className="p-4">
            <div className="flex items-center gap-3">
              <img src={t.photo} alt="" className="h-12 w-12 rounded-2xl object-cover ring-1 ring-line" />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-ivory">{t.name}</p>
                <p className="text-xs text-mist">{t.specialty}</p>
              </div>
              <div className="text-right">
                <p className="font-serif text-2xl text-gold">{t.hours}</p>
                <p className="text-[10px] uppercase tracking-wider text-mist">{t.classes} classes</p>
              </div>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-line">
              <div className="h-full rounded-full bg-[#005eed]" style={{ width: `${Math.min(100, (t.hours / 10) * 100)}%` }} />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {mine.map((s) => (
                <button
                  key={s.id}
                  onClick={() => onSelect(s)}
                  className="rounded-xl bg-ink px-2.5 py-2 text-left ring-1 ring-line hover:ring-gold/30"
                >
                  <p className="text-[10px] text-mist">
                    {DAYS[s.day].label} · {s.time}
                  </p>
                  <p className="truncate text-[12px] text-ivory">{s.name}</p>
                </button>
              ))}
            </div>
          </Panel>
        );
      })}
    </div>
  );
}

export function MultiView({ all, onJump }: { all: Session[]; onJump: (id: string) => void }) {
  return (
    <div className="grid gap-3 lg:grid-cols-5">
      {LOCATIONS.map((loc) => {
        const list = all.filter((s) => s.locationId === loc.id);
        const fill = list.reduce((a, s) => a + s.fill, 0) / (list.length || 1);
        return (
          <button key={loc.id} onClick={() => onJump(loc.id)} className="panel rounded-3xl p-4 text-left transition hover:ring-1 hover:ring-gold/30">
            <p className="text-[10px] uppercase tracking-[0.18em] text-mist">{loc.area}</p>
            <p className="mt-1 font-serif text-2xl text-ivory">{loc.name}</p>
            <p className="mt-4 font-serif text-4xl text-gold">{Math.round(fill)}%</p>
            <p className="text-[11px] text-mist">projected fill · {list.length} classes</p>
            <div className="mt-4 space-y-1.5">
              {DAYS.map((d) => {
                const n = list.filter((s) => s.day === d.key).length;
                return (
                  <div key={d.key} className="flex items-center gap-2 text-[11px]">
                    <span className="w-8 text-mist">{d.label}</span>
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-line">
                      <div className="h-full rounded-full" style={{ width: `${n * 9}%`, background: loc.accent }} />
                    </div>
                    <span className="tabular-nums text-ivory/70">{n}</span>
                  </div>
                );
              })}
            </div>
          </button>
        );
      })}
    </div>
  );
}

export function CityView({ all, onJump }: { all: Session[]; onJump: (id: string) => void }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Panel className="relative min-h-[420px] overflow-hidden p-6">
        <p className="text-[10px] uppercase tracking-[0.2em] text-mist">Mumbai · Intra-city</p>
        <h2 className="mt-1 font-serif text-3xl text-ivory">Five houses, one week</h2>
        <div className="relative mt-8 h-[300px] rounded-[28px] bg-[radial-gradient(circle_at_30%_20%,rgba(0,94,237,0.14),transparent_40%),radial-gradient(circle_at_70%_70%,rgba(14,23,41,0.08),transparent_42%),#efefef]">
          {[
            { id: "kwality", t: "18%", l: "42%" },
            { id: "supreme", t: "38%", l: "22%" },
            { id: "courtside", t: "48%", l: "55%" },
            { id: "kenkere", t: "28%", l: "70%" },
            { id: "copper", t: "68%", l: "48%" },
          ].map((p) => {
            const loc = locationById(p.id);
            const n = all.filter((s) => s.locationId === p.id).length;
            return (
              <button
                key={p.id}
                onClick={() => onJump(p.id)}
                className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-white px-3 py-1.5 text-left ring-1 ring-gold/30 shadow-sm"
                style={{ top: p.t, left: p.l }}
              >
                <span className="block text-[10px] text-gold">{n}</span>
                <span className="text-[11px] text-ivory">{loc.name}</span>
              </button>
            );
          })}
        </div>
      </Panel>
      <div className="space-y-3">
        {LOCATIONS.map((loc) => {
          const list = all.filter((s) => s.locationId === loc.id);
          const next = [...list].sort((a, b) => a.day - b.day || a.time.localeCompare(b.time))[0];
          return (
            <button key={loc.id} onClick={() => onJump(loc.id)} className="panel flex w-full items-center gap-4 rounded-3xl p-4 text-left hover:ring-1 hover:ring-gold/30">
              <div className="h-12 w-12 rounded-2xl" style={{ background: `linear-gradient(135deg, ${loc.accent}, #efefef)` }} />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-ivory">{loc.name}</p>
                <p className="text-xs text-mist">
                  {loc.area} · {loc.rooms} rooms · next {next ? `${DAYS[next.day].label} ${next.time}` : "—"}
                </p>
              </div>
              <p className="font-serif text-2xl text-gold">{list.length}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function HeatmapView({ sessions }: { sessions: Session[] }) {
  const max = Math.max(
    1,
    ...TIMES.flatMap((t) => DAYS.map((d) => sessions.filter((s) => s.day === d.key && s.time === t).reduce((a, s) => a + s.fill, 0)))
  );
  return (
    <Panel className="overflow-x-auto p-5">
      <h2 className="font-serif text-2xl text-ivory">Fill heat</h2>
      <p className="text-sm text-mist">Projected occupancy by day and start time</p>
      <div className="mt-5 min-w-[720px]">
        <div className="grid grid-cols-[72px_repeat(7,minmax(0,1fr))] gap-1.5">
          <div />
          {DAYS.map((d) => (
            <div key={d.key} className="text-center text-[11px] uppercase tracking-wider text-mist">
              {d.label}
            </div>
          ))}
          {TIMES.map((t) => (
            <div key={t} className="contents">
              <div className="py-2 text-right text-[11px] text-gold">{t}</div>
              {DAYS.map((d) => {
                const cell = sessions.filter((s) => s.day === d.key && s.time === t);
                const fill = cell.reduce((a, s) => a + s.fill, 0);
                const intensity = fill / max;
                return (
                  <div
                    key={d.key}
                    className="flex h-12 items-center justify-center rounded-xl text-[11px] tabular-nums"
                    style={{
                      background: `rgba(0,94,237,${0.06 + intensity * 0.72})`,
                      color: intensity > 0.45 ? "#ffffff" : "#0e1729",
                    }}
                    title={cell.map((s) => `${s.name} ${s.fill}%`).join("\n")}
                  >
                    {cell.length ? `${Math.round(fill / cell.length)}%` : "—"}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </Panel>
  );
}

export function RoomsView({ sessions }: { sessions: Session[] }) {
  const studios = [...new Set(sessions.map((s) => s.studio))];
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {studios.map((studio) => {
        const list = sessions.filter((s) => s.studio === studio);
        const fill = list.reduce((a, s) => a + s.fill, 0) / (list.length || 1);
        const accent = list[0]?.accent ?? "#005eed";
        return (
          <Panel key={studio} className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] text-mist">Room</p>
                <h3 className="font-serif text-2xl text-ivory">{studio}</h3>
              </div>
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: accent }} />
            </div>
            <p className="mt-6 font-serif text-4xl text-gold">{Math.round(fill)}%</p>
            <p className="text-xs text-mist">{list.length} sessions this week</p>
            <div className="mt-4 space-y-2">
              {DAYS.map((d) => {
                const n = list.filter((s) => s.day === d.key).length;
                return (
                  <div key={d.key} className="flex items-center gap-3 text-[12px]">
                    <span className="w-8 text-mist">{d.label}</span>
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-line">
                      <div className="h-full rounded-full" style={{ width: `${Math.min(100, n * 28)}%`, background: accent }} />
                    </div>
                    <span className="tabular-nums text-ivory/70">{n}</span>
                  </div>
                );
              })}
            </div>
          </Panel>
        );
      })}
    </div>
  );
}

export function AnalyticsView({ sessions }: { sessions: Session[] }) {
  const byDay = DAYS.map((d) => ({
    name: d.label,
    Fill: Math.round(sessions.filter((s) => s.day === d.key).reduce((a, s, _, arr) => a + s.fill / arr.length, 0) || 0),
    Classes: sessions.filter((s) => s.day === d.key).length,
  }));
  const byFormat = FORMATS.map((f) => ({
    name: f.name,
    n: sessions.filter((s) => s.name === f.name).length,
    fill: f.accent,
  })).filter((x) => x.n > 0);
  const loads = trainerLoad(sessions).slice(0, 8);
  return (
    <div className="grid gap-3 xl:grid-cols-3">
      <Panel className="p-5 xl:col-span-2">
        <h3 className="text-sm font-medium text-ivory">Fill vs volume</h3>
        <div className="mt-3 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={byDay}>
              <defs>
                <linearGradient id="fillG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#005eed" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#005eed" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: "#5c6578", fontSize: 11 }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fill: "#5c6578", fontSize: 11 }} />
              <Tooltip content={<Tip />} />
              <Area type="monotone" dataKey="Fill" stroke="#005eed" fill="url(#fillG)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Panel>
      <Panel className="p-5">
        <h3 className="text-sm font-medium text-ivory">Format mix</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={byFormat} dataKey="n" nameKey="name" innerRadius={48} outerRadius={70} paddingAngle={3} stroke="none">
                {byFormat.map((f) => (
                  <Cell key={f.name} fill={f.fill} />
                ))}
              </Pie>
              <Tooltip content={<Tip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-1.5">
          {byFormat.map((f) => (
            <div key={f.name} className="flex items-center gap-2 text-[11px]">
              <span className="h-2 w-2 rounded-full" style={{ background: f.fill }} />
              <span className="text-mist">{f.name}</span>
              <span className="ml-auto text-ivory">{f.n}</span>
            </div>
          ))}
        </div>
      </Panel>
      <Panel className="p-5 xl:col-span-3">
        <h3 className="text-sm font-medium text-ivory">Trainer hours</h3>
        <div className="mt-3 h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={loads.map((t) => ({ name: t.name.split(" ")[0], Hours: t.hours }))}>
              <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: "#5c6578", fontSize: 11 }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fill: "#5c6578", fontSize: 11 }} />
              <Tooltip content={<Tip />} />
              <Bar dataKey="Hours" fill="#005eed" radius={[8, 8, 8, 8]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Panel>
    </div>
  );
}

export function ControlView({ sessions, onSelect }: { sessions: Session[]; onSelect: (s: Session) => void }) {
  const groups = [
    { title: "Hard flags", items: sessions.filter((s) => s.tags.includes("violation")), tone: "text-red-700" },
    { title: "Trainer constraints", items: sessions.filter((s) => s.tags.includes("constraint")), tone: "text-orange-700" },
    { title: "Low fill watch", items: sessions.filter((s) => s.tags.includes("low")), tone: "text-rose-700" },
    { title: "New data", items: sessions.filter((s) => s.tags.includes("new")), tone: "text-violet-700" },
  ];
  return (
    <div className="grid gap-3 lg:grid-cols-2">
      {groups.map((g) => (
        <Panel key={g.title} className="p-5">
          <div className="flex items-baseline justify-between">
            <h3 className={`font-serif text-2xl ${g.tone}`}>{g.title}</h3>
            <span className="text-sm text-mist">{g.items.length}</span>
          </div>
          <div className="mt-4 space-y-2">
            {g.items.length === 0 && <p className="text-sm text-mist">Clear. Nothing in this queue.</p>}
            {g.items.map((s) => {
              const t = trainerById(s.trainerId);
              return (
                <button
                  key={s.id}
                  onClick={() => onSelect(s)}
                  className="flex w-full items-center gap-3 rounded-2xl bg-ink px-3 py-2.5 text-left ring-1 ring-line hover:ring-gold/30"
                >
                  <ScoreRing score={s.score} size={32} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-ivory">{s.name}</p>
                    <p className="text-[11px] text-mist">
                      {DAYS[s.day].label} {s.time} · {t.name} · {s.fill}%
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </Panel>
      ))}
    </div>
  );
}

export function ReportView({ sessions, locationName }: { sessions: Session[]; locationName: string }) {
  const fill = sessions.reduce((a, s) => a + s.fill, 0) / (sessions.length || 1);
  const loads = trainerLoad(sessions);
  return (
    <Panel className="overflow-hidden p-8">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
        <div>
          <p className="text-[10px] uppercase tracking-[0.24em] text-gold">Weekly intelligence</p>
          <h2 className="mt-1 font-serif text-4xl text-ivory">Week of 10–16 August</h2>
          <p className="mt-1 text-sm text-mist">{locationName} · Athena draft v3</p>
        </div>
        <div className="text-right">
          <p className="font-serif text-5xl text-gold">{Math.round(fill)}%</p>
          <p className="text-xs uppercase tracking-wider text-mist">mean projected fill</p>
        </div>
      </div>
      <div className="mt-6 grid gap-6 md:grid-cols-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-mist">Narrative</p>
          <p className="mt-2 text-sm leading-relaxed text-ivory/80">
            Prime mornings remain under-filled on Monday while weekend cycle is over-indexed. Strength Lab is the
            cleanest historic performer. One hard flag sits on Sunday evening Mat 57 — trainer coverage is thin after 18:00.
          </p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-mist">Recommendations</p>
          <ul className="mt-2 space-y-2 text-sm text-ivory/80">
            <li>Collapse Monday 07:15 Cardio Barre Plus into a single Mat lane.</li>
            <li>Protect Saturday 08:00 PowerCycle — 88% projected.</li>
            <li>Reassign Sunday 18:15 away from a junior-only cover.</li>
          </ul>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-mist">Bench</p>
          <div className="mt-2 space-y-2">
            {loads.slice(0, 5).map((t) => (
              <div key={t.id} className="flex items-center justify-between text-sm">
                <span className="text-ivory/80">{t.name}</span>
                <span className="tabular-nums text-gold">{t.hours}h</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Panel>
  );
}
 