import { useState, useEffect } from 'react';
import { CHANNEL, ago, hourLabel, invStatus, invTotal, money, uid } from '../lib';
import { Modal, Tag, techName } from '../components';
import { NewInvoice } from './Billing';

/* ---------- Customers ---------- */
export function Customers({db, update, focus, clearFocus, go, say}){
  const [q, setQ] = useState('');
  const [sel, setSel] = useState((focus && focus.customer) || db.customers[0].id);
  const [adding, setAdding] = useState(false);
  useEffect(() => { if (focus && focus.customer){ setSel(focus.customer); clearFocus(); } }, [focus]);
  const list = db.customers.filter(c => (c.name + ' ' + c.company + ' ' + c.tag + ' ' + c.phone).toLowerCase().includes(q.toLowerCase()));
  const c = db.customers.find(x => x.id === sel) || db.customers[0];
  return (<div className="page">
    <h1>Customers</h1>
    <p className="sub">Every call, job, invoice and payment for a customer lives on one record.</p>
    <div className="split">
      <div className="panel">
        <div className="row" style={{flexWrap:'nowrap'}}><input type="search" placeholder="Search name, company or phone" aria-label="Search customers" value={q} onChange={e => setQ(e.target.value)}/><button className="btn" onClick={() => setAdding(true)}>Add</button></div>
        <ul className="list">{list.map(x => (<li key={x.id}><button className={'item' + (x.id === c.id ? ' on' : '')} onClick={() => setSel(x.id)}>
          <span className="item-main"><strong>{x.name}</strong><span className="muted small">{x.company || x.address}</span></span><Tag t={x.tag}/></button></li>))}
          {!list.length && (<li className="empty">No customers match “{q}”.</li>)}</ul>
      </div>
      <Record key={c.id} c={c} db={db} update={update} go={go} say={say}/>
    </div>
    {adding && (<AddCustomer close={() => setAdding(false)} onAdd={n => { update(d => { d.customers.unshift(n); }); setSel(n.id); setAdding(false); say('Customer added'); }}/>)}
  </div>);
}
export function AddCustomer({close, onAdd}){
  const [f, setF] = useState({name:'', company:'', phone:'', email:'', address:'', tag:'Homeowner'});
  const s = k => e => setF({...f, [k]: e.target.value});
  return (<Modal title="Add customer" close={close}>
    <div className="form">
      <div className="form-2"><label className="field">Name<input value={f.name} onChange={s('name')} autoFocus/></label><label className="field">Company (optional)<input value={f.company} onChange={s('company')}/></label></div>
      <div className="form-2"><label className="field">Phone<input value={f.phone} onChange={s('phone')}/></label><label className="field">Email<input type="email" value={f.email} onChange={s('email')}/></label></div>
      <label className="field">Address<input value={f.address} onChange={s('address')}/></label>
      <label className="field">Type<select value={f.tag} onChange={s('tag')}>{['Homeowner','Commercial','Service plan','New lead'].map(t => (<option key={t}>{t}</option>))}</select></label>
      <div className="row"><button className="btn primary" disabled={!f.name.trim()} onClick={() => onAdd({...f, id:uid('c'), notes:'', ts:Date.now()})}>Add customer</button></div>
    </div></Modal>);
}
export function Record({c, db, update, go, say}){
  const [modal, setModal] = useState(null);
  const [notes, setNotes] = useState(c.notes);
  const jobs = db.jobs.filter(j => j.customerId === c.id);
  const invs = db.invoices.filter(i => i.customerId === c.id);
  const convs = db.conversations.filter(v => v.customerId === c.id);
  const paid = invs.filter(i => i.status === 'paid').reduce((s,i) => s + invTotal(i), 0);
  const open = invs.filter(i => i.status === 'sent').reduce((s,i) => s + invTotal(i), 0);
  const events = [
    ...convs.map(v => ({k:'call', ts:v.ts, title:`${CHANNEL[v.channel]}, ${v.handledBy === 'ai' ? 'answered by the AI receptionist' : 'answered by your team'}`, detail:`${v.intent}. ${v.outcome}.`, act:() => go('inbox', {conv:v.id}), actLabel:'Open conversation'})),
    ...jobs.map(j => ({k:'job', ts:j.ts, title:`Job: ${j.title}`, detail: j.history ? `${techName(db, j.techId)}, ${new Date(j.ts).toLocaleDateString('en-US', {month:'short', day:'numeric'})}, ${money(j.price)}` : j.techId ? `${techName(db, j.techId)} at ${hourLabel(j.start)}, ${j.status}` : 'Waiting for a tech', act:() => go('dispatch'), actLabel:'View on board'})),
    ...invs.map(i => ({k:'invoice', ts:i.ts, title:`Invoice ${i.num} for ${money(invTotal(i))}`, detail: invStatus(i) === 'overdue' ? `Overdue since ${ago(i.due).replace(' ago','')}` : invStatus(i) === 'draft' ? 'Draft, not sent' : invStatus(i) === 'paid' ? 'Paid' : `Due ${ago(i.due)}`, act:() => go('billing'), actLabel:'Open invoices'})),
    ...invs.filter(i => i.status === 'paid').map(i => ({k:'payment', ts:i.paidTs, title:`Payment of ${money(invTotal(i))} by ${i.paidVia === 'card' ? 'card' : 'ACH bank transfer'}`, detail:`Settled ${i.num}`}))
  ].sort((a,b) => b.ts - a.ts);
  const startText = () => {
    const ex = db.conversations.find(v => v.customerId === c.id && v.channel === 'sms');
    if (ex) return go('inbox', {conv:ex.id});
    const id = uid('v');
    update(d => { d.conversations.unshift({id, customerId:c.id, channel:'sms', handledBy:'staff', unread:false, ts:Date.now(), intent:'Outbound text', outcome:'Started by your team', messages:[]}); });
    go('inbox', {conv:id});
  };
  return (<section className="panel">
    <div className="record-head">
      <div><h2>{c.name}</h2><div className="muted">{[c.company, c.address].filter(Boolean).join(', ')}</div><div className="small" style={{marginTop:6}}>{c.phone}{c.email ? (<span className="muted">  {c.email}</span>) : ''}</div></div>
      <div className="row" style={{alignItems:'flex-start'}}><Tag t={c.tag}/></div>
    </div>
    <div className="row" style={{marginBottom:16}}>
      <button className="btn" onClick={startText}>Text</button>
      <button className="btn" onClick={() => setModal('job')}>New job</button>
      <button className="btn" onClick={() => setModal('invoice')}>New invoice</button>
      {c.tag === 'New lead' && (<button className="btn" onClick={() => { update(d => { d.customers.find(x => x.id === c.id).tag = 'Homeowner'; }); say(`${c.name} is now a customer`); }}>Convert lead</button>)}
    </div>
    <div className="facts">
      <div><b className="num">{money(paid)}</b><span>Lifetime paid</span></div>
      <div><b className="num">{money(open)}</b><span>Open balance</span></div>
      <div><b className="num">{jobs.length}</b><span>Jobs</span></div>
    </div>
    <div className="cols" style={{gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))'}}>
      <div>
        <h3 style={{marginBottom:12}}>History</h3>
        {events.length ? (<ol className="spine">{events.map((e, n) => (<li key={n} className={'event ' + e.k}>
          <div className="row-between"><strong>{e.title}</strong><span className="muted small">{ago(e.ts)}</span></div>
          <p>{e.detail}</p>
          {e.act && (<button className="btn ghost small" onClick={e.act}>{e.actLabel}</button>)}</li>))}</ol>) : (<div className="empty">No history yet. Book a job or send a text to start one.</div>)}
      </div>
      <div><label className="field">Notes for the team<textarea rows="6" value={notes} onChange={e => setNotes(e.target.value)} onBlur={() => { if (notes !== c.notes){ update(d => { d.customers.find(x => x.id === c.id).notes = notes; }); say('Notes saved'); } }} placeholder="Gate codes, pets, preferred times"></textarea></label></div>
    </div>
    {modal === 'job' && (<NewJob db={db} customerId={c.id} close={() => setModal(null)} update={update} say={say}/>)}
    {modal === 'invoice' && (<NewInvoice db={db} customerId={c.id} close={() => setModal(null)} update={update} say={say}/>)}
  </section>);
}
export function NewJob({db, customerId, close, update, say}){
  const [f, setF] = useState({customerId: customerId || db.customers[0].id, title:'', dur:'1.5', price:'', techId:'', start:'9'});
  const s = k => e => setF({...f, [k]: e.target.value});
  const save = () => {
    update(d => { d.jobs.push({id:uid('j'), customerId:f.customerId, title:f.title.trim(), dur:+f.dur, price:+f.price || 0, techId:f.techId || null, start:f.techId ? +f.start : null, status:'scheduled', ts:Date.now()}); });
    say(f.techId ? `Job booked with ${techName(db, f.techId)}` : 'Job added to Dispatch, waiting for a tech'); close();
  };
  return (<Modal title="New job" close={close}><div className="form">
    {!customerId && (<label className="field">Customer<select value={f.customerId} onChange={s('customerId')}>{db.customers.map(c => (<option key={c.id} value={c.id}>{c.name}</option>))}</select></label>)}
    <label className="field">What needs doing<input value={f.title} onChange={s('title')} placeholder="e.g. AC not cooling upstairs" autoFocus/></label>
    <div className="form-2"><label className="field">Length<select value={f.dur} onChange={s('dur')}>{[0.5,1,1.5,2,3,4].map(h => (<option key={h} value={h}>{h} h</option>))}</select></label>
    <label className="field">Estimated price<input type="number" min="0" value={f.price} onChange={s('price')} placeholder="0"/></label></div>
    <div className="form-2"><label className="field">Tech<select value={f.techId} onChange={s('techId')}><option value="">Assign later</option>{db.techs.map(t => (<option key={t.id} value={t.id}>{t.name}</option>))}</select></label>
    <label className="field">Start<select value={f.start} onChange={s('start')} disabled={!f.techId}>{Array.from({length:22}, (_, i) => 7 + i/2).map(h => (<option key={h} value={h}>{hourLabel(h)}</option>))}</select></label></div>
    <div className="row"><button className="btn primary" disabled={!f.title.trim()} onClick={save}>Book job</button></div>
  </div></Modal>);
}
