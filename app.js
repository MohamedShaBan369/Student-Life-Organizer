(()=>{'use strict';
const P='slo:',K={courses:[],tasks:[],lectures:[],exams:[],settings:{name:'Student',sound:true,focus:25,short:5,long:15},pomo:{sessions:0,minutes:0}};
const S={},clone=o=>JSON.parse(JSON.stringify(o));
const load=()=>{for(const k in K){try{const v=JSON.parse(localStorage.getItem(P+k));S[k]=v&&typeof v==='object'&&Array.isArray(v)===Array.isArray(K[k])?(Array.isArray(v)?v:{...K[k],...v}):clone(K[k])}catch{S[k]=clone(K[k])}}};load();
const save=k=>{try{localStorage.setItem(P+k,JSON.stringify(S[k]))}catch{toast('Could not save data','error')}};
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)],V=$('#view');
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,8);
const iso=d=>new Date(d-d.getTimezoneOffset()*6e4).toISOString().slice(0,10);
const DAYS=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],SL={todo:'To Do',progress:'In Progress',done:'Completed'};
const cn=id=>S.courses.find(c=>c.id===id);
const chip=id=>{const c=cn(id);return c?`<span class="chip" style="--c:${esc(c.color)}">${esc(c.name)}</span>`:''};
const empty=(e,t,s)=>`<div class="empty"><b>${e}</b><h3>${t}</h3><p>${s}</p></div>`;
const acts=(k,id)=>`<div class="row-acts"><button class="icon" data-a="edit" data-k="${k}" data-id="${id}" aria-label="Edit">✎</button><button class="icon" data-a="del" data-k="${k}" data-id="${id}" aria-label="Delete">🗑</button></div>`;
/* toast + modal */
function toast(m,t='success'){const e=document.createElement('div');e.className='toast '+t;e.textContent=m;$('#toasts').append(e);setTimeout(()=>{e.classList.add('out');setTimeout(()=>e.remove(),250)},3000)}
let M=null;const closeModal=()=>{if(!M)return;const e=M;M=null;e.classList.add('out');setTimeout(()=>e.remove(),180)};
function modal(title,html){closeModal();const e=document.createElement('div');e.className='backdrop';e.innerHTML=`<div class="modal" role="dialog" aria-modal="true" aria-label="${esc(title)}"><h2>${esc(title)}</h2>${html}</div>`;e.addEventListener('click',x=>{if(x.target===e||x.target.closest('[data-x]'))closeModal()});$('#modalRoot').append(e);M=e;e.querySelector('input,select,textarea,button')?.focus();return e}
document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeModal();$('#side').classList.remove('open');$('#scrim').classList.remove('open')}});
const ask=msg=>new Promise(r=>{const m=modal('Are you sure?',`<p class="muted">${esc(msg)}</p><div class="acts"><button class="btn" data-x>Cancel</button> <button class="btn dng" data-ok>Delete</button></div>`);$('[data-ok]',m).onclick=()=>{closeModal();r(true)};m.addEventListener('click',e=>{if(e.target===m||e.target.closest('[data-x]'))r(false)})});
/* forms */
const co=b=>(b?[['','— None —']]:[]).concat(S.courses.map(c=>[c.id,c.name]));
const F={courses:()=>[{k:'name',l:'Course name *'},{k:'code',l:'Course code'},{k:'instructor',l:'Instructor'},{k:'color',l:'Color',t:'color'},{k:'description',l:'Description',t:'textarea'}],
tasks:()=>[{k:'title',l:'Title *'},{k:'description',l:'Description',t:'textarea'},{k:'courseId',l:'Course',t:'select',o:co(1)},{k:'due',l:'Due date *',t:'date'},{k:'priority',l:'Priority',t:'select',o:[['high','High'],['medium','Medium'],['low','Low']]},{k:'status',l:'Status',t:'select',o:Object.entries(SL)}],
lectures:()=>[{k:'title',l:'Lecture title *'},{k:'courseId',l:'Course',t:'select',o:co(1)},{k:'day',l:'Day',t:'select',o:DAYS.map((d,i)=>[i,d])},{k:'start',l:'Start time *',t:'time'},{k:'end',l:'End time *',t:'time'},{k:'location',l:'Location'}],
exams:()=>[{k:'name',l:'Exam name *'},{k:'courseId',l:'Course',t:'select',o:co(1)},{k:'date',l:'Date *',t:'date'},{k:'time',l:'Time',t:'time'},{k:'location',l:'Location'},{k:'notes',l:'Notes',t:'textarea'}]};
const DEF={courses:{color:'#8B5CF6'},tasks:{priority:'medium',status:'todo'},lectures:{day:1},exams:{time:'09:00'}};
const bad=d=>!d||isNaN(new Date(d));
const VAL={courses:v=>v.name?'':'Course name is required.',
tasks:v=>!v.title?'Task title is required.':bad(v.due)?'Enter a valid due date.':v.courseId&&!cn(v.courseId)?'That course no longer exists.':'',
lectures:v=>!v.title?'Lecture title is required.':!v.start||!v.end?'Start and end times are required.':v.end<=v.start?'End time must be later than start time.':'',
exams:v=>!v.name?'Exam name is required.':bad(v.date)?'Enter a valid exam date.':''};
const LBL={courses:'Course',tasks:'Task',lectures:'Lecture',exams:'Exam'};
function edit(kind,id){
 const cur=id&&S[kind].find(x=>x.id===id),vals={...DEF[kind],...(kind==='tasks'&&!cur?{due:iso(new Date())}:{}),...cur};
 const body=F[kind]().map(f=>`<label class="f">${f.l}${f.t==='select'?`<select name="${f.k}">${f.o.map(o=>`<option value="${esc(o[0])}"${String(o[0])===String(vals[f.k]??'')?' selected':''}>${esc(o[1])}</option>`).join('')}</select>`:f.t==='textarea'?`<textarea name="${f.k}" rows="3">${esc(vals[f.k])}</textarea>`:`<input name="${f.k}" type="${f.t||'text'}" value="${esc(vals[f.k])}">`}</label>`).join('');
 const m=modal((cur?'Edit ':'Add ')+LBL[kind].toLowerCase(),`<form novalidate>${body}<p class="err" role="alert"></p><div class="acts"><button type="button" class="btn" data-x>Cancel</button> <button class="btn pri">Save</button></div></form>`);
 $('form',m).onsubmit=e=>{e.preventDefault();const v=Object.fromEntries(new FormData(e.target));for(const k in v)v[k]=v[k].trim();if(kind==='lectures')v.day=+v.day;
  const er=VAL[kind](v);if(er){$('.err',m).textContent=er;return}
  const rec=cur||{id:uid(),created:iso(new Date())};Object.assign(rec,v);
  if(kind==='tasks'){if(v.status==='done'){rec.doneAt=rec.doneAt||iso(new Date())}else delete rec.doneAt}
  if(!cur)S[kind].push(rec);save(kind);closeModal();toast(LBL[kind]+(cur?' updated':' added'));
  if(kind==='lectures'&&S.lectures.some(o=>o.id!==rec.id&&o.day===rec.day&&o.start<rec.end&&rec.start<o.end))toast('Warning: this lecture overlaps another one.','warning');
  render()}}
