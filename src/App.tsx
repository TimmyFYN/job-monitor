// @ts-nocheck
import { useState, useEffect, useRef, useCallback } from "react";

const GREENHOUSE_COMPANIES = [
  { name: "Notion", slug: "notion" },
  { name: "Linear", slug: "linear" },
  { name: "Vercel", slug: "vercel" },
  { name: "Figma", slug: "figma" },
  { name: "Stripe", slug: "stripe" },
  { name: "Airbnb", slug: "airbnb" },
  { name: "Coinbase", slug: "coinbase" },
  { name: "Dropbox", slug: "dropbox" },
  { name: "Pinterest", slug: "pinterest" },
  { name: "Reddit", slug: "reddit" },
  { name: "Robinhood", slug: "robinhood" },
  { name: "Duolingo", slug: "duolingo" },
  { name: "Discord", slug: "discord" },
  { name: "Canva", slug: "canva" },
  { name: "Asana", slug: "asana" },
  { name: "HubSpot", slug: "hubspot" },
  { name: "Intercom", slug: "intercom" },
  { name: "Twilio", slug: "twilio" },
  { name: "Zendesk", slug: "zendesk" },
  { name: "Okta", slug: "okta" },
  { name: "Cloudflare", slug: "cloudflare" },
  { name: "PagerDuty", slug: "pagerduty" },
  { name: "Datadog", slug: "datadoghq" },
  { name: "Elastic", slug: "elastic" },
  { name: "HashiCorp", slug: "hashicorp" },
  { name: "Netlify", slug: "netlify" },
  { name: "Airtable", slug: "airtable" },
  { name: "Brex", slug: "brex" },
  { name: "Rippling", slug: "rippling" },
  { name: "Plaid", slug: "plaid" },
  { name: "Scale AI", slug: "scaleai" },
  { name: "Ramp", slug: "ramp" },
  { name: "Retool", slug: "retool" },
  { name: "Coda", slug: "coda" },
  { name: "Miro", slug: "miro" },
  { name: "Loom", slug: "loom" },
  { name: "Calendly", slug: "calendly" },
  { name: "Zapier", slug: "zapier" },
  { name: "Webflow", slug: "webflow" },
  { name: "Gusto", slug: "gusto" },
  { name: "Benchling", slug: "benchling" },
  { name: "MongoDB", slug: "mongodb" },
  { name: "Confluent", slug: "confluent" },
  { name: "dbt Labs", slug: "dbtlabs" },
  { name: "Amplitude", slug: "amplitude" },
  { name: "Segment", slug: "segment" },
  { name: "LaunchDarkly", slug: "launchdarkly" },
  { name: "Grafana Labs", slug: "grafanalabs" },
  { name: "Sourcegraph", slug: "sourcegraph" },
  { name: "Supabase", slug: "supabase" },
];

const LEVER_COMPANIES = [
  { name: "GitHub", slug: "github" },
  { name: "Shopify", slug: "shopify" },
  { name: "Spotify", slug: "spotify" },
  { name: "Lyft", slug: "lyft" },
  { name: "Snap", slug: "snap" },
  { name: "Medium", slug: "medium" },
  { name: "Squarespace", slug: "squarespace" },
  { name: "AngelList", slug: "angellist" },
  { name: "Liftoff", slug: "liftoff" },
  { name: "Remote.com", slug: "remote" },
  { name: "Deel", slug: "deel" },
  { name: "Mercury", slug: "mercury" },
  { name: "Vanta", slug: "vanta" },
  { name: "Gem", slug: "gem" },
  { name: "Persona", slug: "persona" },
  { name: "Postscript", slug: "postscript" },
  { name: "Attentive", slug: "attentive" },
  { name: "Podium", slug: "podium" },
  { name: "Clearbit", slug: "clearbit" },
];

