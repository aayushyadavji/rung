'use client';

import React from 'react';
import { ArrowLeft, Info } from 'lucide-react';
import type { CostSummaryData, TaskItem } from '../lib/types';

interface CostSummaryProps { costSummary: CostSummaryData; tasks: TaskItem[]; onBack?: () => void; }

export const CostSummary: React.FC<CostSummaryProps> = ({ costSummary, tasks, onBack }) => {
  const configured = costSummary.allFrontier !== null && costSummary.routedPlan !== null;
  const counts = {
    light: tasks.filter(task => task.tier === 'light').length,
    standard: tasks.filter(task => task.tier === 'standard').length,
    frontier: tasks.filter(task => task.tier === 'frontier').length,
  };

  return (
    <main className="cost-page">
      <button type="button" className="back" onClick={onBack}><ArrowLeft size={15} /> {tasks.length ? 'Back to plan' : 'Back to Home'}</button>
      <h1>Model cost assumptions</h1>
      <p className="intro">Rung keeps downstream model estimates separate from the AI call that analyzes tasks. Estimates are shown only when every route has a configured model profile and sourced prices.</p>
      {configured ? (
        <section className="comparison">
          <div><span>All-frontier baseline</span><strong>${costSummary.allFrontier!.toFixed(4)}</strong></div>
          <div><span>Routed plan</span><strong>${costSummary.routedPlan!.toFixed(4)}</strong></div>
          <div><span>Modeled difference</span><strong>{costSummary.savingsPercent === null ? 'Unavailable' : `${costSummary.savingsPercent}%`}</strong></div>
        </section>
      ) : <section className="unavailable"><Info size={18} /><div><strong>Estimate unavailable</strong><p>No verified price profiles are configured. Rung does not substitute zero or invent model prices.</p></div></section>}
      <section className="assumptions">
        <h2>What the estimate uses</h2>
        <ul><li>{costSummary.tokenAssumption}; these are assumptions, not measured tokens.</li><li>Each tier needs a model name, input and output price per million tokens, source URL, and “as of” date.</li><li>Analysis API usage and charges are not included unless the provider returns usage and a matching price is configured.</li><li>Modelled cost does not establish equal quality for different models.</li></ul>
        {costSummary.priceSources.length > 0 && <><h3>Configured price sources</h3><ul>{costSummary.priceSources.map(source => <li key={source}>{source}</li>)}</ul></>}
      </section>
      <section className="distribution"><h2>Current plan distribution <span>{tasks.length} tasks</span></h2><div>{(['light', 'standard', 'frontier'] as const).map(tier => <article key={tier} className={tier}><span>{tier}</span><strong>{counts[tier]}</strong></article>)}</div></section>
      <style jsx>{`
        .cost-page{max-width:1180px;width:100%;margin:0 auto;padding:30px 34px 58px;color:var(--color-ink)}.back{display:flex;align-items:center;gap:7px;background:none;border:0;color:var(--color-accent);font-size:11px;font-weight:700;cursor:pointer;margin-bottom:17px}.cost-page h1{font-size:clamp(27px,2.6vw,36px);letter-spacing:-.05em}.intro{color:var(--color-muted);font-size:12px;line-height:1.6;max-width:760px;margin:8px 0 19px}.unavailable,.assumptions,.distribution,.comparison{background:var(--color-paper);border:1px solid var(--color-rule);border-radius:12px;padding:18px;margin-bottom:12px;box-shadow:var(--shadow-sm)}.unavailable{display:flex;gap:10px;align-items:flex-start;background:oklch(98% .025 80);color:oklch(42% .11 65)}.unavailable p{font-size:11px;margin-top:4px}.comparison{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.comparison div{display:flex;flex-direction:column;gap:8px}.comparison span{font-size:10px;color:var(--color-muted)}.comparison strong{font-size:24px}.assumptions h2,.distribution h2{font-size:15px;margin-bottom:10px}.assumptions ul{padding-left:20px;color:var(--color-muted);font-size:11px;line-height:1.8}.assumptions h3{font-size:12px;margin:16px 0 5px}.distribution h2{display:flex;justify-content:space-between}.distribution h2 span{font-size:10px;color:var(--color-muted);font-weight:500}.distribution>div{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px}.distribution article{display:flex;justify-content:space-between;align-items:center;padding:12px;border:1px solid var(--color-rule);border-radius:9px;background:var(--color-paper-2);text-transform:capitalize;font-size:11px}.distribution article strong{font-size:18px}.distribution .light strong{color:var(--tier-light)}.distribution .standard strong{color:var(--tier-standard)}.distribution .frontier strong{color:var(--tier-frontier)}@media(max-width:760px){.cost-page{padding:24px 16px 80px}.comparison{grid-template-columns:1fr}.distribution>div{grid-template-columns:1fr}}
      `}</style>
    </main>
  );
};