async function del(kind,id){const extra=kind==='courses'?' Its tasks, lectures and exams will be deleted too.':'';if(!await ask('Delete this '+LBL[kind].toLowerCase()+'?'+extra))return;
 if(kind==='courses')['tasks','lectures','exams'].forEach(k=>{S[k]=S[k].filter(x=>x.courseId!==id);save(k)});
 S[kind]=S[kind].filter(x=>x.id!==id);save(kind);toast(LBL[kind]+' deleted','warning');render()}
function toggle(id,on){const t=S.tasks.find(x=>x.id===id);if(!t)return;t.status=on?'done':'todo';on?t.doneAt=iso(new Date()):delete t.doneAt;save('tasks');toast(on?'Task completed':'Task reopened');render()}
/* pages */
const Q={c:'',t:'',ts:'',tc:'',so:'due'};
function pageCourses(){
 V.innerHTML=`<div class="bar"><input id="q" type="search" placeholder="Search courses…" aria-label="Search courses" value="${esc(Q.c)}"><button class="btn pri" data-a="add" data-k="courses">+ Add course</button></div><div id="list" class="grid"></div>`;
 const draw=()=>{const q=Q.c.toLowerCase(),l=S.courses.filter(c=>[c.name,c.code,c.instructor].join(' ').toLowerCase().includes(q));
  $('#list').innerHTML=l.length?l.map(c=>{const t=S.tasks.filter(x=>x.courseId===c.id),d=t.filter(x=>x.status==='done').length,p=t.length?Math.round(d/t.length*100):0;
  return`<article class="card" style="--c:${esc(c.color)}"><span class="stripe"></span><h3>${esc(c.name)}</h3><p class="muted">${esc(c.code)}${c.code&&c.instructor?' · ':''}${esc(c.instructor)}</p><p class="sm">${esc(c.description)}</p><div class="prog" role="progressbar" aria-valuenow="${p}" aria-valuemin="0" aria-valuemax="100"><i style="width:${p}%"></i></div><p class="muted sm">${d}/${t.length} tasks done · ${p}%</p>${acts('courses',c.id)}</article>`}).join(''):empty('📚',S.courses.length?'No matches':'No courses yet',S.courses.length?'Try a different search.':'Add your first course to start tracking work.')};
 $('#q').oninput=e=>{Q.c=e.target.value;draw()};draw()}
