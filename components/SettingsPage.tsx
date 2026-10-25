'use client';

import React, { useEffect, useState } from 'react';
import { ArrowRight, CircleDollarSign, KeyRound, RefreshCw, Server, ShieldCheck } from 'lucide-react';

interface WorkspaceConfig { provider: string; model: string; credentialConfigured: boolean; credentialLocation: string; liveAnalysisEnabled: boolean; }

export function SettingsPage({ costsConfigured, onNewPlan }: { costsConfigured: boolean; onNewPlan: () => void }) {
  const [config, setConfig] = useState<WorkspaceConfig | null>(null);
  const [error, setError] = useState<string | null>(null);
  const load = async () => {
    setError(null);
    try {
      const response = await fetch('/api/workspace-config', { cache: 'no-store' });
      if (!response.ok) throw new Error('Could not read the server configuration.');
      setConfig(await response.json() as WorkspaceConfig);
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not read the server configuration.'); }
  };
  useEffect(() => { void load(); }, []);

  return <main className="settings-page dashboard-page">
    <header className="page-heading"><div><p className="page-kicker">WORKSPACE</p><h1>Settings</h1><p>Review the server-side provider and cost configuration used by this session.</p></div><button type="button" className="dashboard-secondary refresh" onClick={() => void load()}><RefreshCw size={14}/> Refresh status</button></header>
    <section className="settings-grid">
      <article className="settings-card"><div className="settings-title"><span><Server size={18}/></span><div><h2>AI analysis provider</h2><p>Configured on the Rung server</p></div></div>{error ? <p className="settings-error" role="alert">{error}</p> : <><div className="setting-line"><span>Provider</span><strong>{config?.provider ?? 'Loading…'}</strong></div><div className="setting-line"><span>Model</span><code>{config?.model ?? 'Loading…'}</code></div><div className="setting-line"><span>Live analysis</span><strong className={config?.liveAnalysisEnabled ? 'configured' : 'unconfigured'}>{config ? config.liveAnalysisEnabled ? 'Enabled' : 'Not configured' : 'Checking…'}</strong></div><div className="settings-hint"><KeyRound size={15}/><p>{config?.credentialConfigured ? 'A server key is present, and its value is never sent to the browser. Presence does not validate the key; the provider checks it when a live request is made.' : 'Add OPENROUTER_API_KEY or NVIDIA_API_KEY to the server environment to enable live analysis. Keys are never sent to the browser.'}</p></div></>}</article>
      <article className="settings-card cost-settings"><div className="settings-title"><span><CircleDollarSign size={18}/></span><div><h2>Cost profiles</h2><p>Downstream estimates are separate from analysis usage</p></div></div><div className="setting-line"><span>Price profiles</span><strong className={costsConfigured ? 'configured' : 'unconfigured'}>{costsConfigured ? 'Configured' : 'Unavailable'}</strong></div><p className="settings-description">{costsConfigured ? 'Estimates include the configured token assumptions and sourced price information.' : 'Add a model name, token assumptions, sourced input and output prices, and an “as of” date for every tier before estimates can appear.'}</p><div className="settings-hint"><ShieldCheck size={15}/><p>Provider keys and pricing profiles are managed on the server. No credentials are editable in this browser.</p></div></article>
    </section>
    <section className="settings-footer"><div><h2>Ready to route a project?</h2><p>Paste or upload a Markdown PRD and review extracted tasks before sending them for live analysis.</p></div><button className="dashboard-primary" type="button" onClick={onNewPlan}>Open planner <ArrowRight size={15}/></button></section>
    <style jsx>{`.settings-page{max-width:1250px}.refresh{min-height:38px;font-size:10px}.settings-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:13px}.settings-card{padding:19px;background:var(--color-paper);border:1px solid var(--color-rule);border-radius:12px;box-shadow:var(--shadow-sm)}.settings-title{display:flex;align-items:center;gap:10px;margin-bottom:17px}.settings-title>span{display:grid;place-items:center;width:38px;height:38px;border-radius:10px;background:var(--color-paper-2);color:var(--color-accent)}.settings-title h2{font-size:14px;margin-bottom:3px}.settings-title p{font-size:10px;color:var(--color-muted)}.setting-line{display:grid;grid-template-columns:130px minmax(0,1fr);align-items:center;gap:10px;padding:10px 0;border-top:1px solid var(--color-rule);font-size:10px}.setting-line>span{color:var(--color-muted)}.setting-line>strong{font-size:10px}.setting-line code{font:10px var(--font-mono),monospace;overflow-wrap:anywhere}.configured{color:var(--tier-light)}.unconfigured{color:var(--color-muted)}.settings-hint{display:flex;align-items:flex-start;gap:8px;padding:10px;margin-top:11px;border-radius:8px;background:var(--color-paper-2);color:var(--color-muted)}.settings-hint svg{color:var(--color-accent);flex:none;margin-top:1px}.settings-hint p,.settings-description{font-size:10px;line-height:1.55}.settings-description{color:var(--color-muted);margin-top:12px}.settings-error{color:var(--color-error);font-size:11px}.settings-footer{display:flex;align-items:center;justify-content:space-between;gap:15px;margin-top:14px;padding:17px 19px;background:linear-gradient(110deg,var(--color-paper),var(--color-paper-2));border:1px solid var(--color-rule);border-radius:12px}.settings-footer h2{font-size:13px;margin-bottom:4px}.settings-footer p{color:var(--color-muted);font-size:10px}.settings-footer .dashboard-primary{min-width:136px}@media(max-width:760px){.settings-page{padding-bottom:82px}.settings-grid{grid-template-columns:1fr}.settings-footer{align-items:flex-start;flex-direction:column}.setting-line{grid-template-columns:100px minmax(0,1fr)}}`}</style>
  </main>;
}
