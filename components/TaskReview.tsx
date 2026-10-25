'use client';

import React, { useEffect, useState } from 'react';
import { ArrowLeft, Check } from 'lucide-react';
import type { TaskItem, Tier } from '../lib/types';

interface TaskReviewProps {
  tasks: TaskItem[];
  selectedTask: TaskItem;
  onSelectTask: (task: TaskItem) => void;
  onSaveOverride: (taskId: string, newTier: Tier) => void;
  onBackToBoard?: () => void;
}

const tiers: Tier[] = ['light', 'standard', 'frontier'];

export const TaskReview: React.FC<TaskReviewProps> = ({ tasks, selectedTask, onSelectTask, onSaveOverride, onBackToBoard }) => {
  const [targetTier, setTargetTier] = useState<Tier>(selectedTask.tier);
  const [saved, setSaved] = useState(false);
  useEffect(() => { setTargetTier(selectedTask.tier); setSaved(false); }, [selectedTask.id, selectedTask.tier]);

  const save = () => {
    onSaveOverride(selectedTask.id, targetTier);
    setSaved(true);
  };

  return (
    <main className="review-page">
      <button type="button" className="back-link" onClick={onBackToBoard}><ArrowLeft size={15} /> Back to routing board</button>
      <header><h1>Inspect and override</h1><p>The AI suggestion stays visible if you choose a different tier.</p></header>
      <div className="review-grid">
        <section className="task-table">
          <h2>Routed tasks <span>{tasks.length}</span></h2>
          <div className="table-head"><span>Task</span><span>Recommended</span><span>Confidence</span><span>Review</span></div>
          {tasks.map(task => <button type="button" key={task.id} className={`task-row ${task.id === selectedTask.id ? 'selected' : ''}`} aria-label={`Inspect ${task.title}. ${task.tier} tier, ${task.confidence}% confidence${task.flag ? ', human review recommended' : ''}`} onClick={() => onSelectTask(task)}><span className="task-name"><i className={`dot ${task.tier}`} />{task.title}</span><b className={`tier-value ${task.tier}`}>{task.tier}{task.wasOverridden ? ' · adjusted' : ''}</b><span className="confidence-value">{task.confidence}%</span><span className={task.flag ? 'flag-value' : 'clear-value'}>{task.flag ? 'Review' : '—'}</span></button>)}
        </section>
        <section className="detail-card">
          <h2>{selectedTask.title}</h2>
          <p className="description">{selectedTask.description}</p>
          <div className="scores">
            {([
              ['Complexity', selectedTask.scores.complexity], ['Ambiguity', selectedTask.scores.ambiguity],
              ['Cross-file scope', selectedTask.scores.crossFile], ['Reasoning depth', selectedTask.scores.reasoningDepth],
            ] as const).map(([label, score]) => <div className="score" key={label}><span>{label}</span><i><em style={{ width: `${score}%` }} /></i><b>{score}%</b></div>)}
          </div>
          <div className="rationale"><b>Why this tier?</b><p>{selectedTask.whyExplanation}</p></div>
          {selectedTask.flag && <div className="flag">Human review recommended: {selectedTask.flagReason}</div>}
          <label className="tier-label" htmlFor="tier-select">Your selected tier</label>
          <select id="tier-select" value={targetTier} onChange={event => { setTargetTier(event.target.value as Tier); setSaved(false); }}>
            {tiers.map(tier => <option value={tier} key={tier}>{tier[0].toUpperCase() + tier.slice(1)}</option>)}
          </select>
          <p className="original">AI recommendation: <strong>{selectedTask.originalTier}</strong>{targetTier !== selectedTask.originalTier ? ' · Your override will be preserved in the export.' : ''}</p>
          <button type="button" className="save" onClick={save}>{saved ? <><Check size={15} /> Saved</> : 'Save tier choice'}</button>
        </section>
      </div>
      <style jsx>{`
        .review-page{max-width:1500px;width:100%;margin:0 auto;padding:30px 34px 58px;color:var(--color-ink)}.back-link{display:inline-flex;align-items:center;gap:7px;background:none;border:0;color:var(--color-accent);font-size:11px;font-weight:700;cursor:pointer;margin-bottom:15px}.review-page header h1{font-size:clamp(27px,2.6vw,36px);letter-spacing:-.05em;margin-bottom:6px}.review-page header>p:last-child{color:var(--color-muted);font-size:12px}.review-grid{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(300px,.8fr);gap:12px;margin-top:18px;align-items:start}.task-table,.detail-card{background:var(--color-paper);border:1px solid var(--color-rule);border-radius:12px;padding:17px;box-shadow:var(--shadow-sm)}.task-table h2{font-size:15px;margin-bottom:12px}.task-table h2 span{font-size:10px;color:var(--color-muted);margin-left:5px}.table-head,.task-row{display:grid;grid-template-columns:minmax(130px,1.8fr) minmax(82px,1fr) 72px 58px;align-items:center;gap:9px}.table-head{padding:8px 8px;color:var(--color-muted);font-size:9px;font-weight:700;border-bottom:1px solid var(--color-rule)}.task-row{width:100%;text-align:left;padding:11px 8px;border:0;border-bottom:1px solid var(--color-rule);background:var(--color-paper);cursor:pointer;font-size:10px}.task-row:hover,.task-row.selected{background:var(--color-paper-2)}.task-name{display:flex;align-items:center;gap:8px;min-width:0;overflow-wrap:anywhere}.task-name .dot{flex:none}.tier-value{text-transform:capitalize;font-weight:700}.tier-value.light{color:var(--tier-light)}.tier-value.standard{color:var(--tier-standard)}.tier-value.frontier{color:var(--tier-frontier)}.confidence-value{color:var(--color-ink-2);font-variant-numeric:tabular-nums}.flag-value{color:oklch(48% .12 70);font-weight:700}.clear-value{color:var(--color-muted)}.dot{width:8px;height:8px;border-radius:100%}.dot.light{background:var(--tier-light)}.dot.standard{background:var(--tier-standard)}.dot.frontier{background:var(--tier-frontier)}.detail-card h2{font-size:17px;line-height:1.3;margin-bottom:8px}.description{font-size:11px;line-height:1.55;color:var(--color-muted);margin-bottom:17px}.scores{display:flex;flex-direction:column;gap:11px}.score{display:grid;grid-template-columns:95px minmax(40px,1fr) 35px;align-items:center;gap:8px;color:var(--color-muted);font-size:10px}.score b{text-align:right;color:var(--color-ink-2)}.score i{display:block;height:6px;border-radius:8px;background:var(--color-paper-3);overflow:hidden}.score em{display:block;height:100%;background:var(--color-accent);border-radius:8px}.rationale{background:var(--color-paper-2);border:1px solid var(--color-rule);border-radius:9px;padding:12px;margin:15px 0;font-size:10px;line-height:1.5}.rationale p{color:var(--color-muted);margin-top:5px}.flag{color:oklch(46% .12 70);background:oklch(97% .035 85);border-radius:8px;padding:10px;font-size:10px;margin-bottom:14px}.tier-label{display:block;color:var(--color-ink-2);font-size:10px;font-weight:700;margin-bottom:6px}.detail-card select{width:100%;min-height:40px;border:1px solid var(--color-rule);border-radius:8px;padding:8px 10px;background:var(--color-paper);color:var(--color-ink)}.original{font-size:10px;color:var(--color-muted);margin-top:8px}.save{display:flex;align-items:center;justify-content:center;gap:7px;width:100%;min-height:40px;background:var(--color-ink);color:var(--color-paper);border:0;border-radius:8px;padding:10px;font-size:11px;font-weight:700;margin-top:14px;cursor:pointer}.save:hover{background:var(--color-accent)}@media(max-width:950px){.review-grid{grid-template-columns:1fr}}@media(max-width:760px){.review-page{padding:24px 16px 80px}.task-table,.detail-card{padding:13px}.table-head,.task-row{grid-template-columns:minmax(95px,1.5fr) minmax(60px,1fr) 55px 48px;gap:5px}.task-row{font-size:9px;padding:10px 5px}.table-head{font-size:8px;padding-inline:5px}}
      `}</style>
    </main>
  );
};