const taskRow=t=>{const od=t.status!=='done'&&t.due<iso(new Date());return`<div class="row${t.status==='done'?' done':''}"><input type="checkbox" data-chk="${t.id}" ${t.status==='done'?'checked':''} aria-label="Complete ${esc(t.title)}"><div class="grow"><b>${esc(t.title)}</b><div class="meta">${chip(t.courseId)}<span class="muted sm">Due ${esc(t.due)}</span><span class="badge p-${t.priority}">${t.priority}</span><span class="badge s-${t.status}">${SL[t.status]}</span>${od?'<span class="badge od">Overdue</span>':''}</div></div>${acts('tasks',t.id)}</div>`};
function pageTasks(){
 const sel=(k,o)=>`<select id="${k}" aria-label="${k}">${o.map(x=>`<option value="${x[0]}"${Q[k]===x[0]?' selected':''}>${x[1]}</option>`).join('')}</select>`;
 V.innerHTML=`<div class="bar"><input id="tq" type="search" placeholder="Search tasks…" aria-label="Search tasks" value="${esc(Q.t)}">${sel('ts',[['','All status'],...Object.entries(SL)])}${sel('tc',[['','All courses'],...co()])}${sel('so',[['due','Sort: deadline'],['pri','Sort: priority']])}<button class="btn pri" data-a="add" data-k="tasks">+ Add task</button></div><div id="list"></div>`;
 const PR={high:0,medium:1,low:2},draw=()=>{const q=Q.t.toLowerCase();let l=S.tasks.filter(t=>(t.title+t.description).toLowerCase().includes(q)&&(!Q.ts||t.status===Q.ts)&&(!Q.tc||t.courseId===Q.tc));
  l.sort((a,b)=>Q.so==='pri'?PR[a.priority]-PR[b.priority]||a.due.localeCompare(b.due):a.due.localeCompare(b.due));
  $('#list').innerHTML=l.length?l.map(taskRow).join(''):empty('✅',S.tasks.length?'No matching tasks':'No tasks yet',S.tasks.length?'Change the filters.':'Add a task to plan your week.')};
 $('#tq').oninput=e=>{Q.t=e.target.value;draw()};['ts','tc','so'].forEach(k=>$('#'+k).onchange=e=>{Q[k]=e.target.value;draw()});draw()}
