import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Cpu,
  Download,
  ExternalLink,
  Filter,
  Globe2,
  Info,
  Layers3,
  Microscope,
  Pickaxe,
  Radar,
  RefreshCcw,
  Search,
  ShieldAlert,
  Sparkles,
  Waves,
  Zap,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import events from "./data/events.json";
import minerals from "./data/minerals.json";

const SOURCES_LAST_REVIEWED = "May 12, 2026";

const typeMeta = {
  "New Life Discovery": { icon: Microscope, label: "Discovery" },
  "Biodiversity Baseline": { icon: Waves, label: "Biodiversity" },
  "Regulatory / Permit": { icon: ShieldAlert, label: "Permit" },
  "Government / Policy": { icon: Radar, label: "Policy" },
  "Environmental Risk": { icon: AlertTriangle, label: "Risk" },
  "Data Center Demand Signal": { icon: Cpu, label: "AI Demand" },
  "Data Center Mineral Dependency": { icon: Zap, label: "Infra" },
  "Mineral Intelligence": { icon: Pickaxe, label: "Mineral" },
};

const timeline = [
  { month: "Feb", discoveries: 8, permits: 2, market: 3, risk: 4 },
  { month: "Mar", discoveries: 12, permits: 3, market: 5, risk: 5 },
  { month: "Apr", discoveries: 5, permits: 7, market: 7, risk: 6 },
  { month: "May", discoveries: 4, permits: 11, market: 10, risk: 9 },
];

function riskComposite(item) {
  return Math.round(item.biodiversityRisk * 0.42 + item.miningMomentum * 0.34 + item.dataCenterRelevance * 0.24);
}

function severity(score) {
  if (score >= 85) return "Critical";
  if (score >= 70) return "High";
  if (score >= 50) return "Medium";
  return "Low";
}

function cls(...items) {
  return items.filter(Boolean).join(" ");
}

function exportFile(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function buildCsv(rows) {
  const headers = ["date", "region", "type", "headline", "minerals", "dataCenterRelevance", "biodiversityRisk", "miningMomentum", "riskComposite", "status", "source", "sourceUrl"];
  const safe = (v) => `"${String(v ?? "").replaceAll('"', '""')}"`;
  return [
    headers.join(","),
    ...rows.map((r) =>
      headers
        .map((h) => {
          if (h === "minerals") return safe(r.minerals.join("; "));
          if (h === "riskComposite") return riskComposite(r);
          return safe(r[h]);
        })
        .join(",")
    ),
  ].join("\n");
}

function Pill({ children, active = false, onClick }) {
  return (
    <button
      onClick={onClick}
      className={cls(
        "rounded-full border px-3 py-1.5 text-xs font-medium transition",
        active
          ? "border-cyan-300 bg-cyan-300 text-slate-950 shadow-lg shadow-cyan-500/20"
          : "border-slate-700 bg-slate-950/70 text-slate-300 hover:border-cyan-400/70 hover:text-cyan-200"
      )}
    >
      {children}
    </button>
  );
}

function Metric({ label, value, icon: Icon }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 shadow-glow">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-semibold text-white">{value}</p>
        </div>
        <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-3 text-cyan-300">
          <Icon size={22} />
        </div>
      </div>
    </div>
  );
}

function ScoreBar({ label, value }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-400">{label}</span>
        <span className="font-mono text-slate-200">{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-800">
        <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-400" style={{ width: `${Math.min(value, 100)}%` }} />
      </div>
    </div>
  );
}

