import { useState } from 'react';
import { ago, money, uid } from '../lib';

/* ---------- Expenses & stock ---------- */
export function Expenses({db, update, say}){
  const [f, setF] = useState({vendor:'', category:'Parts', amount:''});
  const by = {}; db.expenses.forEach(e => by[e.category] = (by[e.category] || 0) + e.amount);
  const max = Math.max(1, ...Object.values(by));
  const total = db.expenses.reduce((a, e) => a + e.amount, 0);
  const po = db.automations.find(a => a.trigger === 'Stock drops below minimum' && a.enabled);
  const adjust = (id, n) => update(d => { const i = d.inventory.find(x => x.id === id); i.qty = Math.max(0, i.qty + n); });
  const reorder = i => {
    const qty = i.min * 2 - i.qty, amt = +(qty * i.cost).toFixed(2);
    update(d => { d.inventory.find(x => x.id === i.id).qty += qty; d.expenses.unshift({id:uid('e'), vendor:'Supplier order', category:'Parts', amount:amt, ts:Date.now(), note:i.name}); if (po) d.automations.find(a => a.id === po.id).runs++; });
    say(`Ordered ${qty} of ${i.name} for ${money(amt, true)}`);
  };
  return (<div className="page">
    <h1>Expenses & stock</h1>
    <p className="sub">Log what you spend and keep the vans and warehouse stocked.</p>
    <div className="cols">
      <section className="panel">
        <div className="row-between"><h2>Expenses</h2><strong className="num">{money(total, true)}</strong></div>
        <div className="bars" style={{marginBottom:18}}>{Object.entries(by).sort((a, b) => b[1] - a[1]).map(([k, v]) => (<div key={k} className="bar-row"><span>{k}</span><span className="bar"><i style={{width:(v / max * 100) + '%'}}></i></span><span className="num right" style={{textAlign:'right'}}>{money(v)}</span></div>))}</div>
        <div style={{display:'grid', gridTemplateColumns:'1.4fr 1fr 0.8fr auto', gap:8, marginBottom:12}}>
          <input aria-label="Vendor" placeholder="Vendor" value={f.vendor} onChange={e => setF({...f, vendor:e.target.value})}/>
          <select aria-label="Category" value={f.category} onChange={e => setF({...f, category:e.target.value})}>{['Parts','Fuel','Tools','Software','Phones','Meals','Vehicle','Other'].map(c => (<option key={c}>{c}</option>))}</select>
          <input aria-label="Amount" type="number" min="0" step="0.01" placeholder="0.00" value={f.amount} onChange={e => setF({...f, amount:e.target.value})}/>
          <button className="btn primary" disabled={!f.vendor.trim() || !(+f.amount > 0)} onClick={() => { update(d => { d.expenses.unshift({id:uid('e'), vendor:f.vendor.trim(), category:f.category, amount:+f.amount, ts:Date.now()}); }); setF({vendor:'', category:f.category, amount:''}); say('Expense logged'); }}>Log</button>
        </div>
        <ul className="lines">{db.expenses.slice(0, 8).map(e => (<li key={e.id}><span><strong>{e.vendor}</strong><br/><span className="muted small">{e.category}{e.note ? `, ${e.note}` : ''}, {ago(e.ts)}</span></span><span className="num">{money(e.amount, true)}</span></li>))}</ul>
      </section>
      <section className="panel">
        <h2>Stock</h2>
        <div className="scroll-x"><table><thead><tr><th>Item</th><th className="right">On hand</th><th></th></tr></thead><tbody>
          {db.inventory.map(i => (<tr key={i.id}>
            <td><strong>{i.name}</strong><br/><span className="muted small">{i.bin}, minimum {i.min}</span> {i.qty < i.min && (<span className="pill late">Low</span>)}</td>
            <td className="right"><span className="row" style={{justifyContent:'flex-end', flexWrap:'nowrap'}}><button className="btn small" aria-label={`Use one ${i.name}`} onClick={() => adjust(i.id, -1)}>−</button><b className="num" style={{minWidth:24, textAlign:'center'}}>{i.qty}</b><button className="btn small" aria-label={`Add one ${i.name}`} onClick={() => adjust(i.id, 1)}>+</button></span></td>
            <td className="right">{i.qty < i.min && (<button className="btn small primary" onClick={() => reorder(i)}>Reorder</button>)}</td></tr>))}
        </tbody></table></div>
      </section>
    </div>
  </div>);
}