const WORKABLE_COMPANIES = [
  { name: "Typeform", slug: "typeform" },
  { name: "Hotjar", slug: "hotjar" },
  { name: "Papaya Global", slug: "papayaglobal" },
  { name: "Leapsome", slug: "leapsome" },
  { name: "Pleo", slug: "pleo" },
  { name: "Personio", slug: "personio" },
  { name: "Spendesk", slug: "spendesk" },
];

const BACKEND_URL = "https://job-monitor-backend-ohgv.onrender.com";

const POLL_OPTIONS = [
  { value: 120000, label: "2 min" },
  { value: 300000, label: "5 min" },
  { value: 600000, label: "10 min" },
  { value: 900000, label: "15 min" },
];

const SOURCE_TABS = [
  { id: "all", label: "All sources" },
  { id: "greenhouse", label: "Greenhouse" },
  { id: "lever", label: "Lever" },
  { id: "workable", label: "Workable" },
  { id: "direct", label: "Direct scrape" },
];

function isRemoteRole(location = "", title = "") {
  const h = (location + " " + title).toLowerCase();
  return /remote|anywhere|worldwide|global|distributed|north america|united states|canada|europe|uk|european|emea|amer|usa|cst|est|pst|gmt|cet/.test(h);
}

function isEntryLevel(title, description = "") {
  const h = (title + " " + description).toLowerCase();
  const isSenior = /(\d+\+?\s*years?\s*(of\s*)?(experience|exp))|senior|staff|principal|lead|director|vp |vice president|manager|head of/.test(h);
  return !isSenior;
}

function jobId(source, company, title) {
  return `${source}::${company}::${title}`.toLowerCase().replace(/\s+/g, "-");
}

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

async function fetchGreenhouse(company) {
  try {
    const r = await fetch(`https://boards-api.greenhouse.io/v1/boards/${company.slug}/jobs?content=false`);
    if (!r.ok) return [];
    const d = await r.json();
    return (d.jobs || []).map((j) => ({
      id: jobId("greenhouse", company.name, j.title),
      title: j.title,
      company: company.name,
      url: j.absolute_url,
      location: j.location?.name || "Remote",
      postedAt: j.updated_at || new Date().toISOString(),
      source: "greenhouse",
      atsLabel: "Greenhouse",
      isRemote: isRemoteRole(j.location?.name || "", j.title),
      isEntryLevel: isEntryLevel(j.title),
    }));
  } catch { return []; }
}

async function fetchLever(company) {
  try {
    const r = await fetch(`https://api.lever.co/v0/postings/${company.slug}?mode=json`);
    if (!r.ok) return [];
    const d = await r.json();
    return (Array.isArray(d) ? d : []).map((j) => ({
      id: jobId("lever", company.name, j.text),
      title: j.text,
      company: company.name,
      url: j.hostedUrl,
      location: j.categories?.location || j.workplaceType || "Remote",
      postedAt: j.createdAt ? new Date(j.createdAt).toISOString() : new Date().toISOString(),
      source: "lever",
      atsLabel: "Lever",
      isRemote: isRemoteRole(j.categories?.location || "", j.text),
      isEntryLevel: isEntryLevel(j.text, j.descriptionPlain || ""),
    }));
  } catch { return []; }
}

async function fetchWorkable(company) {
  try {
    const r = await fetch(`https://apply.workable.com/api/v3/accounts/${company.slug}/jobs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: "", location: [], department: [], worktype: ["remote"], remote: true }),
    });
    if (!r.ok) return [];
    const d = await r.json();
    return (d.results || []).map((j) => ({
      id: jobId("workable", company.name, j.title),
      title: j.title,
      company: company.name,
      url: `https://apply.workable.com/${company.slug}/j/${j.shortcode}/`,
      location: j.location?.city ? `${j.location.city}, ${j.location.country}` : "Remote",
      postedAt: j.published_on || new Date().toISOString(),
      source: "workable",
      atsLabel: "Workable",
      isRemote: true,
      isEntryLevel: isEntryLevel(j.title),
    }));
  } catch { return []; }
}

