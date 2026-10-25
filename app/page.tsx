'use client';

import React, { useEffect, useState } from 'react';
import { ArrowRight, Check, FileText, ShieldCheck, UploadCloud } from 'lucide-react';
import { LandingPage } from '../components/LandingPage';
import { Sidebar } from '../components/Sidebar';
import { MainDashboard } from '../components/MainDashboard';
import { TaskReview } from '../components/TaskReview';
import { CostSummary } from '../components/CostSummary';
import { ExportPlan } from '../components/ExportPlan';
import { HistoryPage, type RunHistorySummary } from '../components/HistoryPage';
import { SettingsPage } from '../components/SettingsPage';
import { calculateCostSummary } from '../lib/cost';
import { MODEL_PROFILES } from '../config/model-profiles';
import { applyRoutingPolicy } from '../lib/routingPolicy';
import type { RunMetadata, RoutingDecision, RoutingResponse, TaskDraft, TaskItem, Tier } from '../lib/types';

type View = 'landing' | 'home' | 'new-plan' | 'review' | 'history' | 'cost' | 'settings' | 'export';
const viewFromUrl = (): View => {
  if (typeof window === 'undefined') return 'landing';
  const value = new URLSearchParams(window.location.search).get('view');
  return value === 'home' || value === 'new-plan' || value === 'review' || value === 'history' || value === 'cost' || value === 'settings' || value === 'export' ? value : 'landing';
};

