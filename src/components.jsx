import { useEffect } from 'react';
import { DAY, uid } from './lib';

/* ---------- shared bits ---------- */
export function Tag({t}){ const cls = t === 'New lead' ? 'signal' : t === 'Commercial' ? 'info' : t === 'Service plan' ? 'paid' : ''; return (<span className={'pill ' + cls}>{t}</span>); }
export function Switch({on, onChange, label}){
  return (<button type="button" className="switch" role="switch" aria-checked={on ? 'true' : 'false'} onClick={() => onChange(!on)}><span className="knob"></span>{label && (<span>{label}</span>)}</button>);
}
export function Modal({title, close, children}){
  useEffect(() => { const f = e => { if (e.key === 'Escape') close(); }; addEventListener('keydown', f); return () => removeEventListener('keydown', f); }, []);
  return (<div className="scrim" onClick={e => { if (e.target === e.currentTarget) close(); }}>
    <div className="modal" role="dialog" aria-modal="true" aria-label={title}>
      <div className="row-between" style={{marginBottom:12}}><h2 style={{margin:0}}>{title}</h2><button className="btn small" onClick={close}>Close</button></div>
      {children}
    </div></div>);
}
export const cust = (db, id) => db.customers.find(c => c.id === id) || {name:'Unknown', address:''};
export const techName = (db, id) => (db.techs.find(t => t.id === id) || {}).name || 'Unassigned';

export function makeInvoiceFromJob(d, j, status){
  const inv = {id:uid('i'), num:'INV-' + (d.nextInv++), customerId:j.customerId, items:[{desc:j.title, qty:1, price:j.price || 0}], status, ts:Date.now(), due:Date.now() + 14*DAY, jobId:j.id};
  d.invoices.unshift(inv); return inv;
}