async function fetchBackend(entryOnly, remoteOnly) {
  try {
    const params = new URLSearchParams();
    if (entryOnly) params.set("entryOnly", "true");
    if (remoteOnly) params.set("remote", "true");
    const r = await fetch(`${BACKEND_URL}/jobs?${params}`);
    if (!r.ok) return { jobs: [], backendOnline: false };
    const d = await r.json();
    return { jobs: d.jobs || [], backendOnline: true };
  } catch {
    return { jobs: [], backendOnline: false };
  }
}

export default function JobMonitor() {
  const [jobs, setJobs] = useState([]);
  const [dismissed, setDismissed] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem("dismissed_v2") || "[]")); }
    catch { return new Set(); }
  });
  const [seenIds, setSeenIds] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem("seen_ids_v2") || "[]")); }
    catch { return new Set(); }
  });
  const seenRef = useRef(seenIds);
  seenRef.current = seenIds;

  const [status, setStatus] = useState("idle");
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [lastChecked, setLastChecked] = useState(null);
  const [polling, setPolling] = useState(false);
  const [pollInterval, setPollInterval] = useState(300000);
  const [backendOnline, setBackendOnline] = useState(false);
  const [notifPerm, setNotifPerm] = useState(
    typeof Notification !== "undefined" ? Notification.permission : "denied"
  );
  const [entryOnly, setEntryOnly] = useState(true);
  const [remoteOnly, setRemoteOnly] = useState(true);
  const [postedWithin, setPostedWithin] = useState("any");
  const [sourceTab, setSourceTab] = useState("all");
  const [viewTab, setViewTab] = useState("new");
  const [search, setSearch] = useState("");
  const [newCount, setNewCount] = useState(0);

  const timerRef = useRef(null);

  const persistSeen = useCallback((ids) => {
    try { localStorage.setItem("seen_ids_v2", JSON.stringify([...ids].slice(-3000))); } catch {}
  }, []);

  const persistDismissed = useCallback((ids) => {
    try { localStorage.setItem("dismissed_v2", JSON.stringify([...ids].slice(-500))); } catch {}
  }, []);

  const notify = useCallback((count, sample) => {
    if (notifPerm !== "granted" || count === 0) return;
    try {
      new Notification(`${count} new job posting${count > 1 ? "s" : ""}`, {
        body: sample ? `${sample.title} · ${sample.company}` : "Tap to view",
      });
    } catch {}
  }, [notifPerm]);

  const runFetch = useCallback(async () => {
    setStatus("checking");
    const tasks = [
      ...GREENHOUSE_COMPANIES.map((c) => () => fetchGreenhouse(c)),
      ...LEVER_COMPANIES.map((c) => () => fetchLever(c)),
      ...WORKABLE_COMPANIES.map((c) => () => fetchWorkable(c)),
      () => fetchBackend(entryOnly, remoteOnly).then((r) => {
        setBackendOnline(r.backendOnline);
        return r.jobs;
      }),
    ];

    setProgress({ done: 0, total: tasks.length });
    const BATCH = 8;
    const allResults = [];
    for (let i = 0; i < tasks.length; i += BATCH) {
      const batch = tasks.slice(i, i + BATCH);
      const results = await Promise.allSettled(batch.map((t) => t()));
      for (const r of results) {
        if (r.status === "fulfilled") allResults.push(...(Array.isArray(r.value) ? r.value : []));
      }
      setProgress({ done: Math.min(i + BATCH, tasks.length), total: tasks.length });
    }

    let filtered = allResults;
    if (entryOnly) filtered = filtered.filter((j) => j.isEntryLevel);
    if (remoteOnly) filtered = filtered.filter((j) => j.isRemote);

    const currentSeen = seenRef.current;
    const fresh = [];
    const nextSeen = new Set(currentSeen);
    for (const j of filtered) {
      if (!nextSeen.has(j.id)) {
        fresh.push({ ...j, _isNew: true });
        nextSeen.add(j.id);
      }
    }

    persistSeen(nextSeen);
    setSeenIds(nextSeen);

    if (fresh.length > 0) {
      setNewCount((c) => c + fresh.length);
      notify(fresh.length, fresh[0]);
      setJobs((prev) => {
        const merged = [...fresh];
        for (const p of prev) {
          if (!fresh.some((f) => f.id === p.id)) merged.push(p);
        }
        return merged.slice(0, 2000);
      });
    }

    setLastChecked(new Date());
    setStatus("idle");
    setProgress({ done: 0, total: 0 });
  }, [entryOnly, remoteOnly, notify, persistSeen]);

  useEffect(() => {
    clearInterval(timerRef.current);
    if (polling) {
      runFetch();
      timerRef.current = setInterval(runFetch, pollInterval);
    }
    return () => clearInterval(timerRef.current);
  }, [polling, pollInterval, runFetch]);

  const dismiss = (id) => {
    setDismissed((prev) => {
      const next = new Set(prev);
      next.add(id);
      persistDismissed(next);
      return next;
    });
    setJobs((prev) => prev.filter((j) => j.id !== id));
  };

  const requestNotif = async () => {
    const p = await Notification.requestPermission();
    setNotifPerm(p);
  };

  let visible = jobs.filter((j) => !dismissed.has(j.id));
  if (sourceTab !== "all") visible = visible.filter((j) => j.source === sourceTab);
  if (search.trim()) {
    const q = search.toLowerCase();
    visible = visible.filter((j) => j.title.toLowerCase().includes(q) || j.company.toLowerCase().includes(q));
  }
  if (postedWithin !== "any") {
    const cutoff = new Date();
    if (postedWithin === "24h") cutoff.setHours(cutoff.getHours() - 24);
    if (postedWithin === "7d") cutoff.setDate(cutoff.getDate() - 7);
    if (postedWithin === "30d") cutoff.setDate(cutoff.getDate() - 30);
    visible = visible.filter((j) => new Date(j.postedAt) > cutoff);
  }

  const newJobs = visible.filter((j) => j._isNew);
  const shown = viewTab === "new" ? newJobs : visible;
  const progressPct = progress.total > 0 ? Math.round((progress.done / progress.total) * 100) : 0;
  const sourceCounts = {};
  for (const j of visible) {
    sourceCounts[j.source] = (sourceCounts[j.source] || 0) + 1;
  }

  return (
    <div style={{ fontFamily: "sans-serif", padding: "1.5rem", maxWidth: 680, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "1.25rem" }}>
        <div>
          <p style={{ fontSize: 22, fontWeight: 500, margin: 0 }}>Direct company jobs</p>
          <p style={{ fontSize: 13, color: "#666", margin: "4px 0 0" }}>
            {GREENHOUSE_COMPANIES.length + LEVER_COMPANIES.length + WORKABLE_COMPANIES.length}+ companies via Greenhouse, Lever & Workable APIs
          </p>
          <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: 12, padding: "3px 10px", borderRadius: 999, background: "#d1fae5", color: "#065f46", border: "0.5px solid #6ee7b7" }}>
              ✓ ATS APIs — always on
            </span>
            <span style={{ fontSize: 12, padding: "3px 10px", borderRadius: 999, background: backendOnline ? "#d1fae5" : "#fef3c7", color: backendOnline ? "#065f46" : "#92400e", border: `0.5px solid ${backendOnline ? "#6ee7b7" : "#fcd34d"}` }}>
              {backendOnline ? "✓ Direct scraper — online" : "⚠ Direct scraper — offline"}
            </span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {notifPerm !== "granted" && (
            <button onClick={requestNotif} style={{ fontSize: 13, padding: "6px 12px", borderRadius: 8, border: "1px solid #ddd", cursor: "pointer", background: "#fff" }}>
              🔔 Alerts
            </button>
          )}
          <button
            onClick={() => { setPolling((p) => !p); if (polling) setStatus("idle"); }}
            style={{
              padding: "7px 18px", fontSize: 13, fontWeight: 500, cursor: "pointer", borderRadius: 8,
              background: polling ? "#fee2e2" : "#d1fae5",
              color: polling ? "#991b1b" : "#065f46",
              border: polling ? "1px solid #fca5a5" : "1px solid #6ee7b7",
            }}
          >
            {polling ? "⏸ Pause" : "▶ Start"}
          </button>
        </div>
      </div>

      {/* Status bar */}
      <div style={{ background: "#f9fafb", borderRadius: 10, padding: "10px 14px", marginBottom: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", flexShrink: 0, background: status === "checking" ? "#f59e0b" : polling ? "#10b981" : "#9ca3af" }} />
          <span style={{ fontSize: 13, color: "#555", flex: 1 }}>
            {status === "checking" ? `Querying ${progress.total} companies… (${progressPct}%)` : lastChecked ? `Last checked ${timeAgo(lastChecked.toISOString())} · ${visible.length} jobs tracked` : "Press Start to begin monitoring"}
          </span>
          {newCount > 0 && (
            <span onClick={() => setNewCount(0)} style={{ background: "#ede9fe", color: "#5b21b6", border: "0.5px solid #c4b5fd", borderRadius: 999, fontSize: 12, padding: "3px 10px", cursor: "pointer", fontWeight: 500 }}>
              {newCount} new · clear
            </span>
          )}
          <button onClick={runFetch} disabled={status === "checking"} style={{ fontSize: 12, padding: "4px 10px", borderRadius: 6, border: "1px solid #ddd", cursor: "pointer", background: "#fff" }}>
            🔄 Check now
          </button>
        </div>
        {status === "checking" && progress.total > 0 && (
          <div style={{ marginTop: 8, height: 3, background: "#e5e7eb", borderRadius: 999, overflow: "hidden" }}>
            <div style={{ height: "100%", borderRadius: 999, background: "#6366f1", width: `${progressPct}%`, transition: "width 0.3s ease" }} />
          </div>
        )}
      </div>

      {/* Filters */}
      <div style={{ background: "#f9fafb", borderRadius: 10, padding: "14px 16px", marginBottom: "1.25rem" }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end", marginBottom: 12 }}>
          <div style={{ flex: 1, minWidth: 160 }}>
            <label style={{ fontSize: 11, color: "#9ca3af", display: "block", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>Search</label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Role or company name…"
              style={{ width: "100%", fontSize: 13, padding: "5px 8px", borderRadius: 6, border: "1px solid #ddd", boxSizing: "border-box" }}
            />
          </div>
          <div>
            <label style={{ fontSize: 11, color: "#9ca3af", display: "block", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>Poll every</label>
            <select value={pollInterval} onChange={(e) => setPollInterval(Number(e.target.value))} style={{ fontSize: 13, padding: "5px 8px", borderRadius: 6, border: "1px solid #ddd" }}>
              {POLL_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 11, color: "#9ca3af", display: "block", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>Posted within</label>
            <select value={postedWithin} onChange={(e) => setPostedWithin(e.target.value)} style={{ fontSize: 13, padding: "5px 8px", borderRadius: 6, border: "1px solid #ddd" }}>
              <option value="any">Any time</option>
              <option value="24h">Last 24 hours</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
            </select>
          </div>
        </div>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          {[
            { key: "entryOnly", label: "Entry-level only", val: entryOnly, set: setEntryOnly },
            { key: "remoteOnly", label: "Remote only", val: remoteOnly, set: setRemoteOnly },
          ].map((f) => (
            <label key={f.key} style={{ display: "flex", alignItems: "center", gap: 7, cursor: "pointer" }}>
              <input type="checkbox" checked={f.val} onChange={(e) => f.set(e.target.checked)} style={{ width: 14, height: 14 }} />
              <span style={{ fontSize: 13, color: "#555" }}>{f.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Source tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: "1rem", flexWrap: "wrap" }}>
        {SOURCE_TABS.map((t) => (
          <button key={t.id} onClick={() => setSourceTab(t.id)} style={{ fontSize: 12, padding: "5px 12px", borderRadius: 999, cursor: "pointer", background: sourceTab === t.id ? "#ede9fe" : "#f3f4f6", color: sourceTab === t.id ? "#5b21b6" : "#555", border: sourceTab === t.id ? "0.5px solid #c4b5fd" : "0.5px solid #e5e7eb", fontWeight: sourceTab === t.id ? 500 : 400 }}>
            {t.label}{t.id !== "all" && sourceCounts[t.id] ? ` (${sourceCounts[t.id]})` : ""}
          </button>
        ))}
      </div>

      {/* View tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid #e5e7eb", marginBottom: "1rem" }}>
        {[{ id: "new", label: `New (${newJobs.length})` }, { id: "all", label: `All tracked (${visible.length})` }].map((t) => (
          <button key={t.id} onClick={() => setViewTab(t.id)} style={{ padding: "8px 16px", fontSize: 13, fontWeight: viewTab === t.id ? 500 : 400, color: viewTab === t.id ? "#6366f1" : "#555", background: "transparent", border: "none", borderBottom: viewTab === t.id ? "2px solid #6366f1" : "2px solid transparent", cursor: "pointer", marginBottom: -1 }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Job cards */}
      {shown.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem 1rem", color: "#9ca3af", fontSize: 14 }}>
          {!polling ? "Press Start to begin monitoring" : status === "checking" ? `Querying ${progress.total} company APIs…` : "No matching jobs yet — try unchecking some filters"}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {shown.map((job) => (
            <div key={job.id} style={{ background: job._isNew ? "#faf5ff" : "#f9fafb", border: job._isNew ? "0.5px solid #c4b5fd" : "0.5px solid #e5e7eb", borderRadius: 12, padding: "13px 15px", display: "flex", gap: 12, alignItems: "flex-start" }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, flexShrink: 0, background: "#e5e7eb", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 500, color: "#6b7280" }}>
                {job.company[0].toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                  <div style={{ minWidth: 0 }}>
                    <a href={job.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 14, fontWeight: 500, color: "#111", textDecoration: "none", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {job.title}
                    </a>
                    <p style={{ fontSize: 13, color: "#666", margin: "2px 0 0" }}>{job.company}</p>
                  </div>
                  <button onClick={() => dismiss(job.id)} style={{ background: "none", border: "none", color: "#9ca3af", cursor: "pointer", padding: 2, flexShrink: 0, fontSize: 16 }}>×</button>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 8, alignItems: "center" }}>
                  {job._isNew && <span style={{ fontSize: 11, fontWeight: 500, borderRadius: 999, padding: "2px 8px", background: "#d1fae5", color: "#065f46", border: "0.5px solid #6ee7b7" }}>New</span>}
                  <span style={{ fontSize: 11, borderRadius: 999, padding: "2px 8px", background: "#f3f4f6", color: "#6b7280", border: "0.5px solid #e5e7eb" }}>{job.atsLabel || job.source}</span>
                  {job.location && <span style={{ fontSize: 11, borderRadius: 999, padding: "2px 8px", background: "#f3f4f6", color: "#555", border: "0.5px solid #e5e7eb" }}>📍 {job.location}</span>}
                  <span style={{ fontSize: 11, color: "#9ca3af", marginLeft: "auto" }}>{timeAgo(job.postedAt)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <p style={{ fontSize: 12, color: "#9ca3af", textAlign: "center", marginTop: "1.5rem" }}>
        Data pulled directly from Greenhouse, Lever & Workable company APIs — not job boards.
      </p>
    </div>
  );
}
