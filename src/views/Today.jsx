import { DAY, ago, hourLabel, invStatus, invTotal, money } from '../lib';
import { cust, techName } from '../components';

/* ---------- Today ---------- */
export function Today({db, go, update, say}){
  const board = db.jobs.filter(j => !j.history && j.techId).sort((a,b) => a.start - b.start);
  const waiting = db.jobs.filter(j => !j.techId);
  const overdue = db.invoices.filter(i => invStatus(i) === 'overdue');
  const outstanding = db.invoices.filter(i => i.status === 'sent').reduce((s,i) => s + invTotal(i), 0);
  const collected = db.invoices.filter(i => i.status === 'paid' && Date.now() - i.paidTs < 30*DAY).reduce((s,i) => s + invTotal(i), 0);
  const aiToday = db.conversations.filter(v => v.handledBy === 'ai' && Date.now() - v.ts < DAY);
  const leads = db.customers.filter(c => c.tag === 'New lead');
  const remind = i => { update(d => { const x = d.invoices.find(y => y.id === i.id); x.reminders = (x.reminders || 0) + 1; }); say(`Reminder texted to ${cust(db, i.customerId).name}`); };
  return (<div className="page">
    <h1>Today at {db.settings.business}</h1>
    <p className="sub">{board.length} jobs on the board, {waiting.length} waiting for a tech, {overdue.length} invoice{overdue.length === 1 ? '' : 's'} overdue.</p>
    <div className="stats">
      <div className="stat"><b className="num">{money(collected)}</b><span>Collected in the last 30 days</span></div>
      <div className="stat"><b className="num">{money(outstanding)}</b><span>Waiting to be paid</span></div>
      <div className="stat"><b className="num">{aiToday.length}</b><span>Calls and texts the AI receptionist handled today</span></div>
      <div className="stat"><b className="num">{board.filter(j => j.status === 'done').length} of {board.length}</b><span>Jobs finished</span></div>
    </div>
    <div className="cols">
      <section className="panel">
        <div className="row-between"><h2>On the board</h2><button className="btn small" onClick={() => go('dispatch')}>Open dispatch</button></div>
        <ul className="lines">{board.map(j => (<li key={j.id}>
          <span><strong>{j.title}</strong><br/><span className="muted small">{hourLabel(j.start)}, {techName(db, j.techId)}, {cust(db, j.customerId).name}</span></span>
          <span className={'pill ' + (j.status === 'done' ? 'paid' : j.status === 'on site' ? 'signal' : j.status === 'en route' ? 'info' : '')}>{j.status}</span></li>))}</ul>
      </section>
      <section className="stack">
        <div className="panel">
          <h2>Needs a tech</h2>
          {waiting.length ? (<ul className="lines">{waiting.map(j => (<li key={j.id}><span><strong>{j.title}</strong><br/><span className="muted small">{cust(db, j.customerId).name}, requested {ago(j.ts)}</span></span><button className="btn small primary" onClick={() => go('dispatch')}>Assign</button></li>))}</ul>) : (<p className="muted">Every job has a tech.</p>)}
        </div>
        <div className="panel">
          <h2>Overdue invoices</h2>
          {overdue.length ? (<ul className="lines">{overdue.map(i => (<li key={i.id}><span><strong>{cust(db, i.customerId).company || cust(db, i.customerId).name}</strong><br/><span className="muted small">{i.num}, due {ago(i.due)}{i.reminders ? `, ${i.reminders} reminder${i.reminders > 1 ? 's' : ''} sent` : ''}</span></span><span className="row"><b className="num">{money(invTotal(i))}</b><button className="btn small" onClick={() => remind(i)}>Text reminder</button></span></li>))}</ul>) : (<p className="muted">Nothing overdue.</p>)}
        </div>
        <div className="panel">
          <h2>New leads</h2>
          {leads.length ? (<ul className="lines">{leads.map(c => (<li key={c.id}><span><strong>{c.name}</strong><br/><span className="muted small">{c.phone}, added {ago(c.ts)}</span></span><button className="btn small" onClick={() => go('customers', {customer:c.id})}>Open record</button></li>))}</ul>) : (<p className="muted">No new leads yet today.</p>)}
        </div>
      </section>
    </div>
  </div>);
}
