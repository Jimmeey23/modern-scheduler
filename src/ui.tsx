import type { ReactNode } from "react";
import { TAG_META, trainerById } from "./data";
import type { Session, Tag } from "./types";

export function ScoreRing({ score, size = 36 }: { score: number; size?: number }) {
  const r = size * 0.38;
  const c = 2 * Math.PI * r;
  const color = score >= 80 ? "#005eed" : score >= 65 ? "#0e1729" : "#e05a3c";
  return (
    <svg width={size} height={size} className="shrink-0">
      <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(27,23,19,0.1)" strokeWidth="2.5" fill="none" />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        stroke={color}
        strokeWidth="2.5"
        fill="none"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - score / 100)}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text
        x="50%"
        y="50%"
        dominantBaseline="central"
        textAnchor="middle"
        fill="#0e1729"
        fontSize={size < 34 ? 8 : 10}
        fontWeight="600"
        fontFamily="Outfit, sans-serif"
      >
        {score}
      </text>
    </svg>
  );
}

export function TagChip({ tag }: { tag: Tag }) {
  const meta = TAG_META[tag];
  return (
    <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-medium tracking-wide ring-1 ring-inset ${meta.cls}`}>
      {meta.label}
    </span>
  );
}

export function FillBar({ fill }: { fill: number }) {
  const color = fill >= 70 ? "#005eed" : fill >= 40 ? "#0e1729" : "#e05a3c";
  return (
    <div className="flex items-center gap-2">
      <div className="h-1 flex-1 overflow-hidden rounded-full bg-line">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${fill}%`, background: color }} />
      </div>
      <span className="w-8 text-right text-[10px] tabular-nums text-mist">{fill}%</span>
    </div>
  );
}

export function ClassCard({
  session,
  dimmed,
  pinned,
  onSelect,
}: {
  session: Session;
  dimmed?: boolean;
  pinned?: boolean;
  onSelect: (s: Session) => void;
}) {
  const trainer = trainerById(session.trainerId);
  return (
    <button
      onClick={() => onSelect(session)}
      className={`ticket group relative w-full rounded-2xl p-3 text-left transition duration-200 ${
        dimmed ? "opacity-30" : "opacity-100"
      } ${session.tags.includes("violation") ? "ring-1 ring-red-300" : "ring-1 ring-line hover:ring-gold/40"}`}
    >
      <span className="absolute inset-y-3 left-0 w-0.5 rounded-full" style={{ background: session.accent }} />
      <div className="flex items-start justify-between gap-2 pl-1.5">
        <div className="min-w-0">
          <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-mist">{session.studio}</p>
          <p className="mt-0.5 truncate text-[13px] font-medium text-ivory">{session.name}</p>
        </div>
        <ScoreRing score={session.score} />
      </div>
      <div className="mt-2.5 flex items-center gap-2 pl-1.5">
        <img src={trainer.photo} alt="" className="h-6 w-6 rounded-full object-cover ring-1 ring-line" />
        <span className="min-w-0 flex-1 truncate text-[11px] text-ivory/80">{trainer.name}</span>
        <span className="text-[10px] tabular-nums text-mist">{session.time}</span>
      </div>
      <div className="mt-2 flex flex-wrap gap-1 pl-1.5">
        {session.tags.slice(0, 3).map((t) => (
          <TagChip key={t} tag={t} />
        ))}
        {pinned && <span className="rounded-full bg-gold/10 px-1.5 py-0.5 text-[9px] text-gold ring-1 ring-gold/25">Pinned</span>}
      </div>
      <div className="mt-2.5 pl-1.5">
        <FillBar fill={session.fill} />
        <p className="mt-1 text-[9px] uppercase tracking-wider text-mist/80">Avg score {session.avg.toFixed(1)}</p>
      </div>
    </button>
  );
}

export function Panel({ className = "", children }: { className?: string; children: ReactNode }) {
  return <div className={`panel rounded-3xl ${className}`}>{children}</div>;
}