function EventCard({ item, selected, onSelect }) {
  const score = riskComposite(item);
  const meta = typeMeta[item.type] || typeMeta["Mineral Intelligence"];
  const Icon = meta.icon;

  return (
    <motion.button
      layout
      onClick={() => onSelect(item)}
      className={cls(
        "group w-full rounded-3xl border p-4 text-left transition",
        selected?.id === item.id
          ? "border-cyan-300 bg-cyan-950/30 shadow-2xl shadow-cyan-900/30"
          : "border-slate-800 bg-slate-950/70 hover:border-cyan-500/60 hover:bg-slate-900/90"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex gap-3">
          <div className="rounded-2xl border border-slate-700 bg-slate-900 p-2 text-cyan-300">
            <Icon size={18} />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-slate-700 bg-slate-900 px-2 py-0.5 text-[11px] uppercase tracking-widest text-slate-400">
                {meta.label}
              </span>
              <span className="text-xs text-slate-500">{item.date}</span>
            </div>
            <h3 className="mt-2 text-base font-semibold leading-snug text-white group-hover:text-cyan-100">{item.headline}</h3>
          </div>
        </div>
        <div className="text-right">
          <div
            className={cls(
              "rounded-2xl px-3 py-2 font-mono text-sm font-bold",
              score >= 85
                ? "bg-rose-500/15 text-rose-200 ring-1 ring-rose-400/30"
                : score >= 70
                ? "bg-amber-500/15 text-amber-200 ring-1 ring-amber-400/30"
                : "bg-emerald-500/15 text-emerald-200 ring-1 ring-emerald-400/30"
            )}
          >
            {score}
          </div>
          <p className="mt-1 text-[10px] uppercase tracking-wider text-slate-500">{severity(score)}</p>
        </div>
      </div>
      <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-400">{item.summary}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {item.minerals.slice(0, 4).map((m) => (
          <span key={m} className="rounded-full bg-slate-800 px-2.5 py-1 text-xs text-slate-300">{m}</span>
        ))}
      </div>
    </motion.button>
  );
}

