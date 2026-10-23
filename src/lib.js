export const MIN = 60e3, H = 3600e3, DAY = 24 * H;
export const KEY = 'fieldbook-demo-v2';
export const VIEWS = ['today','inbox','customers','dispatch','billing','automations','assistant','agents','website','expenses'];
export const LABELS = {today:'Today',inbox:'Inbox',customers:'Customers',dispatch:'Dispatch',billing:'Invoices & payments',automations:'Automations',assistant:'Assistant',agents:'AI agents',website:'Website',expenses:'Expenses & stock'};
export const STATUSES = ['scheduled','en route','on site','done'];
export const CHANNEL = {call:'Phone call',sms:'Text',chat:'Web chat'};
export const TRIGGERS = ['A job is marked done','An invoice is 7 days overdue','A call is missed','A website lead comes in','Stock drops below minimum','A payment is received'];
export const ACTIONS = ['Send the invoice','Text a review request','Send an SMS reminder','Notify the owner','Text back within 1 minute','Create a customer record','Have the Front desk agent qualify the lead','Book an estimate','Draft a purchase order','Send a receipt'];

export const clone = o => (typeof structuredClone === 'function' ? structuredClone(o) : JSON.parse(JSON.stringify(o)));
export const uid = p => p + Math.random().toString(36).slice(2, 8);
export const money = (n, cents) => n.toLocaleString('en-US', {style:'currency',currency:'USD',minimumFractionDigits: cents || n % 1 ? 2 : 0, maximumFractionDigits:2});
export const hourLabel = h => `${((Math.floor(h) + 11) % 12) + 1}:${h % 1 ? '30' : '00'} ${h < 12 ? 'a.m.' : 'p.m.'}`;
export const shortHour = h => `${((h + 11) % 12) + 1}${h < 12 ? 'a' : 'p'}`;
export function ago(ts){
  const d = Date.now() - ts, a = Math.abs(d), fut = d < 0;
  if (a < MIN) return 'just now';
  const v = a < H ? `${Math.round(a/MIN)} min` : a < DAY ? `${Math.round(a/H)} h` : `${Math.round(a/DAY)} d`;
  return fut ? `in ${v}` : `${v} ago`;
}
export const invTotal = i => i.items.reduce((s, x) => s + x.qty * x.price, 0);
export const invStatus = i => i.status === 'paid' ? 'paid' : i.status === 'draft' ? 'draft' : i.due < Date.now() ? 'overdue' : 'sent';
export const STATUS_PILL = {paid:'paid',overdue:'late',sent:'info',draft:''};
export const fee = (amt, m) => m === 'card' ? amt * 0.029 + 0.30 : Math.min(amt * 0.008, 5);