function pageSchedule(){
 const order=[1,2,3,4,5,6,0];
 V.innerHTML=`<div class="bar"><button class="btn pri" data-a="add" data-k="lectures">+ Add lecture</button></div>`+(S.lectures.length?'':empty('🗓️','No lectures yet','Add lectures to build your weekly timetable.'))+`<div class="week">${order.map(d=>{const l=S.lectures.filter(x=>x.day===d).sort((a,b)=>a.start.localeCompare(b.start));
  return`<section class="day"><h3>${DAYS[d]}</h3>${l.length?l.map(x=>{const c=cn(x.courseId),cf=l.some(o=>o.id!==x.id&&o.start<x.end&&x.start<o.end);return`<div class="lec${cf?' conf':''}" style="--c:${esc(c?c.color:'#8B5CF6')}"><b>${esc(x.title)}</b><div class="muted">${x.start}–${x.end}${x.location?' · '+esc(x.location):''}</div>${cf?'<div style="color:var(--wn)">⚠ Time conflict</div>':''}${c?chip(c.id):''}${acts('lectures',x.id)}</div>`}).join(''):'<p class="muted sm">Free day</p>'}</section>`}).join('')}</div>`}
const cdTxt=ts=>{const d=ts-Date.now();if(d<=0)return'Finished';const m=Math.floor(d/6e4);return`${Math.floor(m/1440)}d ${Math.floor(m%1440/60)}h ${m%60}m`};
const exTs=e=>+new Date(`${e.date}T${e.time||'00:00'}`);
const T=[];
function pageExams(){
 const l=[...S.exams].sort((a,b)=>exTs(a)-exTs(b));
 V.innerHTML=`<div class="bar"><button class="btn pri" data-a="add" data-k="exams">+ Add exam</button></div><div class="grid">${l.length?l.map(e=>`<article class="card"><h3>${esc(e.name)}</h3><div class="meta">${chip(e.courseId)}</div><p class="muted sm">${esc(e.date)} ${esc(e.time)}${e.location?' · '+esc(e.location):''}</p><p class="cd" data-t="${exTs(e)}">${cdTxt(exTs(e))}</p><p class="sm">${esc(e.notes)}</p>${acts('exams',e.id)}</article>`).join(''):empty('📝','No exams yet','Add an exam to start a live countdown.')}</div>`;
 const up=()=>$$('.cd').forEach(e=>{e.textContent=cdTxt(+e.dataset.t);e.classList.toggle('fin',+e.dataset.t<=Date.now())});up();T.push(setInterval(up,1000))}
/* pomodoro */
const PM={mode:'focus',total:0,left:0,end:0,run:false};
const pmSet=m=>{PM.mode=m;PM.run=false;PM.total=PM.left=S.settings[m]*60};pmSet('focus');
const pmLeft=()=>PM.run?Math.max(0,Math.round((PM.end-Date.now())/1000)):PM.left;
const fmt=s=>String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0'),C=2*Math.PI*105;
function beep(){if(!S.settings.sound)return;try{const a=new AudioContext(),o=a.createOscillator(),g=a.createGain();o.connect(g);g.connect(a.destination);o.frequency.value=660;g.gain.setValueAtTime(.2,a.currentTime);g.gain.exponentialRampToValueAtTime(.001,a.currentTime+.8);o.start();o.stop(a.currentTime+.8)}catch{}}
function pmDraw(){const l=pmLeft(),t=$('#pt');if(t){t.textContent=fmt(l);$('#pr').style.strokeDashoffset=C*(l/PM.total)}document.title=PM.run?fmt(l)+' · Focus':document.title.replace(/^\d\d:\d\d · /,'')}
setInterval(()=>{if(!PM.run)return;if(pmLeft()<=0){const was=PM.mode;if(was==='focus'){S.pomo.sessions++;S.pomo.minutes+=S.settings.focus;save('pomo')}const long=was==='focus'&&S.pomo.sessions%4===0;beep();
 toast(was==='focus'?(long?'Four sessions done! Time for a long break.':'Focus session complete. Take a short break.'):'Break over. Ready to focus?');pmSet(was==='focus'?(long?'long':'short'):'focus');if(location.hash==='#/pomodoro')render();return}pmDraw()},250);
