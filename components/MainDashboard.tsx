'use client';

import React, { useState } from 'react';
import { AlertCircle, ArrowLeft, ArrowRight, Check, Download, FileText, Plus, ShieldAlert, UploadCloud } from 'lucide-react';
import { parsePrd, MAX_PRD_CHARS } from '../lib/parsePrd';
import type { CostSummaryData, RunMetadata, RoutingResponse, TaskDraft, TaskItem, Tier } from '../lib/types';

interface MainDashboardProps {
  initialPrd?: string;
  tasks: TaskItem[];
  selectedTask: TaskItem | null;
  run: RunMetadata | null;
  costSummary: CostSummaryData;
  onSelectTask: (task: TaskItem) => void;
  onOpenOverride: (task: TaskItem) => void;
  onAnalyze: (tasks: TaskDraft[]) => Promise<RoutingResponse>;
  onGoToExport: () => void;
  onGoToCost: () => void;
  onNewPlan: () => void;
}

type Step = 'input' | 'review' | 'results';

export const MainDashboard: React.FC<MainDashboardProps> = ({
  initialPrd = '', tasks, selectedTask, run, costSummary, onSelectTask, onOpenOverride, onAnalyze,
  onGoToExport, onGoToCost, onNewPlan,
}) => {
  const [step, setStep] = useState<Step>('input');
  const [prdText, setPrdText] = useState<string>(typeof initialPrd === 'string' ? initialPrd : '');
  const [draftTasks, setDraftTasks] = useState<TaskDraft[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [truncated, setTruncated] = useState(false);
  const [filter, setFilter] = useState<'all' | Tier>('all');
  const safePrdText = typeof prdText === 'string' ? prdText : '';

  const reviewTasks = () => {
    setError(null);
    if (!safePrdText.trim()) {
      setError('Paste a Markdown PRD or upload a .md file to begin.');
      return;
    }
    if (safePrdText.length > MAX_PRD_CHARS) {
      setError(`This PRD is too large. Keep it under ${MAX_PRD_CHARS.toLocaleString()} characters.`);
      return;
    }
    const result = parsePrd(safePrdText);
    setDraftTasks(result.tasks);
    setTruncated(result.truncated);
    if (!result.tasks.length) {
      setError('No task-like Markdown list items or section headings were found. Add task bullets such as “- Add a sign-up form” and try again.');
      return;
    }
    setStep('review');
  };

  const uploadMarkdown = async (file?: File) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.md') && file.type !== 'text/markdown' && file.type !== 'text/plain') {
      setError('Choose a Markdown (.md) or plain text file.');
      return;
    }
    if (file.size > MAX_PRD_CHARS) {
      setError(`This file is too large. Keep it under ${MAX_PRD_CHARS.toLocaleString()} characters.`);
      return;
    }
    setPrdText(await file.text());
    setError(null);
  };

  const editExistingTasks = () => {
    setDraftTasks(tasks.map(({ id, title, description }) => ({ id, title, description })));
    setError(null);
    setStep('review');
  };

  const addTask = () => {
    if (draftTasks.length >= 20) return;
    setDraftTasks(previous => [...previous, { id: `task-manual-${Date.now()}`, title: '', description: '' }]);
  };

  const updateTask = (id: string, patch: Partial<TaskDraft>) => {
    setDraftTasks(previous => previous.map(task => task.id === id ? { ...task, ...patch } : task));
  };

  const routeTasks = async () => {
    setError(null);
    const ready = draftTasks.filter(task => task.title.trim() && task.description.trim());
    if (!ready.length) {
      setError('Keep at least one task with a title and description.');
      return;
    }
    setIsRunning(true);
    try {
      await onAnalyze(ready);
      setStep('results');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'AI routing failed. Retry the request.');
    } finally {
      setIsRunning(false);
    }
  };

  const tiers: Tier[] = ['light', 'standard', 'frontier'];
  const countByTier = (tier: Tier) => tasks.filter(task => task.tier === tier).length;
  const visibleTasks = tasks.filter(task => filter === 'all' || task.tier === filter);

  return (
    <div className="rung-dashboard">
      <header className="page-header">
        <div>
          <p className="page-kicker">{step === 'results' ? 'ROUTING WORKSPACE' : 'NEW PLAN'}</p>
          <h1>{step === 'results' ? 'Your task board' : 'Plan the work before you build.'}</h1>
          <p className="subtitle">{step === 'results' ? 'Review the route recommendations and decide what to hand off.' : 'Start with a PRD, review the extracted tasks, then choose a capability tier.'}</p>
        </div>
        {step === 'results' && run && (
          <div className="run-badge live">
            <span className="status-dot" />
            {run.provider} · Live
          </div>
        )}
      </header>

      {step === 'input' && (
        <div className="entry-layout">
        <section className="workflow-card">
          <div className="section-heading">
            <span className="step-number">1</span>
            <div><h2>Start with your PRD</h2><p>Rung extracts task candidates locally. Nothing is sent to an AI provider until you choose live routing.</p></div>
          </div>
          <textarea
            aria-label="Markdown product requirements document"
            className="prd-editor"
            value={safePrdText}
            onChange={event => setPrdText(event.target.value)}
            placeholder={'# Product Requirements Document\n\nPaste your Markdown PRD here…'}
            rows={11}
          />
          <div className="input-actions">
            <label className="button secondary upload-button">
              <UploadCloud size={16} /> Upload .md
              <input aria-label="Upload a Markdown file" type="file" accept=".md,text/markdown,text/plain" onChange={event => { void uploadMarkdown(event.target.files?.[0]); event.currentTarget.value = ''; }} />
            </label>
            <span className="character-count">{safePrdText.length.toLocaleString()} / {MAX_PRD_CHARS.toLocaleString()}</span>
            <button type="button" className="button primary" onClick={reviewTasks}>Review extracted tasks <ArrowRight size={16} /></button>
          </div>
          <p className="privacy-note"><ShieldAlert size={15} /> Live routing sends the reviewed task titles and descriptions to the configured hosted AI provider. Don’t include secrets or private data.</p>
          {error && <ErrorNotice message={error} />}
        </section>
        <aside className="entry-aside">
          <span className="aside-icon"><ShieldAlert size={18}/></span>
          <h2>Cost assumptions</h2>
          <p>Routing recommendations don’t execute coding tasks. Downstream cost can be estimated only when model prices and token assumptions are configured.</p>
          <strong>{costSummary.routedPlan === null ? 'Unavailable' : `$${costSummary.routedPlan.toFixed(4)}`}</strong>
          <small>{costSummary.routedPlan === null ? 'Verified model prices are not configured' : `Modeled estimate · ${costSummary.tokenAssumption}`}</small>
          <div className="aside-rule"/>
          <span className="aside-foot">PRDs stay local until you start live analysis.</span>
        </aside>
        </div>
      )}

      {step === 'review' && (
        <section className="workflow-card">
          <div className="section-heading">
            <button type="button" className="back-button" onClick={() => setStep('input')} aria-label="Back to PRD input"><ArrowLeft size={16} /></button>
            <span className="step-number">2</span>
            <div><h2>Review the task list</h2><p>Edit these candidates before analysis. Rung won’t invent or execute tasks.</p></div>
            <span className="task-total">{draftTasks.length} / 20 tasks</span>
          </div>
          {truncated && <div className="notice"><AlertCircle size={16} /> Only the first 20 task candidates are shown. Shorten the PRD if you need to include later items.</div>}
          <div className="draft-list">
            {draftTasks.map((task, index) => (
              <article className="draft-task" key={task.id}>
                <span className="draft-index">{String(index + 1).padStart(2, '0')}</span>
                <div className="draft-fields">
                  <label>Task title<input value={task.title} maxLength={120} onChange={event => updateTask(task.id, { title: event.target.value })} /></label>
                  <label>What needs to be done?<textarea rows={2} maxLength={4_000} value={task.description} onChange={event => updateTask(task.id, { description: event.target.value })} /></label>
                </div>
                <button type="button" className="remove-task" onClick={() => setDraftTasks(previous => previous.filter(item => item.id !== task.id))} aria-label={`Remove task ${index + 1}`}>Remove</button>
              </article>
            ))}
          </div>
          <div className="review-actions">
            <button type="button" className="button secondary" onClick={addTask} disabled={draftTasks.length >= 20}><Plus size={16} /> Add task</button>
            <div className="route-actions">
              <button type="button" className="button primary" onClick={routeTasks} disabled={isRunning}>{isRunning ? 'Routing tasks…' : 'Analyze with AI'} <ArrowRight size={16} /></button>
            </div>
          </div>
          <p className="privacy-note"><ShieldAlert size={15} /> Live sends only the task titles and descriptions above to the configured provider. API keys remain on the server.</p>
          {error && <ErrorNotice message={error} />}
        </section>
      )}

      {step === 'results' && (
        <>
          <section className="summary-row">
            <div className="summary-card"><span className="summary-label">Tasks routed</span><strong>{tasks.length}</strong><span className="summary-foot">Review every recommendation</span></div>
            {tiers.map(tier => <div className={`summary-card tier-${tier}`} key={tier}><span className="summary-label">{tier}</span><strong>{countByTier(tier)}</strong><span className="summary-foot">{countByTier(tier) === 1 ? 'task' : 'tasks'}</span></div>)}
            <div className="summary-card cost-status"><span className="summary-label">Cost comparison</span><strong>{costSummary.routedPlan === null ? 'Unavailable' : `$${costSummary.routedPlan.toFixed(4)}`}</strong><span className="summary-foot">{costSummary.routedPlan === null ? 'No verified model prices configured' : 'Modeled estimate'}</span></div>
          </section>

          {run?.mode === 'live' && <p className="provider-note"><Check size={15} /> Live response from <strong>{run.provider} / {run.model}</strong>{typeof run.latencyMs === 'number' ? ` · ${run.latencyMs} ms observed` : ''}. Rung recommends routes; it doesn’t prove task quality or execute code.</p>}

          <div className="results-toolbar">
            <div><h2>Task routing board</h2></div>
            <div className="toolbar-actions">
              <button type="button" className="button secondary" onClick={editExistingTasks}>Edit tasks</button>
              <button type="button" className="button secondary" onClick={onGoToCost}>Cost assumptions</button>
              <button type="button" className="button primary" onClick={onGoToExport}><Download size={15} /> Export plan</button>
            </div>
          </div>
          <div className="board-layout">
            <section className="board-card">
              <div className="filter-row">
                {(['all', ...tiers] as const).map(value => <button key={value} type="button" className={`filter-button ${filter === value ? 'active' : ''}`} onClick={() => setFilter(value)}>{value === 'all' ? `All ${tasks.length}` : `${value} ${countByTier(value)}`}</button>)}
              </div>
              <div className="tier-board">
                {tiers.filter(tier => filter === 'all' || tier === filter).map(tier => {
                  const tierTasks = visibleTasks.filter(task => task.tier === tier);
                  return <section className={`tier-lane ${tier}`} key={tier}>
                    <header><span><i/>{tier}</span><b>{tierTasks.length}</b></header>
                    <div className="lane-tasks">{tierTasks.map(task => (
                      <button type="button" key={task.id} className={`result-task ${selectedTask?.id === task.id ? 'selected' : ''}`} aria-label={`${task.title}, ${task.tier} tier, ${task.effort} effort, ${task.confidence}% confidence${task.flag ? ', human review recommended' : ''}${task.wasOverridden ? `, changed from ${task.originalTier}` : ''}`} onClick={() => onSelectTask(task)}>
                        <span className="result-task-copy"><strong>{task.title}</strong><small>{task.effort} effort · {task.confidence}% confidence</small></span>
                        <span className="task-badges"><span className={`tier-chip ${task.tier}`}>{task.tier}</span>{task.wasOverridden && <span className="review-chip override-chip">Overridden</span>}{task.flag && <span className="review-chip">Review</span>}</span>
                      </button>
                    ))}</div>
                  </section>;
                })}
              </div>
            </section>
            {selectedTask && (
              <aside className="detail-card">
                <h3>{selectedTask.title}</h3>
                <p className="detail-description">{selectedTask.description}</p>
                <div className="score-list">
                  {([
                    ['Complexity', selectedTask.scores.complexity], ['Ambiguity', selectedTask.scores.ambiguity],
                    ['Cross-file scope', selectedTask.scores.crossFile], ['Reasoning depth', selectedTask.scores.reasoningDepth],
                  ] as const).map(([label, score]) => <div className="score-line" key={label}><span>{label}</span><div className="score-track"><i style={{ width: `${score}%` }} /></div><strong>{score}%</strong></div>)}
                </div>
                <div className="rationale"><strong>Why {selectedTask.originalTier}?</strong><p>{selectedTask.whyExplanation}</p></div>
                {selectedTask.flag && <div className="review-warning"><AlertCircle size={15} /><span>Human review recommended: {selectedTask.flagReason}</span></div>}
                <button type="button" className="button secondary full-width" onClick={() => onOpenOverride(selectedTask)}>Override tier</button>
              </aside>
            )}
          </div>
          <div className="bottom-actions"><button type="button" className="text-button" onClick={onNewPlan}><FileText size={15} /> Start a new plan</button></div>
        </>
      )}

      <style jsx>{`
        .rung-dashboard{max-width:1440px;width:100%;margin:0 auto;padding:34px 40px 64px;background:#f7f9fc;min-height:100vh;color:#0f172a}
        .page-header{display:flex;justify-content:space-between;align-items:flex-start;gap:24px;margin-bottom:26px}.eyebrow{font-size:10px;letter-spacing:.14em;font-weight:800;color:#64748b;margin-bottom:8px}.page-header h1{font-size:clamp(26px,3vw,38px);letter-spacing:-.04em;line-height:1.1;margin:0 0 9px}.subtitle{font-size:14px;color:#64748b;max-width:760px}
        .run-badge{display:flex;align-items:center;gap:8px;background:#ecfdf5;border:1px solid #a7f3d0;border-radius:999px;padding:8px 13px;font-size:12px;font-weight:700;white-space:nowrap;color:#047857}.status-dot{width:8px;height:8px;border-radius:100%;background:currentColor}
        .workflow-card,.board-card,.detail-card{background:#fff;border:1px solid #e2e8f0;border-radius:16px;box-shadow:0 4px 16px #0f172a08}.workflow-card{padding:26px}.section-heading{display:flex;align-items:center;gap:13px;margin-bottom:20px}.section-heading h2{font-size:18px;letter-spacing:-.02em;margin-bottom:3px}.section-heading p{font-size:13px;color:#64748b}.step-number{display:grid;place-items:center;width:34px;height:34px;border-radius:10px;background:#eef2ff;color:#4338ca;font-weight:800;flex-shrink:0}.back-button{border:0;background:#f1f5f9;color:#475569;border-radius:9px;width:34px;height:34px;display:grid;place-items:center;cursor:pointer}.task-total{margin-left:auto;color:#64748b;font-size:12px;white-space:nowrap}
        .prd-editor,.draft-fields input,.draft-fields textarea{width:100%;border:1px solid #dbe3ee;border-radius:10px;background:#fbfcfe;color:#0f172a;font:inherit}.prd-editor{padding:16px;resize:vertical;line-height:1.6;font:13px/1.6 var(--font-mono),monospace;min-height:220px}.prd-editor:focus,.draft-fields input:focus,.draft-fields textarea:focus{outline:3px solid #c7d2fe;border-color:#6366f1}.input-actions,.review-actions,.route-actions,.toolbar-actions{display:flex;align-items:center;gap:10px;flex-wrap:wrap}.input-actions{margin-top:15px}.button{display:inline-flex;align-items:center;justify-content:center;gap:8px;border:1px solid transparent;border-radius:9px;padding:10px 14px;font-size:12px;font-weight:700;cursor:pointer;transition:.15s}.button:disabled{opacity:.55;cursor:not-allowed}.button.primary{background:#4338ca;color:#fff}.button.primary:hover:not(:disabled){background:#3730a3}.button.secondary{background:#fff;border-color:#dbe3ee;color:#334155}.button.secondary:hover:not(:disabled){background:#f8fafc}.upload-button{position:relative;overflow:hidden}.upload-button input{position:absolute;inset:0;opacity:0;width:100%;cursor:pointer}.text-button{display:inline-flex;align-items:center;gap:7px;border:0;background:none;color:#4338ca;font-size:12px;font-weight:700;cursor:pointer;padding:8px}.character-count{margin-left:auto;font-size:11px;color:#94a3b8}.privacy-note{display:flex;align-items:flex-start;gap:7px;margin-top:15px;color:#64748b;font-size:11px;line-height:1.5}.privacy-note :global(svg){flex-shrink:0;color:#64748b;margin-top:1px}.notice,.provider-note,.review-warning{display:flex;align-items:flex-start;gap:8px;padding:12px 14px;border-radius:10px;font-size:12px;line-height:1.5}.notice{background:#fffbeb;color:#92400e;margin-bottom:14px}.provider-note{background:#ecfdf5;color:#065f46;margin:0 0 18px}.provider-note strong{word-break:break-all}.error-notice{display:flex;align-items:flex-start;gap:9px;margin-top:16px;padding:12px 14px;background:#fef2f2;color:#991b1b;border:1px solid #fecaca;border-radius:10px;font-size:12px;line-height:1.5}.error-notice :global(svg){flex:none;margin-top:1px}
        .draft-list{display:flex;flex-direction:column;gap:12px}.draft-task{display:grid;grid-template-columns:38px 1fr auto;align-items:start;gap:12px;border:1px solid #e2e8f0;border-radius:12px;padding:14px}.draft-index{font:700 11px var(--font-mono),monospace;color:#94a3b8;padding-top:9px}.draft-fields{display:grid;grid-template-columns:minmax(180px,.8fr) minmax(240px,1.5fr);gap:12px}.draft-fields label{display:flex;flex-direction:column;gap:6px;color:#64748b;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.07em}.draft-fields input,.draft-fields textarea{font-size:12px;padding:9px 10px;text-transform:none;letter-spacing:normal;font-weight:500;resize:vertical}.remove-task{border:0;background:none;color:#b91c1c;font-size:11px;font-weight:700;padding:8px 3px;cursor:pointer}.review-actions{justify-content:space-between;margin-top:18px}.route-actions{justify-content:flex-end}
        .summary-row{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:12px;margin-bottom:16px}.summary-card{display:flex;flex-direction:column;gap:4px;background:#fff;border:1px solid #e2e8f0;border-radius:13px;padding:15px 16px}.summary-label{font-size:10px;text-transform:uppercase;letter-spacing:.08em;font-weight:700;color:#64748b}.summary-card strong{font-size:24px;letter-spacing:-.04em}.summary-foot{font-size:10px;color:#94a3b8}.tier-light{--accent:#059669}.tier-standard{--accent:#2563eb}.tier-frontier{--accent:#7c3aed}.summary-card[class*="tier-"] strong{color:var(--accent)}.cost-status strong{font-size:16px;letter-spacing:-.02em}.results-toolbar{display:flex;justify-content:space-between;align-items:center;gap:16px;margin:25px 0 12px}.results-toolbar h2{font-size:20px;letter-spacing:-.03em}.toolbar-actions{justify-content:flex-end}.board-layout{display:grid;grid-template-columns:minmax(0,1.55fr) minmax(280px,.9fr);gap:14px;align-items:start}.board-card{overflow:hidden}.filter-row{display:flex;gap:6px;padding:14px;border-bottom:1px solid #edf0f5;flex-wrap:wrap}.filter-button{border:1px solid transparent;background:transparent;border-radius:999px;padding:7px 11px;color:#64748b;font-size:11px;font-weight:700;cursor:pointer;text-transform:capitalize}.filter-button.active{color:#312e81;background:#eef2ff;border-color:#e0e7ff}.task-board-list{padding:8px;display:flex;flex-direction:column;gap:6px}.result-task{display:flex;align-items:center;gap:11px;width:100%;text-align:left;border:1px solid transparent;background:white;border-radius:10px;padding:12px;cursor:pointer}.result-task:hover,.result-task.selected{background:#f8fafc;border-color:#c7d2fe}.tier-dot{width:9px;height:9px;border-radius:100%;flex:none}.tier-dot.light{background:#10b981}.tier-dot.standard{background:#3b82f6}.tier-dot.frontier{background:#8b5cf6}.result-task-copy{display:flex;flex-direction:column;gap:4px;min-width:0;flex:1}.result-task-copy strong{font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.result-task-copy small{font-size:10px;color:#64748b}.tier-chip,.review-chip{border-radius:999px;padding:4px 8px;font-size:9px;font-weight:800;text-transform:capitalize;white-space:nowrap}.tier-chip.light{background:#ecfdf5;color:#047857}.tier-chip.standard{background:#eff6ff;color:#1d4ed8}.tier-chip.frontier{background:#f5f3ff;color:#6d28d9}.review-chip{background:#fffbeb;color:#a16207}.detail-card{padding:20px;position:sticky;top:18px}.detail-card h3{font-size:17px;line-height:1.3;margin-bottom:8px}.detail-description{font-size:11px;line-height:1.55;color:#64748b;margin-bottom:18px}.score-list{display:flex;flex-direction:column;gap:11px}.score-line{display:grid;grid-template-columns:100px 1fr 34px;gap:8px;align-items:center;font-size:10px;color:#64748b}.score-line strong{text-align:right;font-size:10px;color:#334155}.score-track{height:6px;background:#eef2f7;border-radius:9px;overflow:hidden}.score-track i{display:block;height:100%;background:#6366f1;border-radius:9px}.rationale{background:#f8fafc;border:1px solid #e8edf3;border-radius:10px;padding:12px;margin:17px 0;font-size:11px;line-height:1.5}.rationale strong{text-transform:capitalize}.rationale p{color:#64748b;margin-top:5px}.review-warning{background:#fffbeb;color:#92400e;margin-bottom:14px;padding:9px;font-size:10px}.full-width{width:100%}.bottom-actions{display:flex;justify-content:flex-end;padding:14px 0}.empty-state{padding:28px;text-align:center;color:#64748b;font-size:12px}.empty-state strong{display:block;color:#334155;margin-bottom:4px}
        .route-meta{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        @media(max-width:1050px){.summary-row{grid-template-columns:repeat(3,minmax(0,1fr))}.board-layout{grid-template-columns:1fr}.detail-card{position:static}.results-toolbar{align-items:flex-start;flex-direction:column}.toolbar-actions{justify-content:flex-start}}
        @media(max-width:900px){.draft-fields{grid-template-columns:1fr}}
        @media(max-width:680px){.rung-dashboard{padding:24px 16px 44px}.page-header{flex-direction:column}.workflow-card{padding:17px}.draft-task{grid-template-columns:26px 1fr}.remove-task{grid-column:2;justify-self:end}.summary-row{grid-template-columns:repeat(2,minmax(0,1fr))}.review-actions{align-items:stretch;flex-direction:column}.route-actions{display:grid;grid-template-columns:1fr}.route-actions .button{width:100%}.task-total{margin-left:auto}.result-task{gap:7px;padding:10px 8px}.result-task-copy strong{white-space:normal}.tier-chip,.review-chip{font-size:8px;padding:4px 6px}.input-actions .button.primary{width:100%}.character-count{margin-left:auto}}
        .rung-dashboard{background:transparent;max-width:1500px;padding:30px 34px 58px;color:var(--color-ink)}.page-kicker{margin:0 0 5px;color:var(--color-accent);font-size:10px;font-weight:750;letter-spacing:.06em}.page-header{align-items:center;padding:0 0 18px;border-bottom:1px solid var(--color-rule);margin-bottom:20px}.page-header h1{font-size:clamp(27px,2.6vw,36px);letter-spacing:-.05em;line-height:1.1;margin:0 0 6px}.subtitle{max-width:680px;font-size:12px;color:var(--color-muted)}.run-badge{background:oklch(97% .025 155);border-color:oklch(88% .07 155);color:oklch(43% .13 155)}.status-dot{width:8px;height:8px;background:oklch(56% .14 155)}
        .entry-layout{display:grid;grid-template-columns:minmax(0,1.45fr) minmax(245px,.75fr);gap:14px;align-items:stretch}.workflow-card,.board-card,.detail-card,.entry-aside{border:1px solid var(--color-rule);border-radius:13px;background:var(--color-paper);box-shadow:var(--shadow-sm)}.workflow-card{padding:21px}.section-heading{gap:11px;margin-bottom:16px}.section-heading h2{font-size:15px}.section-heading p{font-size:11px;color:var(--color-muted)}.step-number{width:31px;height:31px;border-radius:50%;background:oklch(95% .035 270);color:var(--color-accent)}.prd-editor{min-height:258px;padding:14px;border-radius:9px;background:oklch(99% .004 250);font-size:12px}.input-actions{gap:8px}.button{min-height:38px;border-radius:8px;font-size:11px}.button.primary{background:var(--color-ink);border-color:var(--color-ink)}.button.primary:hover:not(:disabled){background:var(--color-accent);border-color:var(--color-accent)}.button.secondary{border-color:var(--color-rule)}.privacy-note{font-size:10px;margin-top:12px}.entry-aside{padding:20px;background:linear-gradient(145deg,var(--color-paper),oklch(97% .026 240) 65%,oklch(98% .025 280));display:flex;flex-direction:column;align-items:flex-start}.aside-icon{display:grid;place-items:center;width:37px;height:37px;border-radius:11px;color:oklch(49% .14 255);background:oklch(95% .035 245);margin-bottom:13px}.entry-aside h2{font-size:16px;margin-bottom:7px}.entry-aside>p{font-size:11px;color:var(--color-muted);line-height:1.6;max-width:36ch}.entry-aside>strong{font-size:31px;letter-spacing:-.05em;margin:27px 0 4px}.entry-aside>small{font-size:10px;color:var(--color-muted)}.aside-rule{height:1px;width:100%;background:var(--color-rule);margin:19px 0 11px}.aside-foot{font-size:10px;color:var(--color-muted)}
        .summary-row{grid-template-columns:repeat(5,minmax(0,1fr));gap:9px;margin-bottom:13px}.summary-card{border-radius:10px;padding:12px 14px;box-shadow:none}.summary-label{text-transform:none;letter-spacing:0;font-size:10px}.summary-card strong{font-size:21px}.summary-foot{font-size:9px}.cost-status strong{font-size:14px}.results-toolbar{margin:19px 0 10px}.results-toolbar h2{font-size:17px}.toolbar-actions .button{min-height:35px;padding:8px 10px}.board-layout{grid-template-columns:minmax(0,1fr) minmax(230px,.43fr);gap:11px}.board-card{border-radius:11px}.filter-row{padding:10px;border-bottom-color:var(--color-rule)}.filter-button{font-size:10px;padding:6px 9px}.tier-board{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;padding:9px}.tier-lane{min-width:0;border:1px solid var(--color-rule);border-radius:9px;overflow:hidden;background:var(--color-paper)}.tier-lane>header{display:flex;align-items:center;justify-content:space-between;padding:9px;background:var(--color-paper-2);border-bottom:1px solid var(--color-rule);text-transform:capitalize}.tier-lane>header>span{display:flex;align-items:center;gap:7px;font-size:10px;font-weight:750;color:var(--color-ink-2)}.tier-lane>header i{width:8px;height:8px;border-radius:50%;background:currentColor}.tier-lane.light>header>span{color:var(--tier-light)}.tier-lane.standard>header>span{color:var(--tier-standard)}.tier-lane.frontier>header>span{color:var(--tier-frontier)}.tier-lane>header>b{display:grid;place-items:center;width:20px;height:20px;border-radius:50%;background:var(--color-paper);font-size:9px;color:var(--color-muted)}.lane-tasks{display:flex;flex-direction:column;gap:6px;padding:6px}.result-task{display:flex;align-items:flex-start;flex-direction:column;gap:7px;padding:9px;border:1px solid var(--color-rule);border-radius:7px}.result-task:hover,.result-task.selected{background:oklch(98% .012 250);border-color:var(--color-accent)}.result-task-copy{width:100%}.result-task-copy strong{font-size:10px;white-space:normal;line-height:1.4}.result-task-copy small{font-size:9px}.task-badges{display:flex;gap:4px;flex-wrap:wrap}.tier-chip,.review-chip{font-size:8px;padding:3px 6px}.override-chip{background:oklch(96% .035 250);color:var(--color-accent)}.detail-card{padding:15px;position:static}.detail-card h3{font-size:15px}.detail-description{font-size:10px}.score-line{grid-template-columns:82px minmax(30px,1fr) 31px;font-size:9px}.rationale{font-size:10px;background:oklch(98% .009 250)}.bottom-actions{padding:10px 0}
        @media(max-width:1050px){.entry-layout{grid-template-columns:minmax(0,1fr) minmax(220px,.7fr)}.summary-row{grid-template-columns:repeat(3,minmax(0,1fr))}.board-layout{grid-template-columns:1fr}.detail-card{position:static}.tier-board{grid-template-columns:repeat(3,minmax(0,1fr))}}
        @media(max-width:760px){.entry-layout{grid-template-columns:1fr}.entry-aside{min-height:220px}.tier-board{grid-template-columns:1fr}.lane-tasks{max-height:330px;overflow:auto}.page-header{align-items:flex-start}.run-badge{align-self:flex-start}}
        @media(max-width:680px){.rung-dashboard{padding:22px 16px 42px}.workflow-card{padding:15px}.entry-aside{padding:17px}.summary-row{grid-template-columns:repeat(2,minmax(0,1fr))}.tier-board{padding:7px}.results-toolbar{gap:10px}.toolbar-actions{width:100%}.toolbar-actions .button{flex:1}.detail-card{padding:15px}.page-header h1{font-size:29px}}
      `}</style>
    </div>
  );
};

function ErrorNotice({ message }: { message: string }) {
  return <div className="error-notice"><AlertCircle size={16} /><div>{message}</div></div>;
}