export function seed(){ return addHistory(baseSeed()); }
export function baseSeed(){
  const t = Date.now();
  return {
    settings:{business:'Northside Home Services', receptionist:true}, nextInv:1048,
    techs:[
      {id:'t1',name:'Marisol Reyes',skill:'Heating & cooling'},
      {id:'t2',name:'Dev Patel',skill:'Electrical'},
      {id:'t3',name:'Grace Okafor',skill:'Plumbing'},
      {id:'t4',name:'Luis Fuentes',skill:'Install crew'}
    ],
    customers:[
      {id:'c1',name:'Hannah Lindqvist',company:'',phone:'(512) 555-0110',email:'hannah.l@example.com',tag:'Service plan',address:'1408 Maple Ridge Dr',notes:'Dog in the backyard. Prefers morning visits.',ts:t-400*DAY},
      {id:'c2',name:'Dr. Omar Haddad',company:'Brightwater Dental',phone:'(512) 555-0122',email:'office@brightwater.example',tag:'Commercial',address:'220 Lakeview Blvd, Suite 4',notes:'Three rooftop units. Access code is at the front desk.',ts:t-610*DAY},
      {id:'c3',name:'Rosa Calloway',company:'',phone:'(512) 555-0133',email:'rosa.calloway@example.com',tag:'Homeowner',address:'77 Pecan St',notes:'',ts:t-90*DAY},
      {id:'c4',name:'Priya Nair',company:'Kestrel Logistics',phone:'(512) 555-0144',email:'facilities@kestrel.example',tag:'Commercial',address:'9 Freight Way, Dock C',notes:'Net 30 terms. PO number required on every invoice.',ts:t-300*DAY},
      {id:'c5',name:'Marcus Bell',company:'',phone:'(512) 555-0155',email:'mbell@example.com',tag:'Homeowner',address:'3120 Oakhurst Ln',notes:'',ts:t-20*DAY},
      {id:'c6',name:'Yuki Tanaka',company:'Elm Street Café',phone:'(512) 555-0166',email:'yuki@elmstreetcafe.example',tag:'Commercial',address:'41 Elm St',notes:'Before 7 a.m. or after 3 p.m. only.',ts:t-150*DAY},
      {id:'c7',name:'Sofia Marchetti',company:'',phone:'(512) 555-0177',email:'sofia.m@example.com',tag:'Homeowner',address:'902 Juniper Ct',notes:'',ts:t-12*DAY},
      {id:'c8',name:'Dr. Lena Brooks',company:'Greenway Pediatrics',phone:'(512) 555-0188',email:'admin@greenwaypeds.example',tag:'Commercial',address:'15 Clinic Row',notes:'Work must avoid patient hours, 9 to 5.',ts:t-200*DAY},
      {id:'c9',name:'Derek Mills',company:'',phone:'(512) 555-0187',email:'',tag:'New lead',address:'Westlake area',notes:'',ts:t-50*MIN}
    ],
    jobs:[
      {id:'j1',customerId:'c1',title:'Furnace tune-up',techId:'t1',start:8,dur:1.5,status:'done',price:189,ts:t-3*DAY},
      {id:'j2',customerId:'c2',title:'Rooftop unit not cooling',techId:'t1',start:10,dur:2,status:'on site',price:640,ts:t-1*DAY},
      {id:'j9',customerId:'c2',title:'Quarterly filter swap',techId:'t1',start:14,dur:1,status:'scheduled',price:220,ts:t-20*DAY},
      {id:'j3',customerId:'c4',title:'Dock lighting retrofit',techId:'t2',start:9,dur:4,status:'en route',price:3400,ts:t-6*DAY},
      {id:'j6',customerId:'c8',title:'Panel inspection',techId:'t2',start:17,dur:1.5,status:'scheduled',price:310,ts:t-4*DAY},
      {id:'j4',customerId:'c6',title:'Grease trap backup',techId:'t3',start:7,dur:2,status:'done',price:420,ts:t-1*DAY},
      {id:'j5',customerId:'c7',title:'Water heater install',techId:'t4',start:12,dur:3,status:'scheduled',price:1850,ts:t-5*DAY},
      {id:'j7',customerId:'c3',title:'Leaking shower valve',techId:null,start:null,pref:13,dur:1.5,status:'scheduled',price:275,ts:t-35*MIN},
      {id:'j8',customerId:'c5',title:'Thermostat won’t connect to Wi-Fi',techId:null,start:null,dur:1,status:'scheduled',price:145,ts:t-2*H}
    ],
    invoices:[
      {id:'i1',num:'INV-1041',customerId:'c1',items:[{desc:'Furnace tune-up',qty:1,price:189}],status:'paid',paidVia:'card',ts:t-3*DAY,due:t+12*DAY,paidTs:t-2*DAY},
      {id:'i2',num:'INV-1042',customerId:'c2',items:[{desc:'Compressor capacitor',qty:2,price:85},{desc:'Labor (hours)',qty:14,price:155}],status:'sent',ts:t-9*DAY,due:t+5*DAY},
      {id:'i3',num:'INV-1043',customerId:'c4',items:[{desc:'LED high-bay fixtures',qty:16,price:290},{desc:'Install labor',qty:1,price:2160}],status:'sent',ts:t-42*DAY,due:t-12*DAY,reminders:1},
      {id:'i4',num:'INV-1044',customerId:'c6',items:[{desc:'Grease trap pump-out',qty:1,price:420}],status:'paid',paidVia:'ach',ts:t-1*DAY,due:t+14*DAY,paidTs:t-6*H},
      {id:'i5',num:'INV-1045',customerId:'c3',items:[{desc:'Drain clearing',qty:1,price:275}],status:'sent',ts:t-19*DAY,due:t-4*DAY},
      {id:'i6',num:'INV-1046',customerId:'c8',items:[{desc:'Exam room outlets',qty:8,price:120}],status:'draft',ts:t-2*DAY,due:t+28*DAY},
      {id:'i7',num:'INV-1047',customerId:'c5',items:[{desc:'Diagnostic visit',qty:1,price:145}],status:'sent',ts:t-3*DAY,due:t+11*DAY}
    ],
    conversations:[
      {id:'v1',customerId:'c3',channel:'call',handledBy:'ai',unread:true,ts:t-35*MIN,intent:'Leaking shower valve',outcome:'Job request created',jobId:'j7',messages:[
        {from:'customer',text:'Hi, our shower valve is dripping nonstop and the handle is loose.',ts:t-36*MIN},
        {from:'ai',text:'Sorry about that, Rosa. I can send a plumber today. I have 1:00 p.m. or 3:30 p.m. open. Which works better?',ts:t-36*MIN},
        {from:'customer',text:'1:00 is great.',ts:t-35*MIN},
        {from:'ai',text:'You’re set for around 1:00 p.m. at 77 Pecan St. You’ll get a text when the plumber is on the way.',ts:t-35*MIN}]},
      {id:'v5',customerId:'c9',channel:'call',handledBy:'ai',unread:true,ts:t-50*MIN,intent:'Quote: mini-split for a garage office',outcome:'Lead captured',messages:[
        {from:'customer',text:'I want a quote for a mini-split in my garage office. Maybe 400 square feet.',ts:t-51*MIN},
        {from:'ai',text:'Happy to help. Estimates are free and take about 30 minutes on site. Would Thursday morning work?',ts:t-51*MIN},
        {from:'customer',text:'I need to check with my wife. Can someone call me back tomorrow?',ts:t-50*MIN},
        {from:'ai',text:'Of course. I’ve noted a callback for tomorrow. Talk soon, Derek.',ts:t-50*MIN}]},
      {id:'v2',customerId:'c5',channel:'sms',handledBy:'ai',unread:false,ts:t-2*H,intent:'Thermostat won’t connect to Wi-Fi',outcome:'Job request created',jobId:'j8',messages:[
        {from:'customer',text:'My new thermostat keeps dropping off Wi-Fi. Can someone look at it?',ts:t-2*H},
        {from:'ai',text:'Yes. A diagnostic visit is the first step and the tech will confirm pricing on site. Any day this week work?',ts:t-2*H},
        {from:'customer',text:'Anytime today.',ts:t-2*H}]},
      {id:'v3',customerId:'c2',channel:'chat',handledBy:'staff',unread:false,ts:t-5*H,intent:'Unit 2 blowing warm',outcome:'Tech dispatched',messages:[
        {from:'customer',text:'Unit 2 is blowing warm air again in the operatories.',ts:t-6*H},
        {from:'staff',text:'Marisol is on her way and should be there by 10. I’ll text you when she arrives.',ts:t-5*H}]},
      {id:'v4',customerId:'c7',channel:'call',handledBy:'ai',unread:false,ts:t-1*DAY,intent:'Confirm install time',outcome:'Appointment confirmed',messages:[
        {from:'customer',text:'Just confirming the water heater install is still on.',ts:t-1*DAY},
        {from:'ai',text:'It is. Luis and the install crew arrive at noon and expect to take about three hours.',ts:t-1*DAY}]}
    ],
    automations:[
      {id:'a1',trigger:'A job is marked done',actions:['Send the invoice','Text a review request'],enabled:true,runs:214},
      {id:'a2',trigger:'An invoice is 7 days overdue',actions:['Send an SMS reminder','Notify the owner'],enabled:true,runs:58},
      {id:'a3',trigger:'A call is missed',actions:['Text back within 1 minute'],enabled:true,runs:131},
      {id:'a4',trigger:'A website lead comes in',actions:['Create a customer record','Have the Front desk agent qualify the lead','Book an estimate'],enabled:false,runs:0},
      {id:'a5',trigger:'Stock drops below minimum',actions:['Draft a purchase order'],enabled:true,runs:9},
      {id:'a6',trigger:'A payment is received',actions:['Send a receipt'],enabled:true,runs:402}
    ],
    expenses:[
      {id:'e1',vendor:'Ferguson Supply',category:'Parts',amount:612.40,ts:t-1*DAY},
      {id:'e2',vendor:'Shell',category:'Fuel',amount:84.20,ts:t-1*DAY},
      {id:'e3',vendor:'Johnstone Supply',category:'Parts',amount:238.15,ts:t-3*DAY},
      {id:'e4',vendor:'RouteWise GPS',category:'Software',amount:149,ts:t-6*DAY},
      {id:'e5',vendor:'Home Depot',category:'Tools',amount:96.30,ts:t-8*DAY},
      {id:'e6',vendor:'Verizon',category:'Phones',amount:180,ts:t-12*DAY},
      {id:'e7',vendor:'Chevron',category:'Fuel',amount:71.65,ts:t-14*DAY}
    ],
    inventory:[
      {id:'s1',name:'16x25x1 MERV 11 filter',qty:42,min:20,cost:6.5,bin:'Warehouse A2'},
      {id:'s2',name:'R-410A refrigerant, 25 lb',qty:3,min:4,cost:310,bin:'Cage'},
      {id:'s3',name:'Smart thermostat',qty:5,min:4,cost:118,bin:'Warehouse B1'},
      {id:'s4',name:'1/2 in. PEX-A, 100 ft',qty:2,min:3,cost:74,bin:'Van 3'},
      {id:'s5',name:'20A breaker',qty:14,min:10,cost:9.8,bin:'Van 2'},
      {id:'s6',name:'Water heater anode rod',qty:6,min:4,cost:32,bin:'Warehouse C3'}
    ],
    agents:[
      {id:'g1',name:'Front desk',instructions:'Answer calls and texts for Northside Home Services. Get the address, the problem, and a preferred time. Offer the two nearest open slots. Don’t quote prices; say the technician confirms pricing on site.',channels:['Phone','SMS','Web chat'],canBook:true,needsApproval:false,enabled:true,week:86},
      {id:'g2',name:'Collections',instructions:'Follow up on invoices 7 or more days overdue. Keep it short and polite and include the payment link. After two reminders, hand the account to the office.',channels:['SMS','Email'],canBook:false,needsApproval:true,enabled:true,week:14},
      {id:'g3',name:'Estimator',instructions:'Turn technician notes and photos into a line-item estimate using the price book. Flag anything over $2,500 for review.',channels:['Internal'],canBook:false,needsApproval:true,enabled:false,week:0},
      {id:'g4',name:'Review requests',instructions:'After a job is done and paid, ask the customer for a review. Skip anyone with an open complaint.',channels:['SMS'],canBook:false,needsApproval:false,enabled:true,week:31}
    ]
  };
}
/* ---------- mock history generator (deterministic) ---------- */
export function rng(seed){ return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let x = Math.imul(seed ^ seed >>> 15, 1 | seed); x = x + Math.imul(x ^ x >>> 7, 61 | x) ^ x; return ((x ^ x >>> 14) >>> 0) / 4294967296; }; }
export const SERVICES = {
  'Heating & cooling':[['AC repair',380],['Furnace tune-up',189],['Heat pump install',7400],['Duct cleaning',540],['Thermostat install',260],['Refrigerant recharge',420]],
  'Electrical':[['Panel upgrade',2900],['EV charger install',1450],['Outlet repair',180],['Lighting retrofit',1900],['Panel inspection',310],['Ceiling fan install',240]],
  'Plumbing':[['Leak repair',260],['Water heater flush',180],['Drain clearing',275],['Toilet replacement',520],['Garbage disposal install',340],['Sewer camera inspection',395]],
  'Install crew':[['Water heater install',1850],['Mini-split install',4200],['Furnace replacement',5600],['Whole-home surge protector',480]]
};
export const CONV_TEMPLATES = [
  {ch:'call',intent:'AC not cooling',outcome:'Job booked',msgs:[['customer','Our AC stopped cooling overnight and the house is 84 degrees.'],['ai','I’m sorry about that. I can get a technician out tomorrow at 9:00 a.m. Does that work?'],['customer','Yes, please.'],['ai','You’re booked. You’ll get a text when the tech is on the way.']]},
  {ch:'sms',intent:'Reschedule visit',outcome:'Appointment rescheduled',msgs:[['customer','Can we move Thursday’s appointment? Something came up.'],['ai','No problem. I have Friday at 10:00 a.m. or Monday at 2:00 p.m.'],['customer','Monday works.'],['ai','Done. You’re now set for Monday at 2:00 p.m.']]},
  {ch:'chat',intent:'Pricing question',outcome:'Question answered',msgs:[['customer','How much is a water heater flush?'],['ai','The technician confirms pricing on site, and most flushes are a short visit. Want me to book one?'],['customer','Not yet, thanks.']]},
  {ch:'call',intent:'Invoice question',outcome:'Payment confirmed',msgs:[['customer','I got an invoice but I think I already paid it.'],['staff','Thanks for calling. Your payment came through yesterday, so you’re all set. I’ll send a receipt.']]},
  {ch:'sms',intent:'Payment link',outcome:'Payment link sent',msgs:[['customer','Can you resend the link to pay?'],['ai','Here’s your secure payment link. You can pay by card or bank transfer.'],['customer','Paid. Thanks!']]},
  {ch:'call',intent:'Estimate request',outcome:'Estimate booked',msgs:[['customer','We’re thinking about replacing our old furnace. Can someone give us a quote?'],['ai','Estimates are free and take about 30 minutes. I have Wednesday at 11:00 a.m. open.'],['customer','Wednesday is fine.'],['ai','You’re booked for an estimate on Wednesday at 11:00 a.m.']]},
  {ch:'chat',intent:'Weekend service',outcome:'Question answered',msgs:[['customer','Do you do weekend emergency calls?'],['ai','Yes. Call or text anytime on weekends and we’ll send the on-call tech.']]}
];
export function addHistory(db){
  const r = rng(20261022), pick = a => a[Math.floor(r() * a.length)], t = Date.now();
  const FIRST = ['Aaliyah','Brandon','Camila','Daniel','Elena','Frank','Gabriela','Henry','Isabel','Jamal','Karen','Leo','Maya','Nathan','Olivia','Pedro','Quinn','Rachel','Samuel','Tasha','Victor','Wendy','Xavier','Yolanda','Zach','Alicia','Bruno','Chloe','Diego','Erin'];
  const LAST = ['Alvarez','Brennan','Castillo','Dawson','Espinoza','Fischer','Garza','Holloway','Ibarra','Jensen','Kowalski','Lozano','McAllister','Nguyen','Ortega','Patterson','Quintero','Ramsey','Salazar','Thornton','Underhill','Vargas','Whitfield','Yates','Zamora'];
  const STREETS = ['Bluebonnet Ln','Cedar Bend Dr','Riverside Dr','Shoal Creek Blvd','Barton Hills Dr','Mesa Verde Trl','Live Oak St','Sunset Ridge','Windsor Rd','Pflugerville Pkwy','Brodie Ln','Manchaca Rd'];
  const BIZ = ['Lakeline Animal Hospital','Copperleaf Apartments','Hill Country Yoga','Ridgeview Montessori','Torres Auto Body','Summit Physical Therapy','Blue Agave Cantina','Westgate Self Storage','Riverbend Church Offices','Pioneer Print Shop','Oakmont Senior Living'];
  const bizPool = [...BIZ], fresh = [];
  for (let n = 0; n < 36; n++){
    const roll = r(), tag = roll < 0.6 ? 'Homeowner' : roll < 0.88 ? 'Commercial' : 'Service plan';
    const name = `${pick(FIRST)} ${pick(LAST)}`;
    const company = tag === 'Commercial' && bizPool.length ? bizPool.splice(Math.floor(r() * bizPool.length), 1)[0] : '';
    const email = company ? `office@${company.toLowerCase().replace(/[^a-z]+/g, '')}.example` : `${name.toLowerCase().replace(/[^a-z]+/g, '.')}@example.com`;
    fresh.push({id:'h' + n, name, company, phone:`(512) 555-0${200 + n}`, email, tag, address:`${100 + Math.floor(r() * 8900)} ${pick(STREETS)}`, notes:'', ts:t - (200 + Math.floor(r() * 700)) * DAY});
  }
  db.customers.push(...fresh);
  const jobs = [], invs = [];
  db.customers.filter(c => c.tag !== 'New lead').forEach(c => {
    const k = c.tag === 'Commercial' ? 2 + Math.floor(r() * 5) : c.tag === 'Service plan' ? 2 + Math.floor(r() * 3) : 1 + Math.floor(r() * 3);
    for (let i = 0; i < k; i++){
      const tech = pick(db.techs), [title, base] = pick(SERVICES[tech.skill]);
      const price = Math.round(base * (c.tag === 'Commercial' ? 1.5 : 1) * (0.85 + r() * 0.3) / 5) * 5;
      const daysAgo = 2 + Math.floor(r() * 178), ts = t - daysAgo * DAY - Math.floor(r() * 8) * H;
      const j = {id:'hj' + jobs.length, customerId:c.id, title, techId:tech.id, start:7 + Math.floor(r() * 18) / 2, dur:pick([1,1.5,2,3]), status:'done', price, ts, history:true};
      jobs.push(j);
      const terms = c.tag === 'Commercial' ? 30 : 14, u = r();
      const inv = {id:'hi' + invs.length, customerId:c.id, items:[{desc:title, qty:1, price}], ts:ts + 2 * H, due:ts + terms * DAY, jobId:j.id};
      if (daysAgo < terms && u < 0.45) inv.status = 'sent';
      else if (daysAgo >= terms && daysAgo < 75 && u < 0.08){ inv.status = 'sent'; inv.reminders = 1 + Math.floor(r() * 2); }
      else { inv.status = 'paid'; inv.paidVia = (price > 1500 || c.tag === 'Commercial') ? (r() < 0.75 ? 'ach' : 'card') : (r() < 0.8 ? 'card' : 'ach'); inv.paidTs = Math.min(t - H, ts + Math.floor(r() * Math.min(terms, daysAgo)) * DAY + 3 * H); }
      invs.push(inv);
    }
  });
  invs.sort((a, b) => a.ts - b.ts).forEach((inv, i) => { inv.num = 'INV-' + (1041 - invs.length + i); });
  db.jobs.push(...jobs); db.invoices.push(...invs);
  fresh.forEach((c, n) => {
    if (r() < 0.55){
      const tp = pick(CONV_TEMPLATES), ts = t - (2 + Math.floor(r() * 120)) * DAY;
      db.conversations.push({id:'hv' + n, customerId:c.id, channel:tp.ch, handledBy:tp.msgs.some(m => m[0] === 'staff') ? 'staff' : 'ai', unread:false, ts, intent:tp.intent, outcome:tp.outcome, messages:tp.msgs.map(([from, text], i) => ({from, text, ts:ts + i * MIN}))});
    }
  });
  const EXP = [['Ferguson Supply','Parts',120,900],['Johnstone Supply','Parts',80,600],['Graybar','Parts',90,700],['Shell','Fuel',55,110],['Chevron','Fuel',50,105],['Home Depot','Tools',25,320],['Lowe’s','Tools',20,250],['RouteWise GPS','Software',149,149],['Verizon','Phones',180,180],['Whataburger','Meals',18,64],['Valvoline','Vehicle',65,140]];
  for (let n = 0; n < 70; n++){ const [vendor, category, lo, hi] = pick(EXP); db.expenses.push({id:'he' + n, vendor, category, amount:+(lo + r() * (hi - lo)).toFixed(2), ts:t - (1 + Math.floor(r() * 180)) * DAY}); }
  db.expenses.sort((a, b) => b.ts - a.ts);
  db.inventory.push(
    {id:'s7',name:'Condensate pump',qty:4,min:3,cost:68,bin:'Warehouse B2'},
    {id:'s8',name:'45/5 µF run capacitor',qty:11,min:8,cost:14,bin:'Van 1'},
    {id:'s9',name:'Wax ring and bolt kit',qty:9,min:6,cost:7.5,bin:'Van 3'},
    {id:'s10',name:'GFCI outlet, 20A',qty:7,min:12,cost:19,bin:'Van 2'},
    {id:'s11',name:'3/4 in. ball valve',qty:15,min:10,cost:11,bin:'Warehouse C1'},
    {id:'s12',name:'Foil duct tape',qty:1,min:6,cost:13,bin:'Warehouse A1'},
    {id:'s13',name:'Furnace igniter',qty:5,min:4,cost:42,bin:'Van 1'},
    {id:'s14',name:'EV charger, 48A',qty:2,min:2,cost:520,bin:'Cage'}
  );
  return db;
}
export function load(){ try { const s = localStorage.getItem(KEY); if (s) return JSON.parse(s); } catch(e){} return seed(); }
