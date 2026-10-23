import { useState } from 'react';
import { ACTIONS, TRIGGERS, uid } from '../lib';
import { Switch } from '../components';

/* ---------- Automations ---------- */
export function Automations({db, update, say}){
  const [trigger, setTrigger] = useState(TRIGGERS[0]);
  const [acts, setActs] = useState([]);
  const toggleAct = a => setActs(acts.includes(a) ? acts.filter(x => x !== a) : [...acts, a]);
  return (<div className="page">
    <h1>Automations</h1>
    <p className="sub">When something happens in your business, Fieldbook does the follow-up for you.</p>
    <div className="cols">
      <div className="stack">{db.automations.map(a => (<section key={a.id} className="panel">
        <div className="row-between"><h3>{a.trigger}</h3><Switch on={a.enabled} onChange={on => { update(d => { d.automations.find(x => x.id === a.id).enabled = on; }); say(on ? 'Automation turned on' : 'Automation paused'); }}/></div>
        <dl className="flow"><dt>Then</dt><dd>{a.actions.join(', then ')}</dd><dt>Ran</dt><dd className="num">{a.runs} time{a.runs === 1 ? '' : 's'}</dd></dl>
        <div className="row" style={{marginTop:10}}><button className="btn ghost small" onClick={() => { update(d => { d.automations = d.automations.filter(x => x.id !== a.id); }); say('Automation deleted'); }}>Delete</button></div>
      </section>))}</div>
      <section className="panel">
        <h2>New automation</h2>
        <div className="form">
          <label className="field">When<select value={trigger} onChange={e => setTrigger(e.target.value)}>{TRIGGERS.map(t => (<option key={t}>{t}</option>))}</select></label>
          <fieldset style={{border:0, padding:0, margin:0}}><legend className="muted small" style={{fontWeight:600, marginBottom:6}}>Then, in this order</legend>
            <div className="stack" style={{gap:6}}>{ACTIONS.map(a => (<label key={a} className="check"><input type="checkbox" checked={acts.includes(a)} onChange={() => toggleAct(a)}/>{a}{acts.includes(a) ? (<span className="pill">{acts.indexOf(a) + 1}</span>) : ''}</label>))}</div></fieldset>
          <div className="row"><button className="btn primary" disabled={!acts.length} onClick={() => { update(d => { d.automations.unshift({id:uid('a'), trigger, actions:acts, enabled:true, runs:0}); }); setActs([]); say('Automation created and turned on'); }}>Create automation</button></div>
        </div>
      </section>
    </div>
  </div>);
}