function pagePomo(){
 const lb=PM.run?'Pause':PM.left<PM.total?'Resume':'Start';
 V.innerHTML=`<div class="card focus"><div class="tabs">${[['focus','Focus'],['short','Short break'],['long','Long break']].map(([m,n])=>`<button class="btn${PM.mode===m?' on':''}" data-a="pmode" data-m="${m}">${n}</button>`).join('')}</div>
 <div class="ring"><svg width="240" height="240" viewBox="0 0 240 240"><circle class="bg" cx="120" cy="120" r="105"/><circle class="fg" id="pr" cx="120" cy="120" r="105" stroke-dasharray="${C}" style="stroke-dashoffset:${C*(pmLeft()/PM.total)}"/></svg><b id="pt" role="timer">${fmt(pmLeft())}</b></div>
 <div class="tabs"><button class="btn pri" data-a="ptoggle">${lb}</button><button class="btn" data-a="preset">Reset</button></div>
 <p class="muted">Sessions completed: <b>${S.pomo.sessions}</b> · Total study time: <b>${S.pomo.minutes} min</b></p>
 <div class="durs">${[['focus','Focus (min)'],['short','Short break'],['long','Long break']].map(([k,n])=>`<label>${n}<input type="number" min="1" max="180" data-d="${k}" value="${S.settings[k]}"></label>`).join('')}</div></div>`}
/* settings */
function pageSettings(){const s=S.settings;
 V.innerHTML=`<form class="card" id="sf" style="max-width:560px" novalidate><label class="f">Display name<input name="name" value="${esc(s.name)}" maxlength="40"></label>
 <div class="durs" style="justify-content:flex-start">${['focus','short','long'].map(k=>`<label>${k} (min)<input type="number" name="${k}" min="1" max="180" value="${s[k]}"></label>`).join('')}</div>
 <label class="f" style="grid-auto-flow:column;justify-content:start;align-items:center;gap:10px;margin-top:14px"><input type="checkbox" name="sound" ${s.sound?'checked':''}>Sound effects</label><p class="err" role="alert"></p><button class="btn pri">Save settings</button></form>
 <div class="card" style="max-width:560px;margin-top:16px"><h3>Your data</h3><p class="muted sm">Everything is stored in this browser. Export a backup before clearing.</p><div class="bar" style="margin:12px 0 0"><button class="btn" data-a="export">Export JSON</button><button class="btn" data-a="import">Import JSON</button><button class="btn dng" data-a="clear">Clear all data</button><input type="file" id="imp" accept=".json,application/json" hidden></div></div>`;
 $('#sf').onsubmit=e=>{e.preventDefault();const f=new FormData(e.target),n=['focus','short','long'].map(k=>+f.get(k));if(n.some(x=>!(x>=1&&x<=180))){$('.err').textContent='Durations must be between 1 and 180 minutes.';return}
  Object.assign(S.settings,{name:(f.get('name')||'').trim()||'Student',focus:n[0],short:n[1],long:n[2],sound:f.has('sound')});save('settings');if(!PM.run)pmSet(PM.mode);av();toast('Settings saved')}}
