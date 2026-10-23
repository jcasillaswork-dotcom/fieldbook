import { useState, useEffect } from 'react';
import { CHANNEL, ago, hourLabel, uid } from '../lib';
import { Switch, cust } from '../components';

/* ---------- Inbox ---------- */
export const CALLERS = [
  {name:'Carla Jensen', phone:'(512) 555-0142', ask:'My AC is blowing warm air and it’s 94 degrees in here.', intent:'AC blowing warm air', reply:'3:30 please.', pref:15.5},
  {name:'Ben Whitaker', phone:'(512) 555-0193', ask:'The breaker for my kitchen keeps tripping when the microwave runs.', intent:'Kitchen breaker keeps tripping', reply:'1:00 works.', pref:13},
  {name:'Amara Osei', phone:'(512) 555-0128', ask:'I need a quote to replace two old toilets.', intent:'Quote: replace two toilets', reply:'The later one, thanks.', pref:15.5}
];
export function Inbox({db, update, focus, clearFocus, say, go}){
  const convs = [...db.conversations].sort((a,b) => b.ts - a.ts);
  const [sel, setSel] = useState((focus && focus.conv) || (convs[0] && convs[0].id));
  const [text, setText] = useState('');
  useEffect(() => { if (focus && focus.conv){ setSel(focus.conv); clearFocus(); } }, [focus]);
  const v = db.conversations.find(x => x.id === sel);
  useEffect(() => { if (v && v.unread) update(d => { d.conversations.find(x => x.id === v.id).unread = false; }); }, [sel]);
  const who = m => m.from === 'customer' ? cust(db, v.customerId).name : m.from === 'ai' ? 'AI receptionist' : m.from === 'staff' ? 'You' : m.from === 'auto' ? 'Automation' : 'System';
  const send = () => {
    if (!text.trim()) return;
    update(d => { const x = d.conversations.find(y => y.id === v.id); x.messages.push({from:'staff', text:text.trim(), ts:Date.now()}); x.ts = Date.now(); x.handledBy = 'staff'; });
    setText('');
  };
  const simulate = () => {
    const p = CALLERS[Math.floor(Math.random() * CALLERS.length)], t = Date.now(), cid = uid('c'), vid = uid('v');
    const textBack = db.automations.find(a => a.trigger === 'A call is missed' && a.enabled);
    update(d => {
      d.customers.unshift({id:cid, name:p.name, company:'', phone:p.phone, email:'', tag:'New lead', address:'', notes:'', ts:t});
      if (d.settings.receptionist){
        const jid = uid('j');
        d.jobs.push({id:jid, customerId:cid, title:p.intent, techId:null, start:null, pref:p.pref, dur:1.5, status:'scheduled', price:0, ts:t});
        d.conversations.unshift({id:vid, customerId:cid, channel:'call', handledBy:'ai', unread:true, ts:t, intent:p.intent, outcome:'Job request created', jobId:jid, messages:[
          {from:'customer', text:p.ask, ts:t},
          {from:'ai', text:'I can get someone out today. I have 1:00 p.m. or 3:30 p.m. open. Which works better?', ts:t},
          {from:'customer', text:p.reply, ts:t},
          {from:'ai', text:`You’re booked for around ${hourLabel(p.pref)}. You’ll get a text when the technician is on the way.`, ts:t}]});
      } else {
        const msgs = [{from:'system', text:'Missed call. No voicemail left.', ts:t}];
        if (textBack){ msgs.push({from:'auto', text:`Sorry we missed your call. This is ${d.settings.business}. Reply here and we’ll get you scheduled.`, ts:t}); d.automations.find(a => a.id === textBack.id).runs++; }
        d.conversations.unshift({id:vid, customerId:cid, channel:'call', handledBy:'staff', unread:true, ts:t, intent:'Missed call', outcome: textBack ? 'Texted back automatically' : 'Needs a call back', messages:msgs});
      }
    });
    setSel(vid);
    say(db.settings.receptionist ? `AI receptionist booked a job request for ${p.name}` : `Missed call from ${p.name}`);
  };
  const createJob = () => {
    const jid = uid('j');
    update(d => { d.jobs.push({id:jid, customerId:v.customerId, title:v.intent, techId:null, start:null, dur:1.5, status:'scheduled', price:0, ts:Date.now()}); const x = d.conversations.find(y => y.id === v.id); x.jobId = jid; x.outcome = 'Job request created'; });
    say('Job request added to Dispatch');
  };
  return (<div className="page">
    <div className="row-between" style={{alignItems:'flex-end', marginBottom:20}}>
      <div><h1>Inbox</h1><p className="sub" style={{margin:0}}>Calls, texts and web chats in one place. The AI receptionist answers when your team can’t.</p></div>
      <div className="row"><Switch on={db.settings.receptionist} onChange={on => { update(d => { d.settings.receptionist = on; }); say(on ? 'AI receptionist is answering' : 'AI receptionist is paused'); }} label="AI receptionist answers"/>
      <button className="btn" onClick={simulate}>Simulate incoming call</button></div>
    </div>
    <div className="split">
      <div className="panel"><ul className="list" style={{marginTop:0}}>{convs.map(x => (<li key={x.id}><button className={'item' + (x.id === sel ? ' on' : '')} onClick={() => setSel(x.id)}>
        <span className="item-main"><strong>{cust(db, x.customerId).name}</strong><span className="muted small">{CHANNEL[x.channel]}, {x.intent}</span><span className="muted small">{x.handledBy === 'ai' ? 'AI receptionist' : 'Team'}, {ago(x.ts)}</span></span>
        {x.unread && (<span className="dot" aria-label="Unread"></span>)}</button></li>))}</ul></div>
      {v ? (<section className="panel">
        <div className="row-between"><div><h2 style={{margin:0}}>{cust(db, v.customerId).name}</h2><span className="muted small">{CHANNEL[v.channel]}, {cust(db, v.customerId).phone}</span></div>
        <button className="btn small" onClick={() => go('customers', {customer:v.customerId})}>Customer record</button></div>
        <div className="outcome" style={{marginTop:14}}><span><strong>{v.outcome}</strong><br/><span className="muted small">{v.intent}</span></span>
          {v.jobId ? (<button className="btn small" onClick={() => go('dispatch')}>View job</button>) : (<button className="btn small primary" onClick={createJob}>Create job</button>)}</div>
        <div className="thread">{v.messages.map((m, n) => (<div key={n} className={'msg ' + (m.from === 'customer' ? '' : m.from === 'ai' ? 'ai' : m.from === 'staff' || m.from === 'auto' ? 'out' : 'sys')}><span className="who">{who(m)}</span>{m.text}</div>))}
          {!v.messages.length && (<div className="empty">Write the first message below.</div>)}</div>
        <div className="composer"><textarea rows="2" aria-label="Reply" placeholder={v.channel === 'call' ? 'Reply by text' : 'Write a reply'} value={text} onChange={e => setText(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey){ e.preventDefault(); send(); } }}></textarea><button className="btn primary" onClick={send} disabled={!text.trim()}>Send</button></div>
      </section>) : (<div className="empty">No conversations yet.</div>)}
    </div>
  </div>);
}
