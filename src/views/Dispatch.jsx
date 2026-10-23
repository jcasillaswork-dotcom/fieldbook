import { useState } from 'react';
import { STATUSES, hourLabel, money, shortHour } from '../lib';
import { cust, makeInvoiceFromJob, techName } from '../components';
import { NewJob } from './Customers';

/* ---------- Dispatch ---------- */
export function Dispatch({db, update, say}){
  const [sel, setSel] = useState(null);
  const [adding, setAdding] = useState(false);
  const job = db.jobs.find(j => j.id === sel);
  const waiting = db.jobs.filter(j => !j.techId);
  const HOURS = Array.from({length:12}, (_, i) => 7 + i);
  const place = (techId, slot) => {
    if (!job) return;
    const start = 7 + slot / 2;
    if (start + job.dur > 19) return say('That runs past 7:00 p.m. Pick an earlier slot.');
    const clash = db.jobs.find(j => !j.history && j.id !== job.id && j.techId === techId && start < j.start + j.dur && j.start < start + job.dur);
    if (clash) return say(`That overlaps ${clash.title}. Pick another slot.`);
    update(d => { const j = d.jobs.find(x => x.id === job.id); j.techId = techId; j.start = start; });
    say(`${job.title} assigned to ${techName(db, techId)} at ${hourLabel(start)}`);
    setSel(null);
  };
  const setStatus = st => {
    const auto = db.automations.find(a => a.trigger === 'A job is marked done' && a.enabled);
    let msg = `Marked ${st}`;
    update(d => {
      const j = d.jobs.find(x => x.id === job.id); j.status = st;
      if (st === 'done' && auto && !d.invoices.some(i => i.jobId === j.id)){ const inv = makeInvoiceFromJob(d, j, 'sent'); d.automations.find(a => a.id === auto.id).runs++; msg = `Done. ${inv.num} sent and a review request texted automatically.`; }
    });
    say(msg);
  };
  return (<div className="page">
    <div className="row-between" style={{alignItems:'flex-end', marginBottom:20}}>
      <div><h1>Dispatch</h1><p className="sub" style={{margin:0}}>{job ? (job.techId ? `Moving “${job.title}”. Pick a new slot on the board.` : `Placing “${job.title}”. Pick a tech and a start time on the board.`) : 'Pick a job, then pick a slot on the board to assign it.'}</p></div>
      <button className="btn" onClick={() => setAdding(true)}>New job</button>
    </div>
    <section className="panel" style={{marginBottom:16}}>
      <div className="tape" aria-hidden="true"></div>
      <h2>Waiting for a tech</h2>
      {waiting.length ? (<div className="tray">{waiting.map(j => (<button key={j.id} className={'tray-job' + (sel === j.id ? ' sel' : '')} aria-pressed={sel === j.id} onClick={() => setSel(sel === j.id ? null : j.id)}>
        <strong>{j.title}</strong><span className="muted small">{cust(db, j.customerId).name}, {j.dur} h{j.pref ? `, asked for ${hourLabel(j.pref)}` : ''}</span></button>))}</div>) : (<p className="muted" style={{margin:0}}>Every job has a tech. New requests from the AI receptionist land here.</p>)}
    </section>
    <section className="panel scroll-x" style={{marginBottom:16}}>
      <div className={'board' + (job ? ' placing' : '')}>
        <div className="board-head"><div></div><div className="hours">{HOURS.map(h => (<span key={h}>{shortHour(h)}</span>))}</div></div>
        {db.techs.map(t => (<div className="board-row" key={t.id}>
          <div className="tech"><strong>{t.name}</strong><span>{t.skill}</span></div>
          <div className="track">
            {Array.from({length:24}, (_, i) => (<button key={i} className="slot" disabled={!job} tabIndex={job ? 0 : -1} aria-label={`Assign to ${t.name} at ${hourLabel(7 + i/2)}`} onClick={() => place(t.id, i)}></button>))}
            {db.jobs.filter(j => !j.history && j.techId === t.id).map(j => (<button key={j.id} className={'job-block s-' + j.status.replace(' ', '-') + (sel === j.id ? ' sel' : '')} style={{left:`calc(${(j.start - 7) / 12 * 100}% + 2px)`, width:`calc(${j.dur / 12 * 100}% - 4px)`}} onClick={() => setSel(sel === j.id ? null : j.id)}>
              <strong>{j.title}</strong><span>{cust(db, j.customerId).name}</span><span>{j.status}</span></button>))}
          </div></div>))}
      </div>
    </section>
    {job && (<section className="panel">
      <div className="row-between"><div><h2 style={{margin:0}}>{job.title}</h2><span className="muted">{cust(db, job.customerId).name}, {cust(db, job.customerId).address || 'no address yet'}</span></div>
      <button className="btn small" onClick={() => setSel(null)}>Close</button></div>
      <dl className="flow"><dt>Tech</dt><dd>{techName(db, job.techId)}</dd><dt>Time</dt><dd>{job.techId ? `${hourLabel(job.start)} to ${hourLabel(job.start + job.dur)}` : 'Not scheduled'}</dd><dt>Estimate</dt><dd>{money(job.price || 0)}</dd></dl>
      {job.techId && (<div style={{marginTop:14}}><div className="muted small" style={{marginBottom:6}}>Status</div><div className="steps">{STATUSES.map(st => (<button key={st} aria-pressed={job.status === st} onClick={() => setStatus(st)}>{st}</button>))}</div></div>)}
      {job.techId && (<div className="row" style={{marginTop:14}}><button className="btn small" onClick={() => { update(d => { const j = d.jobs.find(x => x.id === job.id); j.techId = null; j.start = null; }); say('Moved back to waiting'); }}>Unassign</button></div>)}
    </section>)}
    {adding && (<NewJob db={db} close={() => setAdding(false)} update={update} say={say}/>)}
  </div>);
}