function PacificMap({ items, selected, onSelect }) {
  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-slate-800 bg-slate-950 shadow-2xl shadow-cyan-950/20">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,211,238,0.15),transparent_42%),radial-gradient(circle_at_74%_40%,rgba(99,102,241,0.14),transparent_35%)]" />
      <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(148,163,184,.17)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,.17)_1px,transparent_1px)] [background-size:32px_32px]" />
      <div className="relative flex items-center justify-between border-b border-slate-800 p-4">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-cyan-300">Pacific Intelligence Map</p>
          <h2 className="mt-1 text-xl font-semibold text-white">CCZ + Pacific Mineral Watch</h2>
        </div>
        <div className="rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-3 py-2 text-xs font-medium text-cyan-200">
          Interactive demo dataset
        </div>
      </div>
      <div className="relative h-[430px]">
        <div className="absolute left-[10%] top-[20%] h-40 w-20 rounded-full border border-slate-700/70 bg-slate-900/60 blur-[1px]" />
        <div className="absolute right-[10%] top-[18%] h-52 w-28 rounded-full border border-slate-700/70 bg-slate-900/60 blur-[1px]" />
        <div className="absolute bottom-[7%] left-[38%] h-16 w-48 rounded-[100%] border border-cyan-500/20 bg-cyan-400/5" />
        <div className="absolute left-[42%] top-[52%] rounded-full border border-cyan-400/20 bg-cyan-400/5 px-4 py-2 text-xs text-cyan-200">
          Clarion-Clipperton Zone
        </div>
        {items.map((item, index) => {
          const score = riskComposite(item);
          const active = selected?.id === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelect(item)}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${item.coordinates.x}%`, top: `${item.coordinates.y}%` }}
              title={item.headline}
            >
              <span className={cls("absolute inset-0 -m-3 animate-ping rounded-full", active ? "bg-cyan-300/40" : score >= 85 ? "bg-rose-400/25" : "bg-cyan-400/20")} />
              <span
                className={cls(
                  "relative flex h-10 w-10 items-center justify-center rounded-full border font-mono text-xs font-bold shadow-xl transition",
                  active
                    ? "scale-110 border-cyan-200 bg-cyan-300 text-slate-950"
                    : score >= 85
                    ? "border-rose-300/60 bg-rose-500/20 text-rose-100"
                    : "border-cyan-300/60 bg-cyan-500/20 text-cyan-100"
                )}
              >
                {index + 1}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function LinkedInPanel() {
  const post = `AI is not just a software story anymore.

It is becoming a minerals, power, infrastructure, and environmental-risk story.

I built a Pacific Seabed Intelligence Tracker to connect three worlds that are usually discussed separately:

1. Deep-sea life discoveries in the Clarion-Clipperton Zone
2. Polymetallic nodules containing manganese, nickel, copper, cobalt, and rare earth elements
3. AI/data-center demand for power, copper, cooling, and resilient supply chains

The question is not simply whether deep-sea mining is good or bad.

The better question is:

How do we scale AI infrastructure without ignoring ecosystems we barely understand?

The tracker monitors new species discoveries, mining applications, mineral relevance, environmental impact studies, and data-center demand signals.

This is where cybersecurity-style OSINT, infrastructure intelligence, critical minerals, and ocean science start to overlap.

#DataCenters #AIInfrastructure #CriticalMinerals #DeepSeaMining #SupplyChain #OSINT #OceanTech #Sustainability`;

  return (
    <div className="rounded-[2rem] border border-slate-800 bg-slate-950/80 p-5 shadow-2xl shadow-cyan-950/20">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-cyan-300">LinkedIn-ready narrative</p>
          <h2 className="mt-1 text-xl font-semibold text-white">Copy-ready launch post</h2>
        </div>
        <button
          onClick={() => navigator.clipboard?.writeText(post)}
          className="rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-200 hover:bg-cyan-400/20"
        >
          Copy post
        </button>
      </div>
      <pre className="mt-4 max-h-96 overflow-auto whitespace-pre-wrap rounded-2xl border border-slate-800 bg-black/30 p-4 text-sm leading-6 text-slate-300">
        {post}
      </pre>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl bg-slate-900/80 p-4">
          <p className="text-xs uppercase tracking-widest text-slate-500">Best audience</p>
          <p className="mt-2 text-sm text-slate-300">Data center techs, cloud infrastructure, OSINT analysts, supply-chain professionals, and energy/mining watchers.</p>
        </div>
        <div className="rounded-2xl bg-slate-900/80 p-4">
          <p className="text-xs uppercase tracking-widest text-slate-500">Best hook</p>
          <p className="mt-2 text-sm text-slate-300">AI infrastructure is physical. It needs minerals, electricity, cooling, grid capacity, and risk visibility.</p>
        </div>
        <div className="rounded-2xl bg-slate-900/80 p-4">
          <p className="text-xs uppercase tracking-widest text-slate-500">Best CTA</p>
          <p className="mt-2 text-sm text-slate-300">Ask people which source, mineral, or region should be added next.</p>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("All");
  const [mineral, setMineral] = useState("All");
  const [selected, setSelected] = useState(events[0]);
  const [view, setView] = useState("Command Center");

  const types = ["All", ...Array.from(new Set(events.map((e) => e.type)))];
  const mineralFilters = ["All", ...Array.from(new Set(events.flatMap((e) => e.minerals)))].sort((a, b) => (a === "All" ? -1 : b === "All" ? 1 : a.localeCompare(b)));

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return events
      .filter((e) => type === "All" || e.type === type)
      .filter((e) => mineral === "All" || e.minerals.includes(mineral))
      .filter((e) => {
        if (!q) return true;
        return [e.headline, e.region, e.summary, e.status, e.source, e.minerals.join(" ")].join(" ").toLowerCase().includes(q);
      })
      .sort((a, b) => riskComposite(b) - riskComposite(a));
  }, [query, type, mineral]);

  const metrics = useMemo(() => {
    const avgRisk = Math.round(filtered.reduce((sum, e) => sum + riskComposite(e), 0) / Math.max(filtered.length, 1));
    const avgDataCenter = Math.round(filtered.reduce((sum, e) => sum + e.dataCenterRelevance, 0) / Math.max(filtered.length, 1));
    const critical = filtered.filter((e) => riskComposite(e) >= 85).length;
    const discovery = filtered.filter((e) => e.type.includes("Discovery") || e.type.includes("Biodiversity")).length;
    return { avgRisk, avgDataCenter, critical, discovery };
  }, [filtered]);

  const chartRows = filtered.map((e) => ({
    name: e.type.replace("Data Center ", "DC ").replace("Environmental ", "Env ").slice(0, 14),
    risk: riskComposite(e),
    dataCenter: e.dataCenterRelevance,
    biodiversity: e.biodiversityRisk,
  }));

  const selectedScore = selected ? riskComposite(selected) : 0;

  return (
    <div className="min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(14,165,233,.22),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(99,102,241,.22),transparent_35%),radial-gradient(circle_at_50%_90%,rgba(20,184,166,.12),transparent_45%)]" />
      <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="rounded-[2rem] border border-slate-800 bg-slate-950/70 p-6 shadow-2xl shadow-cyan-950/20 backdrop-blur-xl">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.22em] text-cyan-200">
                  <Radar size={14} /> Pacific Seabed OSINT
                </span>
                <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs text-slate-400">
                  Last reviewed: {SOURCES_LAST_REVIEWED}
                </span>
              </div>
              <h1 className="mt-4 max-w-4xl text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
                Pacific Seabed Intelligence Tracker
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300 sm:text-lg">
                A high-signal tracker connecting deep-sea life discoveries, polymetallic nodules, mining permits, AI/data-center mineral demand, and environmental risk.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:w-[520px]">
              <Metric label="Avg risk" value={metrics.avgRisk} icon={Activity} />
              <Metric label="DC relevance" value={metrics.avgDataCenter} icon={Cpu} />
              <Metric label="Critical" value={metrics.critical} icon={AlertTriangle} />
              <Metric label="Bio events" value={metrics.discovery} icon={Microscope} />
            </div>
          </div>
        </header>

        <section className="mt-5 rounded-[2rem] border border-slate-800 bg-slate-950/70 p-4 backdrop-blur-xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-1 items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3">
              <Search size={18} className="text-slate-500" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search region, mineral, event, source, or risk signal..."
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {["Command Center", "Minerals", "Timeline", "LinkedIn Post"].map((v) => (
                <Pill key={v} active={view === v} onClick={() => setView(v)}>
                  {v}
                </Pill>
              ))}
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3 xl:flex-row xl:items-center">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-slate-500">
              <Filter size={14} /> Event type
            </div>
            <div className="flex flex-wrap gap-2">
              {types.slice(0, 10).map((v) => (
                <Pill key={v} active={type === v} onClick={() => setType(v)}>
                  {v === "All" ? "All events" : v.replace("Data Center ", "DC ")}
                </Pill>
              ))}
            </div>
          </div>

          <div className="mt-3 flex flex-col gap-3 xl:flex-row xl:items-center">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-slate-500">
              <Layers3 size={14} /> Mineral layer
            </div>
            <div className="flex flex-wrap gap-2">
              {mineralFilters.slice(0, 12).map((v) => (
                <Pill key={v} active={mineral === v} onClick={() => setMineral(v)}>
                  {v}
                </Pill>
              ))}
            </div>
          </div>
        </section>

        {view === "Command Center" && (
          <main className="mt-5 grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
            <div className="space-y-5">
              <PacificMap items={filtered} selected={selected} onSelect={setSelected} />
              <div className="grid gap-5 lg:grid-cols-2">
                <div className="rounded-[2rem] border border-slate-800 bg-slate-950/70 p-5 shadow-2xl shadow-cyan-950/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.28em] text-cyan-300">Signal comparison</p>
                      <h2 className="mt-1 text-xl font-semibold text-white">Composite risk ranking</h2>
                    </div>
                    <BarChart3 className="text-cyan-300" />
                  </div>
                  <div className="mt-4 h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartRows} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,.15)" />
                        <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                        <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} />
                        <Tooltip contentStyle={{ background: "#020617", border: "1px solid #1e293b", borderRadius: 16, color: "#e2e8f0" }} />
                        <Bar dataKey="risk" radius={[8, 8, 0, 0]}>
                          {chartRows.map((_, idx) => (
                            <Cell key={idx} fill="currentColor" className="text-cyan-400" />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="rounded-[2rem] border border-slate-800 bg-slate-950/70 p-5 shadow-2xl shadow-cyan-950/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.28em] text-cyan-300">Executive summary</p>
                      <h2 className="mt-1 text-xl font-semibold text-white">What this tracker watches</h2>
                    </div>
                    <RefreshCcw className="text-cyan-300" />
                  </div>
                  <div className="mt-5 space-y-4">
                    <div className="rounded-2xl bg-slate-900/80 p-4">
                      <p className="text-sm font-semibold text-white">Regulatory momentum</p>
                      <p className="mt-1 text-sm leading-6 text-slate-400">Permit activity is becoming a real policy timeline, not just a future concept.</p>
                    </div>
                    <div className="rounded-2xl bg-slate-900/80 p-4">
                      <p className="text-sm font-semibold text-white">Copper demand</p>
                      <p className="mt-1 text-sm leading-6 text-slate-400">Copper is the cleanest AI/data-center mineral tie-in: grid, substations, boards, transformers, heat sinks, and cooling.</p>
                    </div>
                    <div className="rounded-2xl bg-slate-900/80 p-4">
                      <p className="text-sm font-semibold text-white">Biodiversity uncertainty</p>
                      <p className="mt-1 text-sm leading-6 text-slate-400">New species and incomplete baselines make extraction risk hard to quantify.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <aside className="space-y-5">
              <AnimatePresence mode="wait">
                {selected && (
                  <motion.div
                    key={selected.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="rounded-[2rem] border border-cyan-400/20 bg-slate-950/80 p-5 shadow-2xl shadow-cyan-950/30"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.28em] text-cyan-300">Selected signal</p>
                        <h2 className="mt-2 text-2xl font-bold leading-tight text-white">{selected.headline}</h2>
                      </div>
                      <div className="rounded-3xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-3 text-center">
                        <p className="font-mono text-3xl font-black text-cyan-100">{selectedScore}</p>
                        <p className="text-[10px] uppercase tracking-widest text-cyan-300">Composite</p>
                      </div>
                    </div>
                    <p className="mt-4 text-sm leading-7 text-slate-300">{selected.summary}</p>
                    <div className="mt-5 space-y-3">
                      <ScoreBar label="Biodiversity risk" value={selected.biodiversityRisk} />
                      <ScoreBar label="Mining momentum" value={selected.miningMomentum} />
                      <ScoreBar label="Data-center relevance" value={selected.dataCenterRelevance} />
                      <ScoreBar label="Source confidence" value={selected.confidence} />
                    </div>
                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl bg-slate-900/80 p-4">
                        <p className="text-xs uppercase tracking-widest text-slate-500">Region</p>
                        <p className="mt-1 text-sm font-medium text-white">{selected.region}</p>
                      </div>
                      <div className="rounded-2xl bg-slate-900/80 p-4">
                        <p className="text-xs uppercase tracking-widest text-slate-500">Depth / habitat</p>
                        <p className="mt-1 text-sm font-medium text-white">{selected.depth}</p>
                      </div>
                    </div>
                    <div className="mt-5">
                      <p className="text-xs uppercase tracking-widest text-slate-500">Mineral overlap</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {selected.minerals.map((m) => (
                          <span key={m} className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs text-slate-200">{m}</span>
                        ))}
                      </div>
                    </div>
                    <div className="mt-5 rounded-2xl border border-indigo-400/20 bg-indigo-400/10 p-4">
                      <p className="flex items-center gap-2 text-sm font-semibold text-indigo-100">
                        <Sparkles size={16} /> LinkedIn angle
                      </p>
                      <p className="mt-2 text-sm leading-6 text-indigo-100/80">{selected.linkedinAngle}</p>
                    </div>
                    <a href={selected.sourceUrl} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-200 hover:bg-cyan-400/20">
                      Open source layer <ExternalLink size={16} />
                    </a>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="rounded-[2rem] border border-slate-800 bg-slate-950/70 p-4">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h2 className="text-lg font-semibold text-white">Ranked intelligence feed</h2>
                  <span className="text-xs text-slate-500">{filtered.length} signals</span>
                </div>
                <div className="max-h-[650px] space-y-3 overflow-auto pr-1">
                  {filtered.map((item) => (
                    <EventCard key={item.id} item={item} selected={selected} onSelect={setSelected} />
                  ))}
                </div>
              </div>
            </aside>
          </main>
        )}

        {view === "Minerals" && (
          <main className="mt-5 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-[2rem] border border-slate-800 bg-slate-950/70 p-5">
              <p className="text-xs uppercase tracking-[0.28em] text-cyan-300">Mineral-to-infrastructure matrix</p>
              <h2 className="mt-1 text-2xl font-bold text-white">What the seabed has to do with data centers</h2>
              <p className="mt-3 text-sm leading-7 text-slate-400">
                This layer translates ocean mineral claims into practical infrastructure relevance. Copper has the strongest direct link to AI data centers; nickel, cobalt, manganese, and rare earths mostly connect through batteries, grid resilience, alloys, power electronics, and supply-chain security.
              </p>
              <div className="mt-5 space-y-3">
                {minerals.map((m) => (
                  <div key={m.name} className="rounded-3xl border border-slate-800 bg-slate-900/70 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-2.5 py-1 font-mono text-sm font-bold text-cyan-200">{m.symbol}</span>
                          <h3 className="font-semibold text-white">{m.name}</h3>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-slate-400">{m.uses}</p>
                        <p className="mt-2 text-xs text-cyan-200/80">{m.note}</p>
                      </div>
                      <div className="min-w-20 text-right">
                        <p className="font-mono text-2xl font-black text-white">{m.score}</p>
                        <p className="text-[10px] uppercase tracking-widest text-slate-500">DC score</p>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {m.seabedSources.map((s) => (
                        <span key={s} className="rounded-full bg-slate-800 px-2.5 py-1 text-xs text-slate-300">{s}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-800 bg-slate-950/70 p-5">
              <p className="text-xs uppercase tracking-[0.28em] text-cyan-300">Exportable intelligence layer</p>
              <h2 className="mt-1 text-2xl font-bold text-white">Filtered dataset</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={() => exportFile("pacific-seabed-tracker.json", JSON.stringify(filtered, null, 2), "application/json")}
                  className="inline-flex items-center gap-2 rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-200 hover:bg-cyan-400/20"
                >
                  <Download size={16} /> Export JSON
                </button>
                <button
                  onClick={() => exportFile("pacific-seabed-tracker.csv", buildCsv(filtered), "text/csv")}
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-200 hover:border-cyan-400/50"
                >
                  <Download size={16} /> Export CSV
                </button>
              </div>
              <div className="mt-5 overflow-hidden rounded-2xl border border-slate-800">
                <div className="max-h-[620px] overflow-auto">
                  <table className="w-full min-w-[760px] text-left text-sm">
                    <thead className="sticky top-0 bg-slate-900 text-xs uppercase tracking-wider text-slate-400">
                      <tr>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">Signal</th>
                        <th className="px-4 py-3">Minerals</th>
                        <th className="px-4 py-3">Risk</th>
                        <th className="px-4 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 bg-slate-950/50">
                      {filtered.map((e) => (
                        <tr key={e.id} className="hover:bg-slate-900/70">
                          <td className="px-4 py-3 font-mono text-xs text-slate-400">{e.date}</td>
                          <td className="px-4 py-3">
                            <p className="font-medium text-white">{e.headline}</p>
                            <p className="mt-1 text-xs text-slate-500">{e.region}</p>
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-300">{e.minerals.join(", ")}</td>
                          <td className="px-4 py-3 font-mono font-bold text-cyan-200">{riskComposite(e)}</td>
                          <td className="px-4 py-3 text-xs text-slate-300">{e.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </main>
        )}

        {view === "Timeline" && (
          <main className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.85fr]">
            <div className="rounded-[2rem] border border-slate-800 bg-slate-950/70 p-5">
              <p className="text-xs uppercase tracking-[0.28em] text-cyan-300">Signal velocity</p>
              <h2 className="mt-1 text-2xl font-bold text-white">Discovery, permit, market, and risk momentum</h2>
              <div className="mt-6 h-[420px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={timeline} margin={{ left: -20, right: 20, top: 20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,.15)" />
                    <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 12 }} />
                    <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} />
                    <Tooltip contentStyle={{ background: "#020617", border: "1px solid #1e293b", borderRadius: 16, color: "#e2e8f0" }} />
                    <Line type="monotone" dataKey="discoveries" stroke="currentColor" className="text-cyan-300" strokeWidth={3} dot={{ r: 5 }} />
                    <Line type="monotone" dataKey="permits" stroke="currentColor" className="text-indigo-300" strokeWidth={3} dot={{ r: 5 }} />
                    <Line type="monotone" dataKey="market" stroke="currentColor" className="text-emerald-300" strokeWidth={3} dot={{ r: 5 }} />
                    <Line type="monotone" dataKey="risk" stroke="currentColor" className="text-rose-300" strokeWidth={3} dot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-800 bg-slate-950/70 p-5">
              <p className="text-xs uppercase tracking-[0.28em] text-cyan-300">Analyst notes</p>
              <h2 className="mt-1 text-2xl font-bold text-white">Make it feel elite</h2>
              <div className="mt-5 space-y-4">
                {[
                  ["Add data ingestion", "Update src/data/events.json weekly with new OSINT signals."],
                  ["Add GitHub Actions", "Run a scheduled job every Monday to rebuild or validate the dataset."],
                  ["Add source scoring", "Give government, peer-reviewed, wire-service, company, and social sources different confidence weights."],
                  ["Add region cards", "CCZ, Mariana region, Cook Islands, American Samoa, Japan EEZ, Alaska OCS."],
                  ["Add OSINT monitoring", "Watch NOAA, ISA, BOEM, Federal Register, Reuters, USGS, NOAA Ocean Exploration, and company filings."],
                ].map(([title, text]) => (
                  <div key={title} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                    <p className="font-semibold text-white">{title}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-400">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </main>
        )}

        {view === "LinkedIn Post" && (
          <main className="mt-5">
            <LinkedInPanel />
          </main>
        )}

        <footer className="mt-6 rounded-[2rem] border border-slate-800 bg-slate-950/70 p-5 text-sm leading-6 text-slate-400">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2">
              <Info size={16} className="text-cyan-300" />
              Prototype intelligence dashboard. Replace starter data with verified weekly updates before presenting as a live research product.
            </div>
            <div className="flex items-center gap-2 text-slate-500">
              <Globe2 size={16} /> Pacific minerals • AI infrastructure • ocean science
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