/* dashboard */
const QUOTES=['Small steps every day add up.','Start with the hardest task first.','Focus beats cramming.','Done is better than perfect.','Rest is part of studying.'];
function pageDash(){
 const now=new Date(),td=iso(now),t=S.tasks,hm=now.toTimeString().slice(0,5),h=now.getHours();
 const ex=S.exams.map(e=>({...e,ts:exTs(e)})).filter(e=>e.ts>Date.now()).sort((a,b)=>a.ts-b.ts);
 const today=t.filter(x=>x.status!=='done'&&x.due<=td).sort((a,b)=>a.due.localeCompare(b.due));
 const cls=S.lectures.map(l=>({...l,off:(l.day-now.getDay()+7)%7})).map(l=>l.off===0&&l.end<=hm?{...l,off:7}:l).sort((a,b)=>a.off-b.off||a.start.localeCompare(b.start)).slice(0,4);
 const days=[...Array(7)].map((_,i)=>{const d=new Date(now);d.setDate(d.getDate()-6+i);return[d.toLocaleDateString('en',{weekday:'short'}),t.filter(x=>x.doneAt===iso(d)).length]},0),mx=Math.max(1,...days.map(d=>d[1]));
 const st=[['Total tasks',t.length],['Completed',t.filter(x=>x.status==='done').length],['Upcoming exams',ex.length],['Study hours',+(S.pomo.minutes/60).toFixed(1)]];
 V.innerHTML=`<h2>${h<12?'Good morning':h<18?'Good afternoon':'Good evening'}, ${esc(S.settings.name)}</h2><p class="muted">${now.toLocaleDateString('en',{weekday:'long',year:'numeric',month:'long',day:'numeric'})} · ${QUOTES[now.getDate()%QUOTES.length]}</p>
 <div class="stats">${st.map(s=>`<div class="card stat"><span class="muted">${s[0]}</span><b class="cnt" data-n="${s[1]}">0</b></div>`).join('')}</div>
 <div class="two"><section class="card"><h3>Due today & overdue</h3><div style="margin-top:12px">${today.length?today.map(taskRow).join(''):empty('🎉','All clear','Nothing due today.')}</div></section>
 <section class="card"><h3>Upcoming classes</h3><div style="margin-top:12px">${cls.length?cls.map(l=>`<div class="lec" style="--c:${esc(cn(l.courseId)?.color||'#8B5CF6')}"><b>${esc(l.title)}</b> ${chip(l.courseId)}<div class="muted">${l.off===0?'Today':DAYS[l.day]} · ${l.start}–${l.end}${l.location?' · '+esc(l.location):''}</div></div>`).join(''):empty('🗓️','No classes','Add lectures in the schedule.')}</div></section></div>
 <div class="two"><section class="card"><h3>Completed tasks, last 7 days</h3><div class="chart">${days.map(d=>`<div><span>${d[1]}</span><i style="height:${d[1]/mx*100}%"></i><span class="muted">${d[0]}</span></div>`).join('')}</div></section>
 <section class="card"><h3>Next exams</h3><div style="margin-top:12px">${ex.length?ex.slice(0,3).map(e=>`<div class="row"><div class="grow"><b>${esc(e.name)}</b><div class="muted sm">${esc(e.date)} ${esc(e.time)}</div></div><span class="cd" data-t="${e.ts}">${cdTxt(e.ts)}</span></div>`).join(''):empty('📝','No upcoming exams','Add an exam to see it here.')}</div></section></div>`;
 const rm=matchMedia('(prefers-reduced-motion:reduce)').matches;$$('.cnt').forEach(e=>{const n=+e.dataset.n,s=performance.now(),f=x=>{const p=rm?1:Math.min(1,(x-s)/600);e.textContent=+(n*p).toFixed(n%1?1:0);if(p<1)requestAnimationFrame(f)};requestAnimationFrame(f)});
 const up=()=>$$('.cd').forEach(e=>e.textContent=cdTxt(+e.dataset.t));T.push(setInterval(up,30000))}
/* actions */
const ACT={add:b=>edit(b.dataset.k),edit:b=>edit(b.dataset.k,b.dataset.id),del:b=>del(b.dataset.k,b.dataset.id),
 pmode:b=>{pmSet(b.dataset.m);render()},preset:()=>{pmSet(PM.mode);render()},
 ptoggle:()=>{if(PM.run){PM.left=pmLeft();PM.run=false}else{PM.end=Date.now()+PM.left*1000;PM.run=true}render()},
 export:()=>{const o=Object.fromEntries(Object.keys(K).map(k=>[k,S[k]])),a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(o,null,2)],{type:'application/json'}));a.download='student-life-backup.json';a.click();URL.revokeObjectURL(a.href);toast('Backup downloaded')},
 import:()=>$('#imp').click(),
 clear:async()=>{if(!await ask('This permanently removes all courses, tasks, lectures, exams and settings.'))return;Object.keys(K).forEach(k=>localStorage.removeItem(P+k));load();pmSet('focus');av();toast('All data cleared','warning');render()}};
