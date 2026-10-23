import { useState } from 'react';
import { uid } from '../lib';

/* ---------- Website builder ---------- */
export const TRADES = {
  hvac:{label:'Heating & cooling', color:'#1F5FA8', services:['AC repair','Furnace tune-ups','Heat pump installs','Indoor air quality'], hero:'Heating and cooling repair, usually the same day'},
  plumbing:{label:'Plumbing', color:'#0E7C86', services:['Leak repair','Water heaters','Drain clearing','Repiping'], hero:'Plumbing fixed right the first time'},
  electrical:{label:'Electrical', color:'#B8860B', services:['Panel upgrades','EV chargers','Lighting','Inspections'], hero:'Licensed electricians for homes and businesses'},
  clinic:{label:'Clinic', color:'#2E7D5B', services:['New patient visits','Same-week appointments','Telehealth','Lab work'], hero:'Care that fits around your week'},
  logistics:{label:'Logistics', color:'#4B4FA8', services:['Same-day courier','Freight scheduling','Warehousing','Live tracking'], hero:'Freight and courier service you can track'},
  agency:{label:'Agency', color:'#A23B6B', services:['Brand strategy','Websites','Paid search','Content'], hero:'Marketing that brings in real customers'}
};
export function Website({db, update, say}){
  const [f, setF] = useState({name:db.settings.business, trade:'hvac', city:'Austin', phone:'(512) 555-0100', tone:'plain', sections:['Services','Reviews','Booking form','Service area']});
  const [site, setSite] = useState(null);
  const [book, setBook] = useState({name:'', phone:'', issue:''});
  const s = k => e => setF({...f, [k]: e.target.value});
  const tog = x => setF({...f, sections: f.sections.includes(x) ? f.sections.filter(y => y !== x) : [...f.sections, x]});
  const generate = () => {
    const t = TRADES[f.trade];
    const head = f.tone === 'warm' ? `Your neighbors in ${f.city} for ${t.label.toLowerCase()}` : f.tone === 'premium' ? `${t.label}, done properly, in ${f.city}` : `${t.hero} in ${f.city}`;
    const sub = f.tone === 'warm' ? `We’re a local team that picks up the phone, shows up on time, and treats your place like our own.` : f.tone === 'premium' ? `Careful work, clear pricing before we start, and a team that leaves the place cleaner than we found it.` : `Book online in a minute or call ${f.phone}. We confirm your time by text.`;
    setSite({...f, t, head, sub, cta: f.tone === 'premium' ? 'Request a visit' : 'Book now'});
  };
  const submitBooking = () => {
    const cid = uid('c'), t = Date.now(), lead = db.automations.find(a => a.trigger === 'A website lead comes in' && a.enabled);
    update(d => {
      d.customers.unshift({id:cid, name:book.name, company:'', phone:book.phone, email:'', tag:'New lead', address:'', notes:'Booked from the website.', ts:t});
      d.jobs.push({id:uid('j'), customerId:cid, title:book.issue, techId:null, start:null, dur:1.5, status:'scheduled', price:0, ts:t});
      if (lead) d.automations.find(a => a.id === lead.id).runs++;
    });
    setBook({name:'', phone:'', issue:''});
    say(`Booking from ${book.name} added to Dispatch`);
  };
  const S = site;
  return (<div className="page">
    <h1>Website</h1>
    <p className="sub">Describe the business and Fieldbook drafts a site. Bookings from the site go straight to Dispatch.</p>
    <div className="split">
      <section className="panel"><div className="form">
        <label className="field">Business name<input value={f.name} onChange={s('name')}/></label>
        <label className="field">What you do<select value={f.trade} onChange={s('trade')}>{Object.entries(TRADES).map(([k, v]) => (<option key={k} value={k}>{v.label}</option>))}</select></label>
        <div className="form-2"><label className="field">City<input value={f.city} onChange={s('city')}/></label><label className="field">Phone<input value={f.phone} onChange={s('phone')}/></label></div>
        <label className="field">Voice<select value={f.tone} onChange={s('tone')}><option value="plain">Plain and direct</option><option value="warm">Warm and local</option><option value="premium">Premium</option></select></label>
        <fieldset style={{border:0, padding:0, margin:0}}><legend className="muted small" style={{fontWeight:600, marginBottom:6}}>Sections</legend>
          <div className="stack" style={{gap:6}}>{['Services','Reviews','Booking form','Service area','FAQ'].map(x => (<label key={x} className="check"><input type="checkbox" checked={f.sections.includes(x)} onChange={() => tog(x)}/>{x}</label>))}</div></fieldset>
        <div className="row"><button className="btn primary" disabled={!f.name.trim() || !f.city.trim()} onClick={generate}>{S ? 'Regenerate site' : 'Generate site'}</button></div>
      </div></section>
      {S ? (<div className="site" style={{'--accent':S.t.color}}>
        <div className="site-bar" aria-hidden="true"><i></i><i></i><i></i></div>
        <div className="site-nav"><span>{S.name}</span><span style={{color:S.t.color}}>{S.phone}</span></div>
        <div className="site-hero" style={{background:S.t.color, color:'#fff'}}><h4>{S.head}</h4><p>{S.sub}</p>
          <button className="site-btn" style={{background:'#fff', color:S.t.color}} onClick={() => document.getElementById('site-book') && document.getElementById('site-book').scrollIntoView({behavior:'smooth', block:'center'})}>{S.cta}</button></div>
        {S.sections.includes('Services') && (<div className="site-sec"><h5>What we do</h5><div className="site-grid">{S.t.services.map(x => (<div key={x} className="site-card"><strong>{x}</strong></div>))}</div></div>)}
        {S.sections.includes('Reviews') && (<div className="site-sec"><h5>What customers say</h5><div className="site-grid">
          <div className="site-card">“On time, explained everything, and the price matched the quote.”<br/><small>Customer review</small></div>
          <div className="site-card">“Booked online at night and had a confirmation text before breakfast.”<br/><small>Customer review</small></div></div></div>)}
        {S.sections.includes('Service area') && (<div className="site-sec"><h5>Where we work</h5><p style={{margin:0}}>{S.city} and surrounding areas, within about 30 miles.</p></div>)}
        {S.sections.includes('FAQ') && (<div className="site-sec"><h5>Questions</h5><p style={{margin:'0 0 6px'}}><strong>How fast can you come out?</strong> Most requests get a same-day or next-day slot.</p><p style={{margin:0}}><strong>How do I pay?</strong> Card or bank transfer from the invoice link we text you.</p></div>)}
        {S.sections.includes('Booking form') && (<div className="site-sec" id="site-book"><h5>Book a visit</h5><div className="form" style={{maxWidth:420}}>
          <input placeholder="Your name" aria-label="Your name" value={book.name} onChange={e => setBook({...book, name:e.target.value})}/>
          <input placeholder="Phone" aria-label="Phone" value={book.phone} onChange={e => setBook({...book, phone:e.target.value})}/>
          <textarea rows="2" placeholder="What do you need help with?" aria-label="What do you need help with?" value={book.issue} onChange={e => setBook({...book, issue:e.target.value})}></textarea>
          <div><button className="site-btn" style={{background:S.t.color, color:'#fff'}} disabled={!book.name.trim() || !book.issue.trim()} onClick={submitBooking}>Send request</button></div>
          <small style={{opacity:.7}}>Try it: requests appear in Dispatch and Customers.</small></div></div>)}
      </div>) : (<div className="empty" style={{minHeight:300, display:'grid', placeItems:'center'}}>Fill in the details and generate a site to preview it here.</div>)}
    </div>
  </div>);
}
