'use client';

import React, { useMemo, useState } from 'react';
import { ArrowLeft, Check, Copy, Download } from 'lucide-react';
import type { CostSummaryData, RunMetadata, TaskItem } from '../lib/types';

interface ExportPlanProps { tasks: TaskItem[]; run: RunMetadata | null; costSummary: CostSummaryData; onBackToDashboard?: () => void; }

function cell(value: string): string { return value.replace(/\|/g, '\\|').replace(/\r?\n/g, ' '); }

export const ExportPlan: React.FC<ExportPlanProps> = ({ tasks, run, costSummary, onBackToDashboard }) => {
  const [copied, setCopied] = useState(false);
  const markdown = useMemo(() => {
    const tiers = (['light', 'standard', 'frontier'] as const).map(tier => `${tasks.filter(task => task.tier === tier).length} ${tier}`).join(', ');
    const lines = [
      '# Rung Routing Plan',
      '',
      `- Analysis mode: ${run?.mode === 'live' ? `Live ${run.provider}` : 'Not analyzed'}`,
      `- Analysis model: ${run?.model ?? 'Unavailable'}`,
      `- Tasks: ${tasks.length}`,
      `- Tier distribution: ${tiers}`,
      `- Modeled cost: ${costSummary.routedPlan === null ? 'Unavailable — no complete verified price configuration' : `$${costSummary.routedPlan.toFixed(4)}`}`,
      `- Token assumption: ${costSummary.tokenAssumption}`,
      '',
      'Rung recommends routes only. It does not execute tasks or guarantee that a model will complete them.',
      '',
      '## Task recommendations',
      '',
      '| Task | Selected tier | AI recommendation | Effort | Confidence | Review |',
      '| --- | --- | --- | --- | ---: | --- |',
      ...tasks.map(task => `| ${cell(task.title)} | ${task.tier}${task.wasOverridden ? ' (user override)' : ''} | ${task.originalTier} | ${task.effort} | ${task.confidence}% | ${task.flag ? cell(task.flagReason ?? 'Human review recommended') : 'No flag'} |`),
      '',
      '## Details',
      ...tasks.flatMap(task => [
        '',
        `### ${task.title}`,
        '',
        task.description,
        '',
        `- Selected tier: **${task.tier}**${task.wasOverridden ? ` (overridden from ${task.originalTier})` : ''}`,
        `- Model rationale: ${task.whyExplanation}`,
        `- Scores (0–100): complexity ${task.scores.complexity}, ambiguity ${task.scores.ambiguity}, cross-file ${task.scores.crossFile}, reasoning depth ${task.scores.reasoningDepth}`,
        `- Review: ${task.flag ? task.flagReason : 'No deterministic review flag'}`,
        '- Before implementation: verify the task output using the checks appropriate to your project.',
      ]),
      '',
      '## Review policy',
      '',
      '- Human review is recommended when confidence is below 65%, ambiguity is at least 65%, or any score is at least 85%.',
      '- A review flag does not change the AI-recommended tier. A tier changes only when the user overrides it.',
      '',
      '## Cost assumptions',
      '',
      costSummary.routedPlan === null
        ? 'No downstream price estimate is available because complete model profiles and sourced prices are not configured. No price is treated as zero.'
        : `Modeled costs use these token assumptions: ${costSummary.tokenAssumption}. They are estimates, not measured usage or guaranteed savings.`,
      ...costSummary.priceSources.map(source => `- ${source}`),
      '',
      '## Privacy',
      '',
      'Rung does not store this plan. In Live mode, reviewed task titles and descriptions are sent to the configured provider for analysis.',
      '',
    ];
    return lines.join('\n');
  }, [tasks, run, costSummary]);

  const copyPlan = async () => {
    try { await navigator.clipboard.writeText(markdown); setCopied(true); window.setTimeout(() => setCopied(false), 1800); } catch { setCopied(false); }
  };

  const downloadPlan = () => {
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'routing-plan.md';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="export-page">
      <header><button type="button" className="back" onClick={onBackToDashboard}><ArrowLeft size={15} /> Back to plan</button><div className="title-row"><div><h1>Export routing plan</h1></div><div className="actions"><button type="button" className="secondary" onClick={copyPlan}>{copied ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy Markdown</>}</button><button type="button" className="primary" onClick={downloadPlan}><Download size={14} /> Download .md</button></div></div></header>
      <div className="preview-head"><span>routing-plan.md</span><span>{tasks.length} tasks · {run?.mode === 'live' ? `Live ${run.provider} analysis` : 'Not analyzed'}</span></div>
      <pre><code>{markdown}</code></pre>
      <style jsx>{`
        .export-page{max-width:1260px;width:100%;margin:0 auto;padding:30px 34px 58px;color:var(--color-ink)}.back{display:inline-flex;align-items:center;gap:7px;background:none;border:0;color:var(--color-accent);font-size:11px;font-weight:700;cursor:pointer;margin-bottom:16px}.title-row{display:flex;align-items:flex-end;justify-content:space-between;gap:14px;margin-bottom:18px}.title-row h1{font-size:clamp(27px,2.6vw,36px);letter-spacing:-.05em}.actions{display:flex;gap:8px}.actions button{display:flex;align-items:center;gap:7px;min-height:38px;border-radius:8px;padding:9px 12px;font-size:10px;font-weight:700;cursor:pointer}.secondary{background:var(--color-paper);border:1px solid var(--color-rule);color:var(--color-ink-2)}.primary{background:var(--color-ink);border:1px solid var(--color-ink);color:var(--color-paper)}.primary:hover{background:var(--color-accent);border-color:var(--color-accent)}.preview-head{display:flex;justify-content:space-between;gap:12px;background:var(--color-paper-3);border:1px solid var(--color-rule);border-radius:10px 10px 0 0;padding:11px 14px;color:var(--color-ink-2);font-size:10px;font-weight:700}.export-page pre{margin:0;white-space:pre-wrap;overflow-wrap:anywhere;background:oklch(24% .035 258);border:1px solid var(--color-rule);border-top:0;border-radius:0 0 10px 10px;padding:22px;font:11px/1.75 var(--font-mono),monospace;color:oklch(96% .008 250);max-height:74vh;overflow:auto;box-shadow:var(--shadow-sm)}@media(max-width:760px){.export-page{padding:24px 16px 80px}.title-row{align-items:flex-start;flex-direction:column}.actions{width:100%}.actions button{flex:1;justify-content:center}.export-page pre{padding:15px;font-size:10px}.preview-head{align-items:flex-start;flex-direction:column}}
      `}</style>
    </main>
  );
};
