'use client';

import React from 'react';
import { ArrowRight, Clock3, ShieldCheck } from 'lucide-react';

export interface RunHistorySummary {
  id: string;
  analyzedAt: string;
  provider: string;
  model: string;
  taskCount: number;
  tiers: { light: number; standard: number; frontier: number };
}

export function HistoryPage({ runs, onCreate }: { runs: RunHistorySummary[]; onCreate: () => void }) {
  return <main className="history-page dashboard-page">
    <header className="page-heading"><div><p className="page-kicker">SESSION</p><h1>History</h1><p>Recent analyses held in this browser session. Rung does not save PRDs or run history.</p></div><button type="button" className="dashboard-primary" onClick={onCreate}>New plan <ArrowRight size={15}/></button></header>
    {runs.length ? <section className="history-list" aria-label="Recent routing analyses">{runs.map((run, index) => <article className="history-row" key={run.id}><span className="history-number">{String(runs.length - index).padStart(2, '0')}</span><div className="history-main"><h2>Routing analysis</h2><p><Clock3 size={13}/>{new Date(run.analyzedAt).toLocaleString()}</p><small>{run.provider} · {run.model}</small></div><div className="history-count"><strong>{run.taskCount}</strong><span>{run.taskCount === 1 ? 'task' : 'tasks'}</span></div><div className="history-tiers"><span className="light">{run.tiers.light} Light</span><span className="standard">{run.tiers.standard} Standard</span><span className="frontier">{run.tiers.frontier} Frontier</span></div></article>)}</section> : <section className="history-empty"><span><Clock3 size={21}/></span><h2>No analyses in this session</h2><p>After a live AI analysis, its provider and tier counts will appear here until you refresh or close this tab.</p><button type="button" className="dashboard-primary" onClick={onCreate}>Create a plan <ArrowRight size={15}/></button></section>}
    <p className="history-privacy"><ShieldCheck size={15}/> Only run summaries are kept in memory during this session. PRD text is not included.</p>
    <style jsx>{`.history-page{max-width:1320px}.history-list{display:flex;flex-direction:column;border:1px solid var(--color-rule);border-radius:12px;background:var(--color-paper);overflow:hidden}.history-row{display:grid;grid-template-columns:40px minmax(220px,1fr) 70px minmax(190px,.8fr);gap:14px;align-items:center;padding:16px;border-bottom:1px solid var(--color-rule)}.history-row:last-child{border-bottom:0}.history-number{color:var(--color-muted);font:11px var(--font-mono),monospace}.history-main h2{font-size:13px;margin-bottom:4px}.history-main p{display:flex;align-items:center;gap:5px;color:var(--color-muted);font-size:10px}.history-main small{display:block;margin-top:5px;color:var(--color-accent);font:10px var(--font-mono),monospace;overflow-wrap:anywhere}.history-count{display:flex;flex-direction:column;align-items:center}.history-count strong{font-size:20px}.history-count span{font-size:9px;color:var(--color-muted)}.history-tiers{display:flex;gap:7px;flex-wrap:wrap}.history-tiers span{padding:5px 7px;border-radius:999px;background:var(--color-paper-2);font-size:9px;font-weight:700}.history-tiers .light{color:var(--tier-light)}.history-tiers .standard{color:var(--tier-standard)}.history-tiers .frontier{color:var(--tier-frontier)}.history-empty{min-height:290px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:32px;border:1px dashed var(--color-rule);border-radius:12px;background:var(--color-paper)}.history-empty>span{display:grid;place-items:center;width:45px;height:45px;border-radius:50%;background:var(--color-paper-2);color:var(--color-accent);margin-bottom:12px}.history-empty h2{font-size:17px;margin-bottom:6px}.history-empty p{max-width:420px;color:var(--color-muted);font-size:11px;line-height:1.55;margin-bottom:15px}.history-empty .dashboard-primary{min-height:38px}.history-privacy{display:flex;align-items:center;gap:7px;color:var(--color-muted);font-size:10px;margin-top:18px}.history-privacy svg{color:var(--color-accent)}@media(max-width:700px){.history-page{padding-bottom:82px}.history-row{grid-template-columns:28px minmax(0,1fr) 45px;gap:8px;padding:12px}.history-tiers{grid-column:2/-1}.history-count strong{font-size:17px}}`}</style>
  </main>;
}