export default function Home() {
  const [currentView, setCurrentView] = useState<View>('landing');
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [run, setRun] = useState<RunMetadata | null>(null);
  const [runHistory, setRunHistory] = useState<RunHistorySummary[]>([]);
  const [planKey, setPlanKey] = useState(0);
  const [initialPrd, setInitialPrd] = useState('');
  const costSummary = calculateCostSummary(tasks, MODEL_PROFILES);
  const selectedTask = tasks.find(task => task.id === selectedTaskId) ?? tasks[0] ?? null;

  useEffect(() => {
    setCurrentView(viewFromUrl());
    const onPopState = () => setCurrentView(viewFromUrl());
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigate = (view: View, replace = false) => {
    setCurrentView(view);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (view === 'landing') url.searchParams.delete('view'); else url.searchParams.set('view', view);
      window.history[replace ? 'replaceState' : 'pushState']({}, '', `${url.pathname}${url.search}${url.hash}`);
    }
  };

  const startNewPlan = (prd: string = '') => {
    setTasks([]); setSelectedTaskId(null); setRun(null); setInitialPrd(typeof prd === 'string' ? prd : ''); setPlanKey(value => value + 1); navigate('new-plan');
  };

  const handleAnalyze = async (drafts: TaskDraft[]): Promise<RoutingResponse> => {
    const startedAt = performance.now();
    let response: Response;
    try {
      response = await fetch('/api/route-tasks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mode: 'live', tasks: drafts }) });
    } catch { throw new Error('Could not reach the Rung server. Check that the app is running, then retry.'); }
    let body: unknown;
    try { body = await response.json(); } catch { throw new Error('Rung received an unreadable response. Retry the provider request.'); }
    if (!response.ok) {
      const message = body && typeof body === 'object' && typeof (body as { message?: unknown }).message === 'string' ? (body as { message: string }).message : 'AI routing failed. Retry the request.';
      throw new Error(message);
    }
    if (!body || typeof body !== 'object') throw new Error('Rung returned an invalid result. No routes were applied.');
    const result = body as RoutingResponse;
    if (result.mode !== 'live' || typeof result.provider !== 'string' || typeof result.model !== 'string' || !Array.isArray(result.decisions)) throw new Error('Rung returned an invalid result. No routes were applied.');
    const byId = new Map(result.decisions.map((decision: RoutingDecision) => [decision.taskId, decision]));
    if (byId.size !== drafts.length || drafts.some(task => !byId.has(task.id))) throw new Error('Rung returned an incomplete result. No routes were applied.');
    const routedTasks = drafts.map(task => applyRoutingPolicy(byId.get(task.id)!, task));
    setTasks(routedTasks); setSelectedTaskId(routedTasks[0]?.id ?? null);
    setRun({ mode: result.mode, provider: result.provider, model: result.model, latencyMs: Math.round(performance.now() - startedAt) });
    setRunHistory(previous => [{
      id: `${Date.now()}-${Math.round(performance.now())}`,
      analyzedAt: new Date().toISOString(),
      provider: result.provider,
      model: result.model,
      taskCount: routedTasks.length,
      tiers: {
        light: routedTasks.filter(task => task.tier === 'light').length,
        standard: routedTasks.filter(task => task.tier === 'standard').length,
        frontier: routedTasks.filter(task => task.tier === 'frontier').length,
      },
    }, ...previous]);
    return result;
  };

  const saveOverride = (taskId: string, newTier: Tier) => setTasks(previous => previous.map(task => task.id === taskId ? { ...task, tier: newTier, wasOverridden: newTier !== task.originalTier } : task));
  const selectTab = (tab: string) => {
    if (tab === 'home' || tab === 'dashboard') navigate('home');
    else if (tab === 'new-plan') startNewPlan();
    else if (tab === 'review') navigate('review');
    else if (tab === 'history') navigate('history');
    else if (tab === 'cost') navigate('cost');
    else if (tab === 'settings') navigate('settings');
    else if (tab === 'export') navigate('export');
  };

  if (currentView === 'landing') return <LandingPage onGetStarted={startNewPlan} />;
  return (
    <div className="rung-app-wrapper">
      <div className="authenticated-layout">
        <Sidebar currentTab={currentView} onSelectTab={selectTab} onNewPlan={startNewPlan} />
        <div className="view-content-area">
          {currentView === 'home' && <HomeOverview tasks={tasks} run={run} costSummary={costSummary} onNewPlan={startNewPlan} onReview={(taskId) => { if (taskId) setSelectedTaskId(taskId); navigate('review'); }} />}
          <div style={{ display: currentView === 'new-plan' ? 'block' : 'none' }}>
            <MainDashboard key={planKey} initialPrd={initialPrd} tasks={tasks} selectedTask={selectedTask} run={run} costSummary={costSummary}
              onSelectTask={task => setSelectedTaskId(task.id)} onOpenOverride={task => { setSelectedTaskId(task.id); navigate('review'); }}
              onAnalyze={handleAnalyze} onGoToExport={() => navigate('export')} onGoToCost={() => navigate('cost')} onNewPlan={startNewPlan} />
          </div>
          {currentView === 'review' && (selectedTask ? <TaskReview tasks={tasks} selectedTask={selectedTask} onSelectTask={task => setSelectedTaskId(task.id)} onSaveOverride={saveOverride} onBackToBoard={() => navigate('new-plan')} /> : <EmptySection title="No routed tasks to review" detail="Start a plan, review its task list, and run live analysis. Recommendations will appear here for inspection and tier overrides." action="Create a plan" onAction={startNewPlan} />)}
          {currentView === 'history' && <HistoryPage runs={runHistory} onCreate={startNewPlan} />}
          {currentView === 'cost' && <CostSummary costSummary={costSummary} tasks={tasks} onBack={() => navigate(tasks.length ? 'new-plan' : 'home')} />}
          {currentView === 'settings' && <SettingsPage costsConfigured={costSummary.routedPlan !== null} onNewPlan={startNewPlan} />}
          {currentView === 'export' && <ExportPlan tasks={tasks} run={run} costSummary={costSummary} onBackToDashboard={() => navigate('new-plan')} />}
        </div>
      </div>
    </div>
  );
}

function HomeOverview({ tasks, run, costSummary, onNewPlan, onReview }: { tasks: TaskItem[]; run: RunMetadata | null; costSummary: ReturnType<typeof calculateCostSummary>; onNewPlan: (prd?: string) => void; onReview: (taskId?: string) => void }) {
  const [uploadError, setUploadError] = useState<string | null>(null);
  const tiers: Tier[] = ['light', 'standard', 'frontier'];
  const countByTier = (tier: Tier) => tasks.filter(task => task.tier === tier).length;
  const selected = tasks[0] ?? null;
  const upload = async (file?: File) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.md') && file.type !== 'text/markdown' && file.type !== 'text/plain') { setUploadError('Choose a Markdown (.md) or plain text file.'); return; }
    if (file.size > 100_000) { setUploadError('This file is too large. Keep it under 100,000 characters.'); return; }
    onNewPlan(await file.text());
  };
  return <main className="dashboard-page home-dashboard">
    <header className="home-heading"><div><p className="page-kicker">WORKSPACE</p><h1>Good to see you, builder.</h1><p>Paste a PRD and find a reviewable route for each task.</p></div><div className={`mode-pill ${run?.mode === 'live' ? 'is-live' : ''}`}><span />{run?.mode === 'live' ? 'Live analysis' : 'Ready for a plan'}</div></header>
    <section className="overview-grid">
      <article className="upload-panel"><div className="panel-title"><span className="panel-icon"><UploadCloud size={19}/></span><div><h2>Start with your PRD</h2><p>Markdown stays in your browser until you start live analysis.</p></div></div><button className="drop-area" type="button" onClick={() => onNewPlan()}><span className="drop-icon"><FileText size={21}/></span><strong>Paste or write requirements</strong><small>Open the planner to review task text before routing</small><span className="dashboard-primary">Open planner <ArrowRight size={15}/></span></button><div className="upload-footer"><span>or choose a Markdown file</span><label className="upload-link">Browse files<input aria-label="Choose a Markdown PRD" type="file" accept=".md,text/markdown,text/plain" onChange={event => { void upload(event.currentTarget.files?.[0]); event.currentTarget.value = ''; }}/></label></div>{uploadError && <p className="upload-error" role="alert">{uploadError}</p>}</article>
      <article className="estimate-panel"><div className="panel-title"><span className="panel-icon cost-icon"><ShieldCheck size={18}/></span><div><h2>Cost assumptions</h2><p>Modeled downstream cost, based on configured profiles.</p></div></div><div className="estimate-value">{costSummary.routedPlan === null ? 'Unavailable' : `$${costSummary.routedPlan.toFixed(4)}`}</div><div className="estimate-detail"><span>{costSummary.routedPlan === null ? 'Verified prices are not configured' : 'Modeled estimate for this plan'}</span><span className="estimate-state"><Check size={13}/> {costSummary.routedPlan === null ? 'No estimate' : 'Assumptions shown'}</span></div><div className="estimate-rule"/><p className="estimate-foot">{costSummary.routedPlan === null ? 'No zero-price substitution or unsupported savings claim.' : `Token assumption: ${costSummary.tokenAssumption}`}</p></article>
    </section>
    <section className="board-section"><header className="board-heading"><div><h2>Task board</h2><p>{tasks.length ? `${tasks.length} reviewed route${tasks.length === 1 ? '' : 's'} from the current session` : 'Routes appear here after you analyze reviewed tasks.'}</p></div><div className="board-head-actions">{run?.mode === 'live' && <span className="live-model"><Check size={13}/> {run.provider} · {run.model}</span>}<button className="dashboard-secondary" type="button" onClick={() => tasks.length ? onReview() : onNewPlan()}>{tasks.length ? 'Review tasks' : 'Create a plan'} <ArrowRight size={14}/></button></div></header>
      <div className="board-and-detail"><div className="tier-columns">{tiers.map(tier => { const rows = tasks.filter(task => task.tier === tier); return <section key={tier} className={`tier-column ${tier}`}><header><span className="tier-heading"><i/>{tier[0].toUpperCase() + tier.slice(1)}</span><span className="tier-count">{rows.length}</span></header><div className="tier-tasks">{rows.length ? rows.map(task => <button type="button" className="board-task" key={task.id} onClick={() => onReview(task.id)}><strong>{task.title}</strong><span>{task.effort} effort <b>·</b> {task.confidence}% confidence</span>{task.flag && <small className="task-flag">Human review</small>}</button>) : <p className="column-empty">{tasks.length ? 'No tasks in this tier' : 'Your routed tasks will appear here'}</p>}</div></section>; })}</div>
        <aside className="why-panel"><h3>{selected ? 'Why this tier?' : 'Task details'}</h3>{selected ? <><p className="why-title">{selected.title}</p><span className={`why-tier ${selected.tier}`}>{selected.tier}</span><div className="mini-scores">{([['Complexity', selected.scores.complexity], ['Ambiguity', selected.scores.ambiguity], ['Cross-file scope', selected.scores.crossFile], ['Reasoning depth', selected.scores.reasoningDepth]] as const).map(([label, score]) => <div key={label}><span>{label}</span><i><b style={{ width: `${score}%` }}/></i><strong>{score}%</strong></div>)}</div><p className="why-copy">{selected.whyExplanation}</p>{selected.wasOverridden && <p className="override-note">AI suggested {selected.originalTier}; user selected {selected.tier}.</p>}<button className="review-action" type="button" onClick={() => onReview(selected.id)}>Inspect recommendation <ArrowRight size={14}/></button></> : <p className="why-empty">Run a live analysis to inspect a task’s rationale, confidence, and score breakdown here.</p>}</aside>
      </div>
    </section>
    <footer className="workspace-privacy"><ShieldCheck size={15}/> No accounts and no saved PRDs. Reviewed task text is sent to the configured AI provider only when you start live analysis.</footer>
    <style jsx>{`
      .home-dashboard{max-width:1640px}.home-heading{display:flex;align-items:center;justify-content:space-between;gap:20px;padding-bottom:21px;border-bottom:1px solid var(--color-rule);margin-bottom:22px}.home-heading h1{font-size:clamp(28px,3vw,38px);margin-bottom:8px}.home-heading p:not(.page-kicker){font-size:13px;color:var(--color-muted)}.mode-pill{display:flex;align-items:center;gap:8px;padding:9px 13px;border:1px solid var(--color-rule);border-radius:999px;background:var(--color-paper);font-size:11px;color:var(--color-ink-2);white-space:nowrap}.mode-pill>span{width:8px;height:8px;border-radius:50%;background:var(--color-muted)}.mode-pill.is-live{color:oklch(42% .13 155);background:oklch(97% .025 155);border-color:oklch(88% .07 155)}.mode-pill.is-live>span{background:oklch(55% .15 155)}
      .overview-grid{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(290px,.85fr);gap:15px;margin-bottom:27px}.upload-panel,.estimate-panel,.board-section,.why-panel{border:1px solid var(--color-rule);border-radius:13px;background:var(--color-paper);box-shadow:var(--shadow-sm)}.upload-panel,.estimate-panel{padding:18px}.panel-title{display:flex;align-items:center;gap:11px;margin-bottom:16px}.panel-title h2{font-size:14px;margin-bottom:3px}.panel-title p{font-size:10px;color:var(--color-muted)}.panel-icon{display:grid;place-items:center;width:38px;height:38px;border-radius:11px;color:var(--color-accent);background:oklch(95% .035 245)}.cost-icon{color:oklch(48% .13 160);background:oklch(95% .035 160)}.drop-area{width:100%;min-height:143px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;padding:13px;border:1px dashed color-mix(in oklab,var(--color-accent) 30%,var(--color-rule));border-radius:10px;background:linear-gradient(125deg,oklch(98.5% .01 245),var(--color-paper));color:var(--color-ink);cursor:pointer}.drop-area:hover{border-color:var(--color-accent);background:oklch(97% .025 245)}.drop-area .drop-icon{color:var(--color-accent);margin-bottom:2px}.drop-area strong{font-size:12px}.drop-area small{font-size:10px;color:var(--color-muted);text-align:center}.drop-area .dashboard-primary{margin-top:8px;min-height:34px;font-size:10px}.upload-footer{display:flex;justify-content:center;gap:5px;margin-top:12px;font-size:10px;color:var(--color-muted)}.upload-link{position:relative;color:var(--color-accent);font-weight:700;cursor:pointer}.upload-link input{position:absolute;inset:0;width:100%;opacity:0;cursor:pointer}.upload-error{margin-top:8px;color:var(--color-error);font-size:11px}
      .estimate-panel{background:linear-gradient(140deg,var(--color-paper),oklch(98% .018 158))}.estimate-value{font-size:clamp(27px,3vw,38px);font-weight:750;letter-spacing:-.06em;line-height:1.15;margin:22px 0 10px;color:var(--color-ink)}.estimate-detail{display:flex;justify-content:space-between;align-items:center;gap:9px;color:var(--color-muted);font-size:10px}.estimate-state{display:inline-flex;align-items:center;gap:4px;white-space:nowrap;color:var(--color-ink-2)}.estimate-rule{height:1px;background:var(--color-rule);margin:18px 0 11px}.estimate-foot{font-size:10px;color:var(--color-muted);line-height:1.5}
      .board-section{padding:18px;margin-bottom:17px}.board-heading{display:flex;justify-content:space-between;align-items:center;gap:16px;margin-bottom:14px}.board-heading h2{font-size:18px;margin-bottom:3px}.board-heading p{font-size:11px;color:var(--color-muted)}.board-head-actions{display:flex;align-items:center;gap:10px}.board-head-actions .dashboard-secondary{font-size:10px;min-height:34px}.live-model{display:flex;align-items:center;gap:5px;color:oklch(43% .13 155);font-size:10px}.board-and-detail{display:grid;grid-template-columns:minmax(0,1fr) minmax(220px,.36fr);gap:12px;align-items:stretch}.tier-columns{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}.tier-column{min-width:0;border:1px solid var(--color-rule);border-radius:10px;overflow:hidden;background:var(--color-paper)}.tier-column>header{display:flex;justify-content:space-between;align-items:center;padding:10px 11px;border-bottom:1px solid var(--color-rule);background:var(--color-paper-2)}.tier-heading{display:flex;align-items:center;gap:7px;font-size:11px;font-weight:750}.tier-heading i{width:8px;height:8px;border-radius:50%;background:currentColor}.tier-count{display:grid;place-items:center;width:21px;height:21px;border-radius:50%;background:var(--color-paper);font-size:10px;color:var(--color-muted)}.tier-column.light .tier-heading{color:var(--tier-light)}.tier-column.standard .tier-heading{color:var(--tier-standard)}.tier-column.frontier .tier-heading{color:var(--tier-frontier)}.tier-tasks{display:flex;flex-direction:column;gap:7px;padding:8px;min-height:176px}.board-task{display:flex;flex-direction:column;gap:6px;width:100%;padding:10px;text-align:left;border:1px solid var(--color-rule);border-radius:8px;background:var(--color-paper);cursor:pointer}.board-task:hover{border-color:var(--color-accent);box-shadow:var(--shadow-sm)}.board-task strong{overflow-wrap:anywhere;font-size:10px;line-height:1.4}.board-task>span{font-size:9px;color:var(--color-muted)}.board-task>span b{padding-inline:3px;color:var(--color-rule)}.task-flag{align-self:flex-start;color:oklch(49% .12 70);background:oklch(97% .035 85);border-radius:999px;padding:3px 6px;font-size:9px}.column-empty{display:grid;place-items:center;flex:1;min-height:110px;padding:14px;text-align:center;color:var(--color-muted);font-size:10px;line-height:1.5}
      .why-panel{padding:14px 13px;background:linear-gradient(160deg,var(--color-paper),oklch(98% .02 275))}.why-panel h3{font-size:13px;margin-bottom:12px}.why-title{font-size:11px;font-weight:700;line-height:1.45;margin-bottom:7px}.why-tier{display:inline-flex;padding:3px 7px;border-radius:999px;font-size:9px;text-transform:capitalize;font-weight:700}.why-tier.light{background:var(--tier-light-bg);color:var(--tier-light)}.why-tier.standard{background:var(--tier-standard-bg);color:var(--tier-standard)}.why-tier.frontier{background:var(--tier-frontier-bg);color:var(--tier-frontier)}.mini-scores{display:flex;flex-direction:column;gap:9px;margin:14px 0}.mini-scores>div{display:grid;grid-template-columns:76px minmax(20px,1fr) 29px;align-items:center;gap:6px;font-size:9px;color:var(--color-muted)}.mini-scores i{height:5px;border-radius:8px;background:var(--color-paper-3);overflow:hidden}.mini-scores i b{display:block;height:100%;border-radius:8px;background:var(--color-accent)}.mini-scores strong{text-align:right;color:var(--color-ink-2);font-size:9px}.why-copy,.why-empty{font-size:10px;line-height:1.5;color:var(--color-muted)}.why-empty{margin-top:22px}.override-note{margin-top:8px;color:var(--color-muted);font-size:9px}.review-action{display:flex;justify-content:center;align-items:center;gap:6px;width:100%;margin-top:13px;padding:8px;border:1px solid var(--color-rule);border-radius:7px;background:var(--color-paper);font-size:10px;font-weight:700;color:var(--color-accent);cursor:pointer}.review-action:hover{border-color:var(--color-accent)}.workspace-privacy{display:flex;align-items:center;gap:7px;color:var(--color-muted);font-size:10px;padding:3px 2px}.workspace-privacy svg{color:var(--color-accent);flex:none}
      @media(max-width:1150px){.board-and-detail{grid-template-columns:1fr}.why-panel{display:grid;grid-template-columns:1fr auto;gap:7px 12px}.why-panel h3{grid-column:1/-1}.why-panel .mini-scores{grid-row:span 3;min-width:240px}.review-action{align-self:end}}
      @media(max-width:800px){.overview-grid{grid-template-columns:1fr}.estimate-panel{min-height:185px}.board-heading{align-items:flex-start;flex-direction:column}.board-head-actions{flex-wrap:wrap}.tier-columns{gap:7px}.board-section{padding:13px}.tier-tasks{padding:6px}.board-task{padding:8px}.why-panel{display:block}}
      @media(max-width:560px){.home-heading{align-items:flex-start;flex-direction:column}.mode-pill{align-self:flex-start}.tier-columns{grid-template-columns:1fr}.tier-tasks{min-height:65px}.column-empty{min-height:55px}.tier-column>header{padding:9px 11px}.estimate-detail{align-items:flex-start;flex-direction:column}.workspace-privacy{align-items:flex-start;line-height:1.5}}
    `}</style>
  </main>;
}

function EmptySection({ title, detail, action, onAction }: { title: string; detail: string; action: string; onAction: () => void }) {
  return <main className="dashboard-page"><div className="page-heading"><div><p className="page-kicker">TASK REVIEW</p><h1>{title}</h1></div></div><div className="home-empty"><div className="home-empty-inner"><p>{detail}</p><button className="dashboard-primary" style={{ marginTop: 20 }} onClick={onAction}>{action} <ArrowRight size={16}/></button></div></div></main>;
}
