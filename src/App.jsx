import { useState, useEffect, useRef } from 'react';
import { KEY, LABELS, VIEWS, clone, invStatus, load, seed } from './lib';
import { Today } from './views/Today';
import { Customers } from './views/Customers';
import { Inbox } from './views/Inbox';
import { Dispatch } from './views/Dispatch';
import { Billing } from './views/Billing';
import { Automations } from './views/Automations';
import { Assistant } from './views/Assistant';
import { Agents } from './views/Agents';
import { Website } from './views/Website';
import { Expenses } from './views/Expenses';

/* ---------- App shell ---------- */
export function App(){
  const [db, setDb] = useState(load);
  const [view, setView] = useState(() => VIEWS.includes(location.hash.slice(1)) ? location.hash.slice(1) : 'today');
  const [focus, setFocus] = useState(null);
  const [toast, setToast] = useState(null);
  const mainRef = useRef(null), timer = useRef(null);
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(db)); } catch(e){} }, [db]);
  useEffect(() => { const f = () => { const v = location.hash.slice(1); if (VIEWS.includes(v)) setView(v); }; addEventListener('hashchange', f); return () => removeEventListener('hashchange', f); }, []);
  const update = fn => setDb(d => { const n = clone(d); fn(n); return n; });
  const say = m => { setToast(m); clearTimeout(timer.current); timer.current = setTimeout(() => setToast(null), 3000); };
  const go = (v, f) => { setView(v); setFocus(f || null); try { history.replaceState(null, '', '#' + v); } catch(e){} if (mainRef.current) mainRef.current.scrollTop = 0; };
  const counts = {
    inbox: db.conversations.filter(v => v.unread).length,
    dispatch: db.jobs.filter(j => !j.techId).length,
    billing: db.invoices.filter(i => invStatus(i) === 'overdue').length
  };
  const props = {db, update, say, go, focus, clearFocus:() => setFocus(null)};
  const V = {today:Today, inbox:Inbox, customers:Customers, dispatch:Dispatch, billing:Billing, automations:Automations, assistant:Assistant, agents:Agents, website:Website, expenses:Expenses}[view];
  return (<div className="app">
    <nav className="rail" aria-label="Main">
      <div className="brand"><span className="brand-mark" aria-hidden="true"></span>Fieldbook</div>
      <div className="biz">{db.settings.business}</div>
      <ul className="nav">{VIEWS.map(v => (<li key={v}><button aria-current={view === v ? 'page' : undefined} onClick={() => go(v)}><span>{LABELS[v]}</span>{counts[v] ? (<span className="count" aria-label={`${counts[v]} need attention`}>{counts[v]}</span>) : ''}</button></li>))}</ul>
      <div className="rail-foot">Mock data for a proof of concept. Changes stay in this browser.<br/><button onClick={() => { if (confirm('Reset all demo data?')) { setDb(seed()); say('Demo data reset'); } }}>Reset demo data</button></div>
    </nav>
    <main ref={mainRef}><V key={view} {...props}/></main>
    {toast && (<div className="toast" role="status">{toast}</div>)}
  </div>);
}