V.addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(b)ACT[b.dataset.a]?.(b)});
V.addEventListener('change',e=>{const t=e.target;
 if(t.dataset.chk)toggle(t.dataset.chk,t.checked);
 else if(t.dataset.d){const v=Math.min(180,Math.max(1,Math.round(+t.value)||S.settings[t.dataset.d]));S.settings[t.dataset.d]=v;save('settings');if(!PM.run&&PM.mode===t.dataset.d)pmSet(t.dataset.d);render()}
 else if(t.id==='imp'&&t.files[0]){const r=new FileReader();r.onload=()=>{try{const o=JSON.parse(r.result);if(!o||typeof o!=='object'||Array.isArray(o))throw 0;let n=0;for(const k in K)if(k in o&&typeof o[k]==='object'&&o[k]!==null&&Array.isArray(o[k])===Array.isArray(K[k])){S[k]=o[k];save(k);n++}if(!n)throw 0;pmSet('focus');av();toast('Data imported');render()}catch{toast('Invalid backup file','error')}};r.readAsText(t.files[0])}});
/* router + bootstrap */
const R=[['dashboard','Dashboard','layout-dashboard',pageDash],['courses','My Courses','book-open',pageCourses],['tasks','Tasks','check-square',pageTasks],['schedule','Weekly Schedule','calendar-days',pageSchedule],['exams','Exams','file-pen-line',pageExams],['pomodoro','Focus Room','timer',pagePomo],['settings','Settings','settings',pageSettings]];
const av=()=>{$('#av').textContent=(S.settings.name||'S').trim().charAt(0).toUpperCase()};
function render(anim){const r=R.find(x=>x[0]===location.hash.slice(2))||R[0];T.forEach(clearInterval);T.length=0;
 $$('#nav a').forEach(a=>{const on=a.dataset.r===r[0];a.classList.toggle('active',on);on?a.setAttribute('aria-current','page'):a.removeAttribute('aria-current')});
 $('#pageTitle').textContent=r[1];if(!PM.run)document.title=r[1]+' · Student Life Organizer';
 if(anim===1){V.classList.remove('in');void V.offsetWidth;V.classList.add('in');scrollTo(0,0)}
 try{r[3]()}catch(e){console.error(e);V.innerHTML=empty('⚠️','Something went wrong','Reload the page and try again.')}
 window.lucide&&lucide.createIcons()}
$('#nav').innerHTML=R.map(r=>`<a href="#/${r[0]}" data-r="${r[0]}"><i data-lucide="${r[2]}"></i><span>${r[1]}</span></a>`).join('');
const drawer=o=>{$('#side').classList.toggle('open',o);$('#scrim').classList.toggle('open',o)};
$('#menu').onclick=()=>drawer(!$('#side').classList.contains('open'));$('#scrim').onclick=()=>drawer(false);$('#nav').onclick=e=>{if(e.target.closest('a'))drawer(false)};
$('#quickAdd').onclick=()=>{const m=modal('Quick add','<div class="qa">'+[['tasks','New task'],['courses','New course'],['lectures','New lecture'],['exams','New exam']].map(([k,l])=>`<button class="btn" data-k="${k}">${l}</button>`).join('')+'</div>');$$('[data-k]',m).forEach(b=>b.onclick=()=>edit(b.dataset.k))};
addEventListener('hashchange',()=>render(1));window.addEventListener('error',()=>toast('Unexpected error. Check the console.','error'));
av();render(1);
})();