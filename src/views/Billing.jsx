import { useState } from 'react';
import { DAY, STATUS_PILL, ago, fee, invStatus, invTotal, money, uid } from '../lib';
import { Modal, cust } from '../components';

/* ---------- Invoices & payments ---------- */
export function NewInvoice({db, customerId, close, update, say}){
  const [cid, setCid] = useState(customerId || db.customers[0].id);
  const [items, setItems] = useState([{desc:'', qty:1, price:0}]);
  const [dueDays, setDueDays] = useState(14);
  const total = items.reduce((s, x) => s + (+x.qty || 0) * (+x.price || 0), 0);
  const setItem = (n, k, val) => setItems(items.map((x, i) => i === n ? {...x, [k]: val} : x));
  const save = status => {
    let num;
    update(d => { num = 'INV-' + d.nextInv; d.nextInv++; d.invoices.unshift({id:uid('i'), num, customerId:cid, items:items.filter(x => x.desc.trim()).map(x => ({desc:x.desc, qty:+x.qty || 1, price:+x.price || 0})), status, ts:Date.now(), due:Date.now() + dueDays * DAY}); });
    say(status === 'sent' ? `Invoice sent to ${cust(db, cid).name}` : 'Draft saved'); close();
  };
  const ok = items.some(x => x.desc.trim()) && total > 0;
  return (<Modal title="New invoice" close={close}><div className="form">
    <div className="form-2"><label className="field">Customer<select value={cid} onChange={e => setCid(e.target.value)}>{db.customers.map(c => (<option key={c.id} value={c.id}>{c.company ? `${c.company} (${c.name})` : c.name}</option>))}</select></label>
    <label className="field">Due<select value={dueDays} onChange={e => setDueDays(+e.target.value)}><option value="0">On receipt</option><option value="14">In 14 days</option><option value="30">In 30 days</option></select></label></div>
    {items.map((x, n) => (<div key={n} style={{display:'grid', gridTemplateColumns:'1fr 70px 100px', gap:8}}>
      <input aria-label="Description" placeholder="Description" value={x.desc} onChange={e => setItem(n, 'desc', e.target.value)}/>
      <input aria-label="Quantity" type="number" min="1" value={x.qty} onChange={e => setItem(n, 'qty', e.target.value)}/>
      <input aria-label="Unit price" type="number" min="0" step="0.01" value={x.price} onChange={e => setItem(n, 'price', e.target.value)}/></div>))}
    <div className="row-between"><button className="btn ghost" onClick={() => setItems([...items, {desc:'', qty:1, price:0}])}>Add line</button><strong className="num">Total {money(total, true)}</strong></div>
    <div className="row"><button className="btn primary" disabled={!ok} onClick={() => save('sent')}>Send invoice</button><button className="btn" disabled={!ok} onClick={() => save('draft')}>Save draft</button></div>
  </div></Modal>);
}
export function PayModal({inv, db, close, update, say}){
  const [m, setM] = useState('card');
  const amt = invTotal(inv), f = fee(amt, m);
  const receipt = db.automations.find(a => a.trigger === 'A payment is received' && a.enabled);
  const confirm = () => {
    update(d => { const x = d.invoices.find(y => y.id === inv.id); x.status = 'paid'; x.paidVia = m; x.paidTs = Date.now(); if (receipt) d.automations.find(a => a.id === receipt.id).runs++; });
    say(`${inv.num} paid by ${m === 'card' ? 'card' : 'ACH'}${receipt ? '. Receipt sent.' : ''}`); close();
  };
  return (<Modal title={`Record payment for ${inv.num}`} close={close}><div className="form">
    <div className="row">{[['card','Card'],['ach','ACH bank transfer']].map(([k, l]) => (<label key={k} className="check"><input type="radio" name="m" checked={m === k} onChange={() => setM(k)}/>{l}</label>))}</div>
    <dl className="flow"><dt>Amount</dt><dd className="num">{money(amt, true)}</dd><dt>Processing fee</dt><dd className="num">{money(f, true)} <span className="muted small">{m === 'card' ? '2.9% + $0.30' : '0.8%, capped at $5'}</span></dd><dt>You receive</dt><dd className="num"><strong>{money(amt - f, true)}</strong></dd></dl>
    <p className="muted small" style={{margin:0}}>Example rates for this demo. ACH usually costs less on large commercial invoices.</p>
    <div className="row"><button className="btn primary" onClick={confirm}>Record payment</button></div>
  </div></Modal>);
}
export function Billing({db, update, say}){
  const [tab, setTab] = useState('All');
  const [newOpen, setNewOpen] = useState(false);
  const [paying, setPaying] = useState(null);
  const rows = db.invoices.filter(i => tab === 'All' || invStatus(i) === tab.toLowerCase()).sort((a, b) => b.ts - a.ts);
  const sum = st => db.invoices.filter(i => invStatus(i) === st).reduce((s, i) => s + invTotal(i), 0);
  const fees = db.invoices.filter(i => i.status === 'paid').reduce((s, i) => s + fee(invTotal(i), i.paidVia), 0);
  const act = (i, what) => {
    if (what === 'send'){ update(d => { d.invoices.find(x => x.id === i.id).status = 'sent'; }); say(`${i.num} sent`); }
    if (what === 'remind'){ update(d => { const x = d.invoices.find(y => y.id === i.id); x.reminders = (x.reminders || 0) + 1; }); say(`Reminder texted for ${i.num}`); }
  };
  return (<div className="page">
    <div className="row-between" style={{alignItems:'flex-end', marginBottom:20}}>
      <div><h1>Invoices & payments</h1><p className="sub" style={{margin:0}}>Send invoices, take card or ACH, and see what’s still owed.</p></div>
      <button className="btn primary" onClick={() => setNewOpen(true)}>New invoice</button>
    </div>
    <div className="stats">
      <div className="stat"><b className="num">{money(sum('paid'))}</b><span>Paid</span></div>
      <div className="stat"><b className="num">{money(sum('sent'))}</b><span>Sent, not yet due</span></div>
      <div className="stat"><b className="num" style={{color:'var(--late)'}}>{money(sum('overdue'))}</b><span>Overdue</span></div>
      <div className="stat"><b className="num">{money(fees, true)}</b><span>Processing fees paid</span></div>
    </div>
    <section className="panel">
      <div className="tabs">{['All','Draft','Sent','Overdue','Paid'].map(t => (<button key={t} aria-pressed={tab === t} onClick={() => setTab(t)}>{t}</button>))}</div>
      <div className="scroll-x"><table><thead><tr><th>Invoice</th><th>Customer</th><th>Status</th><th>Due</th><th className="right">Amount</th><th className="right"></th></tr></thead><tbody>
        {rows.map(i => { const st = invStatus(i), c = cust(db, i.customerId); return (<tr key={i.id}>
          <td><strong>{i.num}</strong><br/><span className="muted small">{i.items.map(x => x.desc).join(', ')}</span></td>
          <td>{c.company || c.name}</td>
          <td><span className={'pill ' + STATUS_PILL[st]}>{st}{st === 'paid' ? `, ${i.paidVia === 'card' ? 'card' : 'ACH'}` : ''}</span></td>
          <td className="muted small">{st === 'paid' ? `paid ${ago(i.paidTs)}` : ago(i.due)}</td>
          <td className="right num"><strong>{money(invTotal(i))}</strong></td>
          <td className="right"><span className="row" style={{justifyContent:'flex-end', flexWrap:'nowrap'}}>
            {st === 'draft' && (<button className="btn small" onClick={() => act(i, 'send')}>Send</button>)}
            {(st === 'sent' || st === 'overdue') && (<button className="btn small primary" onClick={() => setPaying(i)}>Record payment</button>)}
            {st === 'overdue' && (<button className="btn small" onClick={() => act(i, 'remind')}>Remind</button>)}
          </span></td></tr>); })}
      </tbody></table>{!rows.length && (<div className="empty">No {tab.toLowerCase()} invoices.</div>)}</div>
    </section>
    {newOpen && (<NewInvoice db={db} close={() => setNewOpen(false)} update={update} say={say}/>)}
    {paying && (<PayModal inv={paying} db={db} close={() => setPaying(null)} update={update} say={say}/>)}
  </div>);
}
