import { useState, useEffect, useRef } from 'react';
import { ago, hourLabel, invStatus, invTotal, money } from '../lib';
import { cust } from '../components';

/* ---------- Assistant ---------- */
export function answer(q, db, update){
  const s = q.toLowerCase();
  const overdue = db.invoices.filter(i => invStatus(i) === 'overdue');
  if (/remind/.test(s) && /overdue|late|owe/.test(s)){
    if (!overdue.length) return 'Nothing is overdue, so there’s no one to remind.';
    update(d => d.invoices.forEach(i => { if (invStatus(i) === 'overdue') i.reminders = (i.reminders || 0) + 1; }));
    return `Done. I texted reminders for ${overdue.length} overdue invoice${overdue.length > 1 ? 's' : ''}:\n` + overdue.map(i => `${i.num}, ${cust(db, i.customerId).company || cust(db, i.customerId).name}, ${money(invTotal(i))}`).join('\n');
  }
  if (/overdue|owe|late|unpaid|outstanding/.test(s)){
    if (!overdue.length) return 'Nothing is overdue right now.';
    const t = overdue.reduce((a, i) => a + invTotal(i), 0);
    return `${overdue.length} invoice${overdue.length > 1 ? 's are' : ' is'} overdue, ${money(t)} in total:\n` + overdue.map(i => `${i.num}, ${cust(db, i.customerId).company || cust(db, i.customerId).name}, ${money(invTotal(i))}, due ${ago(i.due)}`).join('\n') + '\n\nSay “remind overdue” and I’ll text each of them.';
  }
  if (/unassigned|waiting|need.*tech|dispatch/.test(s)){
    const w = db.jobs.filter(j => !j.techId);
    if (!w.length) return 'Every job has a tech.';
    return `${w.length} job${w.length > 1 ? 's are' : ' is'} waiting for a tech:\n` + w.map(j => {
      const free = db.techs.find(t => !db.jobs.some(o => !o.history && o.techId === t.id && (j.pref || 13) < o.start + o.dur && o.start < (j.pref || 13) + j.dur));
      return `${j.title} for ${cust(db, j.customerId).name}${free ? `. ${free.name} is free at ${hourLabel(j.pref || 13)}.` : '.'}`;
    }).join('\n');
  }
  if (/today|schedule|board|who.*working/.test(s)){
    return db.techs.map(t => { const js = db.jobs.filter(j => !j.history && j.techId === t.id).sort((a, b) => a.start - b.start); return `${t.name}: ${js.length ? js.map(j => `${hourLabel(j.start)} ${j.title} (${j.status})`).join(', ') : 'nothing booked'}`; }).join('\n');
  }
  if (/revenue|collected|paid|made|sales/.test(s)){
    const p = db.invoices.filter(i => i.status === 'paid'), t = p.reduce((a, i) => a + invTotal(i), 0);
    const card = p.filter(i => i.paidVia === 'card').length;
    return `You’ve collected ${money(t)} across ${p.length} paid invoices. ${card} came in by card and ${p.length - card} by ACH.`;
  }
  if (/expense|spend|spent|cost/.test(s)){
    const by = {}; db.expenses.forEach(e => by[e.category] = (by[e.category] || 0) + e.amount);
    const t = db.expenses.reduce((a, e) => a + e.amount, 0);
    return `Expenses logged: ${money(t, true)}.\n` + Object.entries(by).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k}: ${money(v, true)}`).join('\n');
  }
  if (/stock|inventory|low|reorder/.test(s)){
    const low = db.inventory.filter(i => i.qty < i.min);
    return low.length ? `${low.length} item${low.length > 1 ? 's are' : ' is'} below minimum:\n` + low.map(i => `${i.name}: ${i.qty} on hand, minimum ${i.min}`).join('\n') : 'Everything is at or above its minimum.';
  }
  if (/call|receptionist|lead/.test(s)){
    const ai = db.conversations.filter(v => v.handledBy === 'ai');
    return `The AI receptionist handled ${ai.length} conversations. Outcomes:\n` + ai.map(v => `${cust(db, v.customerId).name}: ${v.outcome}`).join('\n');
  }
  const c = db.customers.find(c => s.includes(c.name.toLowerCase().split(' ').slice(-1)[0]) || (c.company && s.includes(c.company.toLowerCase().split(' ')[0])));
  if (c){
    const inv = db.invoices.filter(i => i.customerId === c.id), jobs = db.jobs.filter(j => j.customerId === c.id);
    const open = inv.filter(i => i.status === 'sent').reduce((a, i) => a + invTotal(i), 0);
    return `${c.name}${c.company ? ` at ${c.company}` : ''}: ${jobs.length} job${jobs.length === 1 ? '' : 's'}, ${money(open)} open balance.${c.notes ? `\nNote: ${c.notes}` : ''}`;
  }
  return 'I can answer from the jobs, invoices, conversations and stock in this workspace. Try asking who owes you money, what’s on the board today, which jobs need a tech, what you spent, or what’s low on stock. You can also say “remind overdue”.';
}
export function Assistant({db, update}){
  const [msgs, setMsgs] = useState([{me:false, text:'Ask me about your schedule, money, customers or stock. I can also send overdue reminders for you.'}]);
  const [q, setQ] = useState('');
  const end = useRef(null);
  useEffect(() => { end.current && end.current.scrollIntoView({block:'nearest'}); }, [msgs]);
  const ask = text => { if (!text.trim()) return; setMsgs(m => [...m, {me:true, text}, {me:false, text:answer(text, db, update)}]); setQ(''); };
  return (<div className="page">
    <h1>Assistant</h1>
    <p className="sub">Answers are worked out from the jobs, invoices, conversations and stock in this workspace.</p>
    <section className="panel chat" style={{maxWidth:820}}>
      <div className="thread">{msgs.map((m, n) => (<div key={n} className={'msg ' + (m.me ? 'out' : '')}><span className="who">{m.me ? 'You' : 'Assistant'}</span>{m.text}</div>))}<div ref={end}></div></div>
      <div className="chips">{['Who owes me money?','What’s on the board today?','Which jobs need a tech?','What’s low on stock?','Remind overdue'].map(c => (<button key={c} onClick={() => ask(c)}>{c}</button>))}</div>
      <div className="composer"><input aria-label="Ask the assistant" placeholder="Ask a question" value={q} onChange={e => setQ(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') ask(q); }}/><button className="btn primary" onClick={() => ask(q)} disabled={!q.trim()}>Ask</button></div>
    </section>
  </div>);
}
