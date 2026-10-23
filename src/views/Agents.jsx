import { useState, useEffect } from 'react';
import { uid } from '../lib';
import { Switch } from '../components';

/* ---------- AI agents ---------- */
export function Agents({db, update, say}){
  const [sel, setSel] = useState(db.agents[0] && db.agents[0].id);
  const a = db.agents.find(x => x.id === sel);
  const [draft, setDraft] = useState(a ? a.instructions : '');
  useEffect(() => { setDraft(a ? a.instructions : ''); }, [sel]);
  const set = (k, v) => update(d => { d.agents.find(x => x.id === a.id)[k] = v; });
  const CH = ['Phone','SMS','Web chat','Email','Internal'];
  const create = () => { const id = uid('g'); update(d => { d.agents.push({id, name:'New agent', instructions:'', channels:['Internal'], canBook:false, needsApproval:true, enabled:false, week:0}); }); setSel(id); };
  return (<div className="page">
    <div className="row-between" style={{alignItems:'flex-end', marginBottom:20}}>
      <div><h1>AI agents</h1><p className="sub" style={{margin:0}}>Agents handle a job on their own, following the instructions you write.</p></div>
      <button className="btn" onClick={create}>New agent</button>
    </div>
    <div className="split">
      <div className="panel"><ul className="list" style={{marginTop:0}}>{db.agents.map(x => (<li key={x.id}><button className={'item' + (x.id === sel ? ' on' : '')} onClick={() => setSel(x.id)}>
        <span className="item-main"><strong>{x.name}</strong><span className="muted small">{x.channels.join(', ')}</span></span>
        <span className={'pill ' + (x.enabled ? 'paid' : '')}>{x.enabled ? 'On' : 'Off'}</span></button></li>))}</ul></div>
      {a && (<section className="panel"><div className="form">
        <div className="row-between"><label className="field" style={{flex:1}}>Name<input value={a.name} onChange={e => set('name', e.target.value)}/></label><div style={{paddingTop:20}}><Switch on={a.enabled} onChange={v => { set('enabled', v); say(v ? `${a.name} is on` : `${a.name} is off`); }} label={a.enabled ? 'On' : 'Off'}/></div></div>
        <label className="field">Instructions<textarea rows="6" value={draft} onChange={e => setDraft(e.target.value)} placeholder="Describe the job in plain words: what to do, what to avoid, when to hand off to a person."></textarea></label>
        <fieldset style={{border:0, padding:0, margin:0}}><legend className="muted small" style={{fontWeight:600, marginBottom:6}}>Where it works</legend>
          <div className="row">{CH.map(c => (<label key={c} className="check"><input type="checkbox" checked={a.channels.includes(c)} onChange={() => set('channels', a.channels.includes(c) ? a.channels.filter(x => x !== c) : [...a.channels, c])}/>{c}</label>))}</div></fieldset>
        <label className="check"><input type="checkbox" checked={a.canBook} onChange={e => set('canBook', e.target.checked)}/>Can book jobs on the dispatch board</label>
        <label className="check"><input type="checkbox" checked={a.needsApproval} onChange={e => set('needsApproval', e.target.checked)}/>Ask me before sending anything about money</label>
        <p className="muted small" style={{margin:0}}>{a.week} conversations this week.</p>
        <div className="row"><button className="btn primary" disabled={draft === a.instructions} onClick={() => { set('instructions', draft); say('Instructions saved'); }}>Save instructions</button>
        <button className="btn ghost" onClick={() => { update(d => { d.agents = d.agents.filter(x => x.id !== a.id); }); setSel(db.agents.find(x => x.id !== a.id)?.id); say('Agent deleted'); }}>Delete agent</button></div>
      </div></section>)}
    </div>
  </div>);
}
