(()=>{'use strict';
const USERS=[{id:'napa',name:'นภา ยุบุญเสิศ',dept:'hr',role:'staff',position:'เจ้าหน้าที่ทรัพยากรมนุษย์'},{id:'supaporn',name:'สุภาพร ทิฐิกัจจธรรม',dept:'hr',role:'head',position:'หัวหน้ากลุ่มงานทรัพยากรมนุษย์'},{id:'kanokwan',name:'กนกวรรณ ตรีธัญญา',dept:'fin',role:'staff',position:'เจ้าหน้าที่การคลังและพัสดุ'},{id:'jantima',name:'จันทิมา ภูมิรุจา',dept:'fin',role:'head',position:'หัวหน้ากลุ่มงานการคลังและพัสดุ'},{id:'pannathipa',name:'พรรณทิพา ดีเสนาะ',dept:'admin',role:'secretary',position:'เลขานุการคณะ'}];
const DEPT={hr:'กลุ่มงานทรัพยากรมนุษย์',fin:'กลุ่มงานการคลังและพัสดุ',admin:'สำนักงานเลขานุการคณะ'};
const WF={'ค่าตอบแทนเพื่อเพิ่มประสิทธิภาพ':['ตรวจสอบข้อมูล','จัดทำบันทึก','เสนอผู้บริหาร','เสนอหัวหน้างานการคลังและพัสดุ','เสนอหัวหน้างานงบประมาณและแผนงาน','อนุมัติ','ส่งแจ้งผู้เกี่ยวข้อง'], 'ต่ออายุงาน':['แจ้งหลักเกณฑ์','กรอกเอกสารและเตรียมผลงาน','ตรวจสอบคุณสมบัติและผลงาน','เสนอพิจารณา','ขออนุมัติ','แจ้งผล','อัปเดตระบบ','ติดตามความก้าวหน้า'],'ค่าดอกเบี้ยบ้าน':['รับใบเสร็จ','ตรวจสอบรายละเอียดในใบเสร็จ','เสนอพิจารณา','ผ่านหัวหน้ากลุ่มงาน','ผ่านเลขานุการคณะ','ส่งงานการเงินคณะ']};
const KEY='tu_arts_dashboard_v5',SESSION='tu_arts_dashboard_session';const $=s=>document.querySelector(s);const $$=s=>[...document.querySelectorAll(s)];const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));const iso=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;const today=()=>iso(new Date());const date=d=>new Date(d+'T12:00:00');const dateThai=s=>s?new Intl.DateTimeFormat('th-TH',{day:'numeric',month:'short',year:'numeric'}).format(date(s)):'—';const monthThai=d=>new Intl.DateTimeFormat('th-TH',{month:'long',year:'numeric'}).format(d);const monthNames=['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'];const name=id=>USERS.find(u=>u.id===id)?.name||'ไม่ระบุ';const account=id=>USERS.find(u=>u.id===id);const rnd=()=>globalThis.crypto?.randomUUID?.()||`${Date.now()}-${Math.random()}`;
let db;let storageProblem='';try{const raw=localStorage.getItem(KEY);db=raw===null?seed():JSON.parse(raw);if(!db||!Array.isArray(db.tasks)||!Array.isArray(db.leaves))throw new Error('รูปแบบข้อมูลที่บันทึกไว้ไม่ถูกต้อง');if(raw===null)localStorage.setItem(KEY,JSON.stringify(db));}catch(error){storageProblem=error.message;db={tasks:[],leaves:[]};}let me=account((()=>{try{return localStorage.getItem(SESSION)}catch{return null}})()),page='tasks',tab='work',cardFilter='all',selectedMonth=null,selectedPerson=null,selectedProcess=null,calView=new Date(),calMode='month',calKind='task',sortDesc=true;
function seed(){
  const tasks=[],leaves=[],processes=Object.keys(WF);
  const titles=['จัดทำรายงานประจำเดือน','ตรวจสอบเอกสารบุคลากร','ติดตามการอนุมัติ','รวบรวมข้อมูลประกอบการพิจารณา','ประสานงานระหว่างหน่วยงาน','จัดทำสรุปผลการดำเนินงาน'];
  // Deterministic, uneven fixture: no future-dated records; preserve realistic seasonal variation.
  const counts=[3,7,4,9,2,6,8,3,10,5,7,4];
  let seq=0;
  for(let m=0;m<12;m++)for(let j=0;j<counts[m];j++){
    const day=2+((j*7+m*3)%22),start=new Date(2026,m,day),due=new Date(2026,m,Math.min(28,day+3+(j%5)));
    if(iso(start)>today())continue;
    const owner=USERS[(m*2+j*3)%4],proc=processes[(j+m*2)%3],finished=iso(due)<today()&&(j+m)%4===0;
    let step=finished?WF[proc].length-1:(j+m)%Math.max(1,WF[proc].length-1);
    const holder=proc===processes[0]&&j%4===0?'jantima':owner.id;
    if(holder!==owner.id&&!finished)step=Math.max(step,3);
    tasks.push({id:rnd(),ownerId:owner.id,holderId:holder,process:proc,title:`${proc} — ${titles[(j+m)%titles.length]} ${m+1}/2569`,description:`ข้อมูลจำลองสำหรับทดสอบกระบวนการ ${proc}`,start:iso(start),due:iso(due),step,completed:finished,history:[]});seq++;
  }
  const leaveCounts=[2,4,1,5,3,2,6,2,4,3,5,2];
  for(let m=0;m<12;m++)for(let j=0;j<leaveCounts[m];j++){
    const owner=USERS[(j+m)%4],d=iso(new Date(2026,m,3+((j*6+m)%23)));
    if(d>today())continue;
    const status=['อนุมัติแล้ว','อนุมัติแล้ว','รออนุมัติ','ไม่อนุมัติ'][(m+j)%4];
    leaves.push({id:rnd(),ownerId:owner.id,approverId:owner.role==='head'?'pannathipa':owner.dept==='hr'?'supaporn':'jantima',date:d,type:j%2?'ลาป่วย':'ลากิจส่วนตัว',start:j%3===0?'13:00':'09:00',end:j%3===0?'14:00':'10:30',minutes:j%3===0?60:90,reason:'ข้อมูลจำลองเพื่อทดสอบระบบ',phone:'0000000000',status});
  }
  return{tasks,leaves};
}
function upgradeOldFixture(){
  // Only replace the exact uniform sample fixture from Revision 4; never overwrite user-created records.
  if(db.tasks.length!==60||db.leaves.length!==48)return;
  if(!db.tasks.every(t=>t.description===`ข้อมูลจำลองสำหรับการทดสอบกระบวนการ ${t.process}`))return;
  if(!db.leaves.every(l=>l.reason==='ข้อมูลจำลองเพื่อทดสอบระบบ'))return;
  db=seed();try{localStorage.setItem(KEY,JSON.stringify(db));}catch(e){storageProblem=e.message;}
}
upgradeOldFixture();



/* Revision 4: UI, scoped calendars and consistent filters. No storage reset. */
const dateMonths = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
const weekdayNames = ['อาทิตย์','จันทร์','อังคาร','พุธ','พฤหัสบดี','ศุกร์','เสาร์'];
const fieldsByView = Object.create(null);
let sidebarCollapsed = false;
let mobileOpen = false;
let calendarScope = 'personal';
const calendarStates = {
  task: { view: new Date(), mode: 'month' },
  personal: { view: new Date(), mode: 'month' },
  personnel: { view: new Date(), mode: 'month' }
};
const icons = {
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  tasks: '<path d="m3 6 1.5 1.5L7 5M10 6h11M3 12l1.5 1.5L7 11M10 12h11M3 18l1.5 1.5L7 17M10 18h11"/>',
  leave: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18M8 15h8"/>',
  logout: '<path d="M10 4H4v16h6M9 12h12m-4-4 4 4-4 4"/>',
  chevron: '<path d="m9 5 7 7-7 7"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
  reset: '<path d="M3 4v6h6M4 9a8 8 0 1 1-1 6"/>',
  person: '<circle cx="12" cy="8" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/>',
  transfer: '<path d="M3 7h17m-4-4 4 4-4 4M21 17H4m4-4-4 4 4 4"/>',
  check: '<path d="m5 12 4 4 10-10"/>'
};
function icon(key) {
  return `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[key] || icons.tasks}</svg>`;
}
function shortDate(value) {
  if (!value) return '—';
  const d = date(String(value).slice(0, 10));
  return Number.isNaN(d.getTime()) ? '—' : `${d.getDate()} ${dateMonths[d.getMonth()]} ${String(d.getFullYear() + 543).slice(-2)}`;
}
function dateRange(start, end) {
  return `<span class="date-range"><time datetime="${esc(start)}">${shortDate(start)}</time><span> – </span><time datetime="${esc(end)}">${shortDate(end)}</time></span>`;
}
function minutesOf(value) {
  if (!/^\d{2}:\d{2}$/.test(value || '')) return NaN;
  const [h, m] = value.split(':').map(Number);
  return h < 24 && m < 60 ? h * 60 + m : NaN;
}
function durationText(n) {
  n = Number(n) || 0;
  return `${Math.floor(n / 60)} ชั่วโมง ${n % 60} นาที`;
}
function totalTime(n) {
  n = Number(n) || 0;
  return `${Math.floor(n / 480)} วัน ${Math.floor((n % 480) / 60)} ชั่วโมง ${n % 60} นาที`;
}
function save() {
  if (storageProblem) { toast('ยังบันทึกไม่ได้: โปรดสำรองและตรวจสอบข้อมูลเดิม', true); return false; }
  try { localStorage.setItem(KEY, JSON.stringify(db)); return true; }
  catch (e) { toast('บันทึกไม่สำเร็จ: พื้นที่จัดเก็บเต็มหรือเบราว์เซอร์ไม่อนุญาต', true); return false; }
}
function commit(change) {
  const old = JSON.stringify(db);
  change();
  if (save()) return true;
  db = JSON.parse(old);
  return false;
}
function toast(message, error = false) {
  $('.toast')?.remove();
  const el = document.createElement('div');
  el.className = `toast${error ? ' error' : ''}`;
  el.setAttribute('role', error ? 'alert' : 'status');
  el.textContent = message;
  document.body.append(el);
  setTimeout(() => el.remove(), 4500);
}
function options(arr, value = 'all', all = 'ทั้งหมด') {
  return `<option value="all">${all}</option>` + arr.map(([v, t]) => `<option value="${esc(v)}" ${String(v) === String(value) ? 'selected' : ''}>${esc(t)}</option>`).join('');
}
function accessible(t) {
  return Boolean(me && (me.role === 'secretary' || t.ownerId === me.id || t.holderId === me.id || (me.role === 'head' && account(t.ownerId)?.dept === me.dept)));
}
function accessibleLeaves(l) {
  return Boolean(me && (l.ownerId === me.id || (me.role !== 'staff' && l.approverId === me.id)));
}
function personnelLeaves() {
  return me?.role === 'staff' ? [] : db.leaves.filter(l => l.ownerId !== me.id && l.approverId === me.id);
}
function myTasks() {
  return db.tasks.filter(accessible);
}
function state(t) { return t.completed ? 'เสร็จสิ้น' : t.due < today() ? 'เกินกำหนด' : 'กำลังดำเนินการ'; }
function cls(s) {
  return ['เสร็จสิ้น', 'อนุมัติแล้ว'].includes(s) ? 'done' : ['เกินกำหนด','ไม่อนุมัติ'].includes(s) ? 'over' : 'pending';
}
function badge(s) { return `<span class="badge ${cls(s)}">${esc(s)}</span>`; }
function userLabel(id) { const u = account(id); return `${esc(u?.name || '—')}<small class="department-text">${esc(DEPT[u?.dept] || '')}</small>`; }
function crossDept(t) { return account(t.ownerId)?.dept !== account(t.holderId)?.dept; }
function viewKey() { return `${page}/${tab}`; }
function rememberView() {
  const values = {};
  $$('#content input[id], #content select[id]').forEach(el => { values[el.id] = el.value; });
  fieldsByView[viewKey()] = { values, cardFilter, selectedMonth, selectedPerson, selectedProcess };
}
function restoreView() {
  const saved = fieldsByView[viewKey()];
  if (!saved) return;
  Object.entries(saved.values).forEach(([id, value]) => { const el = document.getElementById(id); if (el) el.value = value; });
  cardFilter = saved.cardFilter;
  selectedMonth = saved.selectedMonth;
  selectedPerson = saved.selectedPerson;
  selectedProcess = saved.selectedProcess;
}
function clearSelections() { cardFilter = 'all'; selectedMonth = selectedPerson = selectedProcess = null; }
function resetViewFilters() { delete fieldsByView[viewKey()]; clearSelections(); }

// Custom grouped selector: headings remain black/bold on macOS and Windows.
function login() {
  document.body.className = '';
  const defaultUser = USERS[0];
  document.body.innerHTML = `<main class="login"><section class="login-card" aria-labelledby="login-title">
    <img src="tu-logo.jpg" alt="ตรามหาวิทยาลัยธรรมศาสตร์">
    <h1 id="login-title">ระบบบริหารจัดการ<br>ภาระงานและการลา</h1><p>คณะศิลปศาสตร์ มหาวิทยาลัยธรรมศาสตร์</p>
    <form id="login-form"><label id="account-label">เลือกบัญชีสำหรับทดสอบระบบ</label>
      <input type="hidden" id="login-account" value="${defaultUser.id}">
      <div class="account-picker"><button id="account-picker" class="account-trigger" type="button" role="combobox" aria-labelledby="account-label account-display" aria-haspopup="listbox" aria-controls="account-options" aria-expanded="false"><span id="account-display">${esc(defaultUser.name)}<small>${esc(defaultUser.position)}</small></span>${icon('chevron')}</button>
      <div id="account-options" class="account-options" role="listbox" aria-labelledby="account-label" hidden>
      ${Object.entries(DEPT).map(([dept, label]) => `<section role="group" aria-labelledby="group-${dept}"><h2 id="group-${dept}" class="account-group-title">${esc(label)}</h2>${USERS.filter(u => u.dept === dept).map(u => `<button type="button" role="option" id="account-option-${u.id}" data-account="${u.id}" tabindex="-1" aria-selected="${u.id === defaultUser.id}"><span><strong>${esc(u.name)}</strong><small>${esc(u.position)}</small></span><span class="account-check">${icon('check')}</span></button>`).join('')}</section>`).join('')}
      </div></div><button class="primary login-submit" id="login-btn" type="submit">เข้าสู่ระบบ ${icon('chevron')}</button>
    
  </section></main>`;
  const trigger = $('#account-picker'), list = $('#account-options'), opts = $$('[data-account]');
  function closePicker(returnFocus = false) { list.hidden = true; trigger.setAttribute('aria-expanded', 'false'); if (returnFocus) trigger.focus(); }
  function openPicker() {
    const rect=trigger.getBoundingClientRect(),below=innerHeight-rect.bottom-16,above=rect.top-16;
    const useAbove=below<280&&above>below;
    list.classList.toggle('opens-above',useAbove);
    list.style.maxHeight=`${Math.max(140,Math.min(420,useAbove?above:below))}px`;
    list.hidden=false;trigger.setAttribute('aria-expanded','true');
    opts.find(o=>o.dataset.account===$('#login-account').value)?.focus({preventScroll:true});
    opts.find(o=>o.dataset.account===$('#login-account').value)?.scrollIntoView({block:'nearest'});
  }
  trigger.onclick = () => list.hidden ? openPicker() : closePicker();
  trigger.onkeydown = e => { if (['ArrowDown','ArrowUp'].includes(e.key)) { e.preventDefault(); openPicker(); } };
  opts.forEach((el, i) => {
    el.onclick = () => {
      const u = account(el.dataset.account);
      $('#login-account').value = u.id;
      $('#account-display').innerHTML = `${esc(u.name)}<small>${esc(u.position)}</small>`;
      opts.forEach(o => o.setAttribute('aria-selected', String(o === el)));
      closePicker(true);
    };
    el.onkeydown = e => {
      let next;
      if (e.key === 'ArrowDown') next = (i + 1) % opts.length;
      if (e.key === 'ArrowUp') next = (i + opts.length - 1) % opts.length;
      if (e.key === 'Home') next = 0;
      if (e.key === 'End') next = opts.length - 1;
      if (next !== undefined) { e.preventDefault(); opts[next].focus(); }
      if (e.key === 'Escape') { e.preventDefault(); closePicker(true); }
      if (e.key === 'Tab') closePicker();
    };
  });
  document.onclick = e => { if (!e.target.closest('.account-picker')) closePicker(); };
  $('#login-form').onsubmit = e => {
    e.preventDefault();
    const chosen = account($('#login-account').value);
    if (!chosen) return;
    try { localStorage.setItem(SESSION, chosen.id); } catch { toast('เบราว์เซอร์ไม่อนุญาตจัดเก็บบัญชีทดสอบ', true); return; }
    me = chosen; page = 'tasks'; tab = 'work'; clearSelections();
    Object.keys(fieldsByView).forEach(k => delete fieldsByView[k]);
    document.onclick = null; render();
  };
}
function navigate(nextPage, nextTab) {
  rememberView(); page = nextPage; tab = nextTab; clearSelections(); mobileOpen = false;
  render(); window.scrollTo({top:0, behavior:'auto'});
}
function applySidebar() {
  const small = matchMedia('(max-width: 760px)').matches;
  document.body.classList.toggle('sidebar-collapsed', !small && sidebarCollapsed);
  document.body.classList.toggle('mobile-menu-open', small && mobileOpen);
  $('#sidebar')?.classList.toggle('open', small && mobileOpen);
  $('#overlay')?.classList.toggle('open', small && mobileOpen);
  const expanded = small ? mobileOpen : !sidebarCollapsed;
  $('#menu')?.setAttribute('aria-expanded', String(expanded));
  $('#menu')?.setAttribute('aria-label', expanded ? 'ยุบเมนูด้านข้าง' : 'ขยายเมนูด้านข้าง');
  if ($('#sidebar')) $('#sidebar').inert = !expanded;
}
function render() {
  if (!me) { login(); return; }
  document.body.innerHTML = `<div class="overlay" id="overlay"></div><div class="shell"><aside class="sidebar" id="sidebar" aria-label="เมนูหลัก">
    <div class="brand"><img src="tu-logo.jpg" alt="ตรามหาวิทยาลัยธรรมศาสตร์"><div><strong>มหาวิทยาลัยธรรมศาสตร์</strong><span>คณะศิลปศาสตร์</span></div></div>
    <nav class="side-nav"><button data-page="tasks" class="${page === 'tasks' ? 'active' : ''}" ${page === 'tasks' ? 'aria-current="page"' : ''}>${icon('tasks')}<span>ภาระงาน</span>${icon('chevron')}</button><button data-page="leave" class="${page === 'leave' ? 'active' : ''}" ${page === 'leave' ? 'aria-current="page"' : ''}>${icon('leave')}<span>ระบบการลา</span>${icon('chevron')}</button></nav>
    <div class="side-bottom"><button id="side-logout">${icon('logout')}ออกจากระบบ</button></div></aside>
    <div class="main-shell"><header class="topbar"><button class="hamburger" id="menu" aria-label="ยุบเมนูด้านข้าง" aria-controls="sidebar" aria-expanded="true">${icon('menu')}</button><strong>ระบบบริหารจัดการภาระงานและการลา</strong><div class="user-info"><span>${esc(me.name)}</span><small>${esc(me.position)}</small><button id="top-logout">ออกจากระบบ</button></div></header><main class="content" id="content"></main></div></div><dialog class="dialog" id="modal" aria-label="รายละเอียดรายการ"></dialog>`;
  $$('[data-page]').forEach(b => b.onclick = () => navigate(b.dataset.page, b.dataset.page === 'tasks' ? 'work' : 'request'));
  $('#menu').onclick = () => { if (matchMedia('(max-width: 760px)').matches) mobileOpen = !mobileOpen; else sidebarCollapsed = !sidebarCollapsed; applySidebar(); };
  $('#overlay').onclick = () => { mobileOpen = false; applySidebar(); $('#menu').focus(); };
  $('#side-logout').onclick = $('#top-logout').onclick = () => { localStorage.removeItem(SESSION); me = null; mobileOpen = false; login(); };
  applySidebar();
  if (page === 'tasks') tasksPage(); else leavePage();
  if (storageProblem) { const warning = document.createElement('p'); warning.className = 'storage-warning'; warning.textContent = `ข้อมูลเดิมมีปัญหา: ${storageProblem} ระบบจะไม่เขียนทับข้อมูลเดิม`; $('#content').prepend(warning); }
}
window.addEventListener('resize', () => { if (me) applySidebar(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && mobileOpen) { mobileOpen = false; applySidebar(); $('#menu')?.focus(); } });
function openModal(html) {
  const d = $('#modal');
  d.innerHTML = html;
  d.querySelectorAll('[data-close]').forEach(b => b.onclick = () => d.close());
  if (!d.open) d.showModal();
}
function closeButton() { return `<button type="button" class="icon-button" data-close aria-label="ปิดหน้าต่าง">${icon('close')}</button>`; }
function clearButton(id) { return `<button type="button" id="${id}" class="clear-button">${icon('reset')}ล้างตัวกรอง</button>`; }
function taskFilterHTML() {
  const owners = [...new Set(myTasks().flatMap(t => [t.ownerId,t.holderId]))].map(id => [id,name(id)]);
  return `<section class="panel filters-panel"><div class="filters-heading"><h3>ตัวกรองภาระงาน</h3><label class="scope-filter">แสดงรายการ<select id="f-scope">${options([['mine','งานของฉัน'],['transfer','งานที่รับโอน'],['team','งานบุคลากรในสังกัด']], 'all', 'ทั้งหมด')}</select></label><div class="filter-clear">${clearButton('clear-filters')}</div></div>
    <div class="filters"><label>กระบวนการ<select id="f-process">${options(Object.keys(WF).map(x=>[x,x]))}</select></label><label>สถานะ<select id="f-state">${options(['กำลังดำเนินการ','เสร็จสิ้น','เกินกำหนด'].map(x=>[x,x]))}</select></label><label>ฝ่ายงาน<select id="f-dept">${options(Object.entries(DEPT))}</select></label><label>ผู้รับผิดชอบ<select id="f-owner">${options(owners)}</select></label></div></section>`;
}
function filteredTasks(ignoreStatus = false) {
  const f = id => $('#'+id)?.value || 'all';
  return myTasks().filter(t =>
    (f('f-process') === 'all' || t.process === f('f-process')) &&
    (f('f-dept') === 'all' || account(t.ownerId)?.dept === f('f-dept')) &&
    (f('f-owner') === 'all' || t.ownerId === f('f-owner') || t.holderId === f('f-owner')) &&
    (f('f-scope') === 'all' || (f('f-scope') === 'mine' ? t.ownerId === me.id : f('f-scope') === 'transfer' ? t.holderId === me.id && t.ownerId !== me.id : me.role !== 'staff' && t.ownerId !== me.id && (me.role === 'secretary' || account(t.ownerId)?.dept === me.dept))) &&
    (ignoreStatus || f('f-state') === 'all' || state(t) === f('f-state')) &&
    (ignoreStatus || cardFilter === 'all' || state(t) === cardFilter)
  );
}
function taskRows(list) {
  return list.length ? list.map(t => `<tr><td class="task-title"><strong>${esc(t.title)}</strong><small>${esc(t.process)}</small><small class="task-description">${esc(t.description)}</small></td><td>${userLabel(t.ownerId)}</td><td>${userLabel(t.holderId)}${crossDept(t) ? `<span class="cross-label">${icon('transfer')}ดำเนินงานข้ามฝ่าย</span>` : ''}</td><td>${dateRange(t.start,t.due)}</td><td>${badge(state(t))}<span class="step-caption">ขั้นที่ ${t.step+1}/${WF[t.process]?.length || 0}: ${esc(WF[t.process]?.[t.step] || '—')}</span></td><td><button class="table-action" data-task="${esc(t.id)}">ดูรายละเอียด</button></td></tr>`).join('') : '<tr><td colspan="6" class="empty">ไม่พบภาระงานตามตัวกรองที่เลือก</td></tr>';
}
function taskTable(list) { if (!list.length) return `<div class="empty empty-state">${icon('tasks')}<strong>ไม่พบภาระงานตามตัวกรองที่เลือก</strong><small>${me.role==='secretary'?'ติดตามงานของบุคลากรได้ที่แท็บภาพรวมกลุ่มงาน':'ลองล้างตัวกรองหรือเลือกขอบเขตการแสดงรายการใหม่'}</small></div>`; return `<div class="table-scroll"><table class="task-table"><thead><tr><th>ภาระงาน / กระบวนการ</th><th>ผู้รับผิดชอบหลัก</th><th>ผู้รับผิดชอบปัจจุบัน</th><th>ระยะเวลา</th><th>สถานะ / ขั้นตอน</th><th>รายละเอียด</th></tr></thead><tbody>${taskRows(list)}</tbody></table></div>`; }
function bindTasks() { $$('[data-task]').forEach(b => b.onclick = () => detailTask(b.dataset.task)); }
function taskCards(list) {
  return `<div class="cards">${[['all','ทั้งหมด',list.length],['กำลังดำเนินการ','กำลังดำเนินการ',list.filter(t=>state(t)==='กำลังดำเนินการ').length],['เสร็จสิ้น','เสร็จสิ้น',list.filter(t=>state(t)==='เสร็จสิ้น').length],['เกินกำหนด','เกินกำหนด',list.filter(t=>state(t)==='เกินกำหนด').length]].map(([id,label,n])=>`<button class="card ${cardFilter===id?'active':''}" data-card="${id}" aria-pressed="${cardFilter===id}"><span>${label}</span><strong>${n} งาน</strong></button>`).join('')}</div>`;
}
function tasksPage() {
  if (tab === 'overview' && me.role === 'staff') tab = 'work';
  $('#content').innerHTML = `<nav class="tabs" aria-label="เมนูภาระงาน">${[['work','ภาระงานและ Workflow'],['overview','ภาพรวมกลุ่มงาน'],['calendar','ปฏิทินกำหนดส่งงาน']].filter(([key])=> key !== 'overview' || me.role !== 'staff').map(([key,label])=>`<button data-tab="${key}" class="${tab===key?'active':''}" ${tab===key?'aria-current="page"':''}>${label}</button>`).join('')}</nav><div id="view"></div>`;
  $$('[data-tab]').forEach(b => b.onclick = () => navigate('tasks', b.dataset.tab));
  if (tab === 'work') workView(); else if (tab === 'overview') overviewView(); else calendarView('task');
}
function workView() {
  $('#view').innerHTML = `<div class="toolbar page-heading"><h2>ภาระงาน</h2><button class="primary" id="new-task">＋ บันทึกภาระงานใหม่</button></div><div id="task-filters">${taskFilterHTML()}</div><div id="task-results"></div>`;
  $('#new-task')?.addEventListener('click', newTask);
  restoreView();
  $$('#task-filters select').forEach(s => s.onchange = () => { if (s.id === 'f-state') cardFilter = s.value; updateWork(); });
  $('#clear-filters').onclick = () => { resetViewFilters(); $$('#task-filters select').forEach(s=>s.value='all'); updateWork(); };
  updateWork();
}
function updateWork() {
  const list = filteredTasks();
  $('#task-results').innerHTML = taskCards(filteredTasks(true)) + `<section class="panel"><div class="toolbar"><h3>รายการภาระงาน (${list.length} งาน)</h3><button data-export="tasks">ส่งออก Excel / Word</button></div>${taskTable(list)}</section>`;
  $$('[data-card]').forEach(b => b.onclick = () => { cardFilter = cardFilter === b.dataset.card ? 'all' : b.dataset.card; $('#f-state').value = cardFilter; updateWork(); });
  bindTasks(); $('[data-export]').onclick = () => exportDialog(list,'รายงานภาระงาน'); rememberView();
}
function overviewView() {
  if (me.role === 'staff') return;
  const visiblePeople = [...new Set(db.tasks.filter(accessible).flatMap(t => [t.ownerId,t.holderId]))].map(id=>[id,name(id)]);
  $('#view').innerHTML = `<h2>ภาพรวมภาระงาน</h2><section class="panel filters-panel"><div class="toolbar"><h3>ตัวกรองข้อมูลภาพรวม</h3>${clearButton('ov-clear')}</div><div class="filters">
    <label>ช่วงเวลา<select id="period"><option value="all">ทั้งหมด</option><option value="year">รายปี</option><option value="month">รายเดือน</option><option value="range">กำหนดเอง</option></select></label>
    <label>ปี (พ.ศ.)<input id="year" type="number" min="2500" max="2800" value="2569"></label><label>เดือน<select id="month">${monthNames.map((m,i)=>`<option value="${i}">${m}</option>`).join('')}</select></label>
    <label>กระบวนการ<select id="ov-process">${options(Object.keys(WF).map(x=>[x,x]))}</select></label><label>สถานะ<select id="ov-state">${options(['กำลังดำเนินการ','เสร็จสิ้น','เกินกำหนด'].map(x=>[x,x]))}</select></label>
    <label>ฝ่ายงาน<select id="ov-dept">${options(Object.entries(DEPT))}</select></label><label>ผู้รับผิดชอบ<select id="ov-owner">${options(visiblePeople)}</select></label>
    <label>นับงานตาม<select id="metric"><option value="start">วันที่เริ่มงาน</option><option value="due">วันที่กำหนดส่ง</option></select></label>
    <label class="range-field" hidden>ตั้งแต่<input id="from" type="date"></label><label class="range-field" hidden>ถึง<input id="to" type="date"></label>
    </div><p class="filter-feedback" id="ov-feedback" role="status"></p></section><div id="ov-results"></div>`;
  $('#month').value = String(new Date().getMonth()); restoreView();
  $$('.filters input,.filters select').forEach(e => e.onchange = () => {
    if (['period','month','year','from','to'].includes(e.id)) selectedMonth = null;
    if (e.id === 'ov-owner') selectedPerson = null;
    if (e.id === 'ov-process') selectedProcess = null;
    if (e.id === 'ov-state') cardFilter = e.value;
    drawOverview();
  });
  $('#ov-clear').onclick = () => { resetViewFilters(); overviewView(); }; drawOverview();
}
function ovBase() {
  return db.tasks.filter(accessible).filter(t => {
    const p=$('#ov-process').value, d=$('#ov-dept').value, owner=$('#ov-owner').value;
    return (p==='all'||t.process===p)&&(d==='all'||account(t.ownerId)?.dept===d)&&(owner==='all'||t.ownerId===owner||t.holderId===owner);
  });
}
function selectedChartFilter(t, skipStatus = false) {
  return (skipStatus || cardFilter==='all'||state(t)===cardFilter) && (!selectedPerson||t.ownerId===selectedPerson||t.holderId===selectedPerson) && (!selectedProcess||t.process===selectedProcess);
}
function barStyle(n, max) {
  const r = n / Math.max(1,max);
  return `--bar-light:hsl(${37-r*4} 95% ${95-r*11}%);--bar-deep:hsl(${31-r*6} 91% ${85-r*16}%);`;
}
function drawOverview() {
  const period=$('#period').value, year=Number($('#year').value)-543, month=Number($('#month').value), metric=$('#metric').value;
  $$('.range-field').forEach(el=>el.hidden=period!=='range');
  $('#month').disabled = false;
  const from=$('#from').value,to=$('#to').value;
  const invalid = !Number.isInteger(year)||year<1957||year>2257 || (period==='range' && from && to && from>to);
  $('#ov-feedback').textContent = invalid ? 'กรุณาระบุปีหรือช่วงวันที่ให้ถูกต้อง' : `สถิตินับตาม${metric==='start'?'วันที่เริ่มงาน':'วันที่กำหนดส่ง'} · กราฟแนวโน้มแสดงปี ${year+543}`;
  const base = invalid ? [] : ovBase();
  const byTime = t => {
    const v=t[metric],dt=date(v);
    if(selectedMonth!==null) return dt.getFullYear()===year && dt.getMonth()===selectedMonth;
    if(period==='year') return dt.getFullYear()===year;
    if(period==='month') return dt.getFullYear()===year&&dt.getMonth()===month;
    if(period==='range') return (!from||v>=from)&&(!to||v<=to);
    return true;
  };
  const scoped = base.filter(byTime).filter(t=>selectedChartFilter(t,true));
  const status=$('#ov-state').value;
  const list=scoped.filter(t=>(status==='all'||state(t)===status)&&selectedChartFilter(t));
  const people=USERS.map(u=>({u,n:list.filter(t=>t.ownerId===u.id||t.holderId===u.id).length})).filter(x=>x.n);
  const maxPeople=Math.max(1,...people.map(x=>x.n));
  const procs=Object.keys(WF).map(p=>({p,n:list.filter(t=>t.process===p).length}));
  const maxProc=Math.max(1,...procs.map(x=>x.n));
  // Keep all 12 months visible when one month is selected, for further drill-down.
  const annual=base.filter(t=>date(t[metric]).getFullYear()===year).filter(t=>(status==='all'||state(t)===status)&&selectedChartFilter(t));
  const counts=Array.from({length:12},(_,m)=>annual.filter(t=>date(t[metric]).getMonth()===m).length),maxMonth=Math.max(1,...counts);
  const chosenMonth=selectedMonth!==null?selectedMonth:period==='month'?month:null;
  $('#ov-results').innerHTML = taskCards(scoped)+`<div class="charts"><section class="panel"><h3>ภาระงานรายบุคคล</h3><p class="helper"></p>
    ${people.length?people.map(({u,n})=>`<div class="chart-line"><button data-person="${u.id}" aria-pressed="${selectedPerson===u.id}" class="${selectedPerson===u.id?'selected':''}" title="${esc(u.name)}: ${n} งาน"><span class="chart-label"><span>${esc(u.name)}</span><strong>${n} งาน</strong></span><div class="bar-track"><div class="bar" style="${barStyle(n,maxPeople)}width:${n/maxPeople*100}%"></div></div></button></div>`).join(''):'<p class="empty">ไม่มีข้อมูลตามตัวกรอง</p>'}</section>
    <section class="panel"><h3>สัดส่วนกระบวนการ</h3><p class="helper"></p>${procs.map(({p,n})=>`<div class="chart-line"><button data-process="${esc(p)}" aria-pressed="${selectedProcess===p}" class="${selectedProcess===p?'selected':''}" title="${esc(p)}: ${n} งาน"><span class="chart-label"><span>${esc(p)}</span><strong>${n} งาน</strong></span><div class="bar-track"><div class="bar" style="${barStyle(n,maxProc)}width:${n/Math.max(1,list.length)*100}%"></div></div></button></div>`).join('')}</section></div>
    <section class="panel"><div class="toolbar"><h3>แนวโน้มภาระงานรายเดือน ปี ${year+543}</h3><span class="helper"></span></div><div class="months">${counts.map((n,m)=>`<button class="month-bar ${chosenMonth===m?'active':''}" aria-pressed="${chosenMonth===m}" data-month="${m}" title="${monthNames[m]} ${year+543}: ${n} งาน"><small>${n}</small><div class="column ${n===0?'zero':''}" style="${barStyle(n,maxMonth)}height:${n===0?2:Math.max(6,n/maxMonth*135)}px"></div><span>${dateMonths[m]}</span></button>`).join('')}</div></section>
    <section class="panel" id="summary"><div class="toolbar"><h3>ตารางสรุปรายละเอียดภาระงาน (${list.length} งาน)</h3><div class="table-tools"><button class="clear-button" id="clear-chart">ล้างการเลือกกราฟ</button><button id="export-ov">ส่งออก Excel / Word</button></div></div>${taskTable(list)}</section>`;
  $$('[data-card]').forEach(b=>b.onclick=()=>{cardFilter=cardFilter===b.dataset.card?'all':b.dataset.card;$('#ov-state').value=cardFilter;drawOverview();});
  const scrollSummary=()=>$('#summary').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
  $$('[data-person]').forEach(b=>b.onclick=()=>{selectedPerson=selectedPerson===b.dataset.person?null:b.dataset.person;drawOverview();scrollSummary();});
  $$('[data-process]').forEach(b=>b.onclick=()=>{selectedProcess=selectedProcess===b.dataset.process?null:b.dataset.process;drawOverview();scrollSummary();});
  $$('[data-month]').forEach(b=>b.onclick=()=>{const m=Number(b.dataset.month);selectedMonth=selectedMonth===m?null:m;if(selectedMonth!==null){$('#period').value='month';$('#month').value=String(m);}else $('#period').value='year';drawOverview();scrollSummary();});
  $('#clear-chart').onclick=()=>{selectedMonth=selectedPerson=selectedProcess=null;cardFilter='all';$('#ov-state').value='all';$('#period').value='year';drawOverview();};
  $('#export-ov').onclick=()=>exportDialog(list,'รายงานภาพรวมภาระงาน');bindTasks();rememberView();
}

// Existing task and leave schemas are retained; no mock data is regenerated.
function detailTask(id) {
  const t=db.tasks.find(t=>t.id===id);if(!t||!accessible(t))return;
  const steps=WF[t.process]||[], can=me.id===t.holderId&&me.role!=='secretary';
  openModal(`<div class="modal-heading"><div><p class="eyebrow">รายละเอียดภาระงาน</p><h2>${esc(t.title)}</h2></div>${closeButton()}</div>
    <div class="detail-status">${badge(state(t))}${crossDept(t)?`<span class="cross-label">${icon('transfer')}ดำเนินงานข้ามฝ่าย</span>`:''}</div>
    <dl class="detail-grid"><div class="wide"><dt>กระบวนการ</dt><dd>${esc(t.process)}</dd></div><div><dt>ผู้รับผิดชอบหลัก</dt><dd>${userLabel(t.ownerId)}</dd></div><div><dt>ผู้รับผิดชอบปัจจุบัน</dt><dd>${userLabel(t.holderId)}</dd></div><div class="wide"><dt>ระยะเวลา</dt><dd>${dateRange(t.start,t.due)}</dd></div><div class="wide"><dt>รายละเอียด</dt><dd>${esc(t.description||'ไม่ได้ระบุรายละเอียด')}</dd></div></dl>
    <div class="toolbar"><h3>ลำดับ Workflow</h3><span class="helper">ขั้นที่ ${t.step+1} จาก ${steps.length} ขั้นตอน</span></div>
    <div class="timeline">${steps.map((s,i)=>`<div class="step ${i<t.step||t.completed?'passed':i===t.step?'current':''}"><div class="circle">${i<t.step||t.completed?icon('check'):i+1}</div><div class="step-text"><strong>${esc(s)}</strong><small>${t.completed||i<t.step?'ดำเนินการแล้ว':i===t.step?'ขั้นตอนปัจจุบัน':'ยังไม่ถึงขั้นตอนนี้'}</small></div></div>`).join('')}</div>
    ${can&&!t.completed?'<div class="modal-footer"><button class="primary" id="advance">ดำเนินการขั้นตอนถัดไป</button></div>':`<p class="read-only-note">${t.completed?'ภาระงานนี้ดำเนินการเสร็จสิ้นแล้ว':me.role==='secretary'?'โหมดติดตามภาพรวม · ไม่สามารถเปลี่ยนขั้นตอนแทนผู้ดำเนินงาน':'ผู้รับผิดชอบปัจจุบันเป็นผู้ดำเนินการขั้นตอนถัดไป'}</p>`}
    ${(t.history||[]).length?`<details class="audit"><summary>ประวัติการดำเนินการ (${t.history.length} รายการ)</summary>${t.history.map(h=>`<p>${esc(name(h.by))} · ${h.at?new Date(h.at).toLocaleString('th-TH'): 'ไม่ระบุวันเวลา'}<br>${h.step!==undefined?esc(steps[h.step]||'ดำเนินการ'): 'เปลี่ยนผู้ถือครองงาน'}${h.holder?' · '+esc(name(h.holder)):''}</p>`).join('')}</details>`:'<p class="helper"></p>'}`);
  $('#advance')?.addEventListener('click',()=>{
    if(me.id!==t.holderId||me.role==='secretary'||t.completed)return;
    const oldHolder=t.holderId;
    if(!commit(()=>{t.step=Math.min(t.step+1,steps.length-1);t.completed=t.step===steps.length-1;
      if(t.process==='ค่าตอบแทนเพื่อเพิ่มประสิทธิภาพ'){if(t.step===3)t.holderId='jantima';else if(t.step>3&&oldHolder==='jantima')t.holderId=t.ownerId;}
      (t.history||=[]).push({at:new Date().toISOString(),by:me.id,step:t.step,holder:t.holderId});
    }))return;
    $('#modal').close();rememberView();render();toast('บันทึกขั้นตอนแล้ว');
  });
}
function newTask() {
  if(me.role==='secretary')return;
  openModal(`<div class="modal-heading"><h2>บันทึกภาระงานใหม่</h2>${closeButton()}</div><form id="task-form" class="form-grid"><label class="wide">กระบวนการ<select name="process">${Object.keys(WF).map(x=>`<option>${esc(x)}</option>`).join('')}</select></label><label class="wide">ชื่องาน<input name="title" required maxlength="200"></label><label class="wide">รายละเอียด<textarea name="description" rows="3"></textarea></label><label>วันที่เริ่ม<input type="date" name="start" value="${today()}" required></label><label>กำหนดส่ง<input type="date" name="due" value="${today()}" required></label><p class="helper wide">ผู้รับผิดชอบ: ${esc(me.name)} </p><div class="wide modal-footer"><button type="button" data-close>ยกเลิก</button><button class="primary">บันทึกภาระงาน</button></div></form>`);
  $('#task-form').onsubmit=e=>{
    e.preventDefault();const f=new FormData(e.target),start=f.get('start'),due=f.get('due'),title=f.get('title').trim();
    if(!title||due<start){toast(!title?'กรุณาระบุชื่องาน':'กำหนดส่งต้องไม่ก่อนวันที่เริ่มงาน',true);return;}
    if(!commit(()=>db.tasks.push({id:rnd(),ownerId:me.id,holderId:me.id,process:f.get('process'),title,description:f.get('description').trim(),start,due,step:0,completed:false,history:[]})))return;
    $('#modal').close();rememberView();render();toast('เพิ่มภาระงานแล้ว');
  };
}

function taskCalendarEvents() {
  // Date-only deadlines. No hours are created for tasks.
  return db.tasks.filter(accessible).map(t=>({id:t.id,day:t.due,label:t.title,status:t.completed?'เสร็จสิ้น':t.due<today()?'เกินกำหนด':'รอดำเนินการ',person:name(t.holderId),type:'task'}));
}
function leaveCalendarEvents(scope) {
  const source=scope==='personnel'?personnelLeaves():db.leaves.filter(l=>l.ownerId===me.id);
  return source.map(l=>({id:l.id,day:l.date,label:`${l.type} · ${name(l.ownerId)}`,status:l.status,start:l.start,end:l.end,person:name(l.ownerId),type:'leave'}));
}
function eventButton(e, extra = '') {
  const label = `${e.start ? `${e.start}–${e.end} ` : ''}${e.label}`;
  return `<button type="button" class="cal-event ${cls(e.status)} ${extra}" data-cal-item="${esc(e.id)}" title="${esc(label+' · '+e.status)}"><span>${esc(label)}</span></button>`;
}
function layoutTimedEvents(events) {
  const items=events.map(e=>({...e,startMinute:minutesOf(e.start),endMinute:minutesOf(e.end)}))
    .filter(e=>Number.isFinite(e.startMinute)&&Number.isFinite(e.endMinute)&&e.endMinute>e.startMinute)
    .sort((a,b)=>a.startMinute-b.startMinute||b.endMinute-a.endMinute);
  let group=[],groupEnd=-1;
  const result=[];
  function finishGroup(){
    if(!group.length)return;
    const ends=[];
    group.forEach(e=>{let lane=ends.findIndex(end=>end<=e.startMinute);if(lane<0)lane=ends.length;ends[lane]=e.endMinute;e.lane=lane;});
    group.forEach(e=>result.push({...e,lanes:ends.length}));
    group=[];
  }
  items.forEach(e=>{if(e.startMinute>=groupEnd){finishGroup();groupEnd=-1;}group.push(e);groupEnd=Math.max(groupEnd,e.endMinute);});
  finishGroup();return result;
}
function leaveDayGrid(events, day) {
  const placed=layoutTimedEvents(events);
  const invalid=events.filter(e=>!Number.isFinite(minutesOf(e.start))||!Number.isFinite(minutesOf(e.end))||minutesOf(e.end)<=minutesOf(e.start));
  return `<div class="day-heading"><strong>${dateThai(day)}</strong><span>${events.length} รายการ</span></div>
    ${!events.length?'<p class="calendar-empty-note">ไม่มีรายการลาในวันที่เลือก · ตารางเวลายังคงแสดงครบทุกชั่วโมง</p>':''}
    ${invalid.length?`<div class="calendar-invalid"><p>รายการที่ข้อมูลเวลาไม่ครบ</p>${invalid.map(e=>eventButton(e)).join('')}</div>`:''}
    <div class="day-time-scroll" aria-label="ตารางเวลาการลา 00:00 ถึง 23:00"><div class="day-time-grid">
      <div class="time-axis">${Array.from({length:24},(_,h)=>`<div class="time-label" data-hour="${h}">${String(h).padStart(2,'0')}:00</div>`).join('')}</div>
      <div class="time-events">${Array.from({length:24},(_,h)=>`<div class="time-slot" aria-hidden="true" data-slot="${h}"></div>`).join('')}
        ${placed.map(e=>`<button type="button" class="time-event ${cls(e.status)}" data-cal-item="${esc(e.id)}" data-start="${e.start}" data-end="${e.end}" style="top:${e.startMinute/60*56}px;height:${Math.max(8,(e.endMinute-e.startMinute)/60*56)}px;left:calc(${e.lane/e.lanes*100}% + 4px);width:calc(${100/e.lanes}% - 8px)" title="${esc(e.label+' '+e.start+'–'+e.end+' · '+e.status)}"><strong>${e.start}–${e.end}</strong><span>${esc(e.label)}</span><small>${esc(e.status)}</small></button>`).join('')}
      </div></div></div>`;
}
function taskDayList(events, day) {
  return `<div class="day-heading"><strong>${dateThai(day)}</strong><span>${events.length} งาน</span></div><div class="task-day-list">${events.length?events.map(e=>`<button class="task-day-card" data-cal-item="${esc(e.id)}"><span class="task-day-icon">${icon('tasks')}</span><span><strong>${esc(e.label)}</strong><small>ผู้ดำเนินงาน: ${esc(e.person)}</small><small>กำหนดส่ง ${shortDate(e.day)}</small></span>${badge(e.status)}${icon('chevron')}</button>`).join(''):'<div class="empty calendar-empty">ไม่มีภาระงานที่มีกำหนดส่งในวันที่เลือก<br><small>ใช้ปุ่มก่อนหน้า ถัดไป หรือเลือกวันที่เพื่อดูวันอื่น</small></div>'}</div>`;
}
function calendarView(kind, scope='personal') {
  if(kind==='leave'&&scope==='personnel'&&me.role==='staff')scope='personal';
  calendarScope=scope;
  const key=kind==='task'?'task':scope;
  const current=calendarStates[key];
  const c=kind==='task'?$('#view'):$('#leave-view');
  const title=kind==='task'?'ปฏิทินกำหนดส่งงาน':scope==='personnel'?'ปฏิทินการลาบุคลากร':'ปฏิทินการลาส่วนตัว';
  const legend=kind==='task'?['เสร็จสิ้น','รอดำเนินการ','เกินกำหนด']:['อนุมัติแล้ว','รออนุมัติ','ไม่อนุมัติ'];
  c.innerHTML=`<section class="panel calendar-panel"><div class="calendar-top"><div><h2>${title}</h2><p class="helper">${kind==='task'?'':scope==='personnel'?'เฉพาะบุคลากรที่คุณมีสิทธิ์พิจารณาคำขอลา':'แสดงเฉพาะคำขอลาของคุณ'}</p></div><div class="cal-controls"><button id="cal-today">วันนี้</button><div class="cal-navigation"><button id="cal-prev" aria-label="ช่วงก่อนหน้า">‹</button><strong id="cal-title" aria-live="polite"></strong><button id="cal-next" aria-label="ช่วงถัดไป">›</button></div><div class="calendar-mode" aria-label="รูปแบบปฏิทิน">${[['day','วัน'],['month','เดือน'],['year','ปี']].map(([value,label])=>`<button data-mode="${value}" class="${current.mode===value?'active':''}" aria-pressed="${current.mode===value}">${label}</button>`).join('')}</div></div></div>
    <div class="calendar-options"><div class="legend" aria-label="ความหมายของสี">${legend.map(s=>`<span><i class="legend-dot ${cls(s)}"></i>${s}</span>`).join('')}</div><label class="calendar-jump">ไปยังวันที่<input id="cal-jump" type="date" value="${iso(current.view)}"></label></div><div class="cal-scroll" id="calendar-body"></div></section>`;
  function draw(){
    const view=current.view,mode=current.mode,y=view.getFullYear(),m=view.getMonth();
    const events=kind==='task'?taskCalendarEvents():leaveCalendarEvents(scope);
    const byDay=value=>events.filter(e=>e.day===value);
    $('#cal-title').textContent=mode==='year'?`ปี ${y+543}`:mode==='day'?dateThai(iso(view)):monthThai(view);
    $('#cal-jump').value=iso(view);
    let out='';
    if(mode==='year'){
      out=`<div class="year-grid">${Array.from({length:12},(_,mi)=>{
        const offset=new Date(y,mi,1).getDay(),last=new Date(y,mi+1,0).getDate();
        return `<section class="mini"><h3>${monthNames[mi]}</h3><div class="mini-grid">${['อา','จ','อ','พ','พฤ','ศ','ส'].map(w=>`<span class="mini-weekday">${w}</span>`).join('')}${Array.from({length:offset},()=>'<span></span>').join('')}${Array.from({length:last},(_,i)=>{const s=iso(new Date(y,mi,i+1)),n=byDay(s).length;return `<button data-jump="${s}" class="${n?'marked':''} ${s===today()?'current-day':''}" title="${dateThai(s)} · ${n} รายการ">${i+1}</button>`;}).join('')}</div></section>`;
      }).join('')}</div>`;
    }else if(mode==='day'){
      const day=iso(view),eventsToday=byDay(day);
      out=kind==='leave'?leaveDayGrid(eventsToday,day):taskDayList(eventsToday,day);
    }else{
      const offset=new Date(y,m,1).getDay(),last=new Date(y,m+1,0).getDate(),total=Math.ceil((last+offset)/7)*7;
      out=`<div class="cal-grid">${weekdayNames.map(w=>`<div class="weekday">${w}</div>`).join('')}${Array.from({length:total},(_,i)=>{
        const dt=new Date(y,m,i-offset+1),s=iso(dt),items=byDay(s);
        return `<div class="cal-day ${dt.getMonth()!==m?'outside':''} ${s===today()?'today':''}" data-date="${s}"><button class="day-number" data-jump="${s}" aria-label="ดูวันที่ ${dateThai(s)}">${dt.getDate()}</button>${items.slice(0,3).map(e=>eventButton(e)).join('')}${items.length>3?`<button class="cal-more" data-jump="${s}">ดูอีก ${items.length-3} รายการ</button>`:''}</div>`;
      }).join('')}</div>`;
    }
    $('#calendar-body').innerHTML=out;
    $$('[data-cal-item]').forEach(b=>b.onclick=()=>kind==='task'?detailTask(b.dataset.calItem):detailLeave(b.dataset.calItem));
    $$('[data-jump]').forEach(b=>b.onclick=()=>{current.view=date(b.dataset.jump);current.mode='day';calendarView(kind,scope);});
  }
  function shift(delta){const d=current.view;current.view=current.mode==='year'?new Date(d.getFullYear()+delta,d.getMonth(),1):current.mode==='month'?new Date(d.getFullYear(),d.getMonth()+delta,1):new Date(d.getFullYear(),d.getMonth(),d.getDate()+delta);draw();}
  $('#cal-prev').onclick=()=>shift(-1);$('#cal-next').onclick=()=>shift(1);$('#cal-today').onclick=()=>{current.view=new Date();draw();};
  $('#cal-jump').onchange=e=>{if(e.target.value){current.view=date(e.target.value);draw();}};
  $$('[data-mode]').forEach(b=>b.onclick=()=>{current.mode=b.dataset.mode;calendarView(kind,scope);});draw();
}
function leavePage(){
  if(me.role==='staff'&&['approvals','personnel-calendar'].includes(tab))tab='history';
  const tabs=[['request','ยื่นคำขอลา'],['history','ประวัติและสถานะการลา'],['calendar','ปฏิทินการลาส่วนตัว']];
  if(me.role!=='staff')tabs.push(['personnel-calendar','ปฏิทินการลาบุคลากร'],['approvals','พิจารณาคำขอลา']);
  $('#content').innerHTML=`<nav class="tabs" aria-label="เมนูระบบการลา">${tabs.map(([key,label])=>`<button data-tab="${key}" class="${tab===key?'active':''}" ${tab===key?'aria-current="page"':''}>${label}</button>`).join('')}</nav><div id="leave-view"></div>`;
  $$('[data-tab]').forEach(b=>b.onclick=()=>navigate('leave',b.dataset.tab));
  if(tab==='request')requestView();else if(tab==='history')historyView();else if(tab==='approvals')approvalsView();else calendarView('leave',tab==='personnel-calendar'?'personnel':'personal');
}
function leaveSummary(){
  const mine=db.leaves.filter(l=>l.ownerId===me.id),approved=mine.filter(l=>l.status==='อนุมัติแล้ว'),pending=mine.filter(l=>l.status==='รออนุมัติ'),sum=items=>items.reduce((s,l)=>s+Number(l.minutes||0),0);
  return `<div class="cards leave-cards">${[['ลาสะสมที่อนุมัติแล้ว',sum(approved)],['รออนุมัติ',sum(pending)],['ลาป่วยที่อนุมัติแล้ว',sum(approved.filter(l=>l.type==='ลาป่วย'))],['ลากิจที่อนุมัติแล้ว',sum(approved.filter(l=>l.type==='ลากิจส่วนตัว'))]].map(([label,n])=>`<div class="card"><span>${label}</span><strong>${totalTime(n)}</strong></div>`).join('')}</div>`;
}
function requestView(){
  $('#leave-view').innerHTML=`<h2>ระบบยื่นขออนุมัติลาชั่วโมง</h2>${leaveSummary()}<section class="panel leave-request-panel"><h3>แบบฟอร์มยื่นคำขอลา</h3><p class="helper"></p>
    ${me.role==='secretary'?'<p class="form-note">ในต้นแบบนี้เลขานุการคณะยื่นคำขอได้ แต่ไม่มีบัญชีผู้อนุมัติระดับถัดไป จึงไม่อนุมัติคำขอของตนเองโดยอัตโนมัติ</p>':''}
    <form class="form-grid" id="leave-form"><label>ประเภทการลา<select name="type"><option>ลากิจส่วนตัว</option><option>ลาป่วย</option></select></label><label>กลุ่มงาน<input value="${esc(DEPT[me.dept])}" disabled></label><label class="wide">เหตุผล<textarea name="reason" required rows="3" maxlength="1000"></textarea></label><label>วันที่ลา<input type="date" name="date" value="${today()}" required></label><label>เบอร์ติดต่อ<input name="phone" type="tel" maxlength="30" required></label><label>เวลาเริ่มต้น<input name="start" type="time" value="09:00" required></label><label>เวลาสิ้นสุด<input name="end" type="time" value="10:30" required></label><div class="wide form-duration" id="leave-duration" role="status"></div><div class="wide modal-footer"><button class="primary" type="submit">ยื่นคำขอลา</button></div></form></section>`;
  const form=$('#leave-form');
  function showDuration(){const n=minutesOf(form.elements.end.value)-minutesOf(form.elements.start.value);$('#leave-duration').textContent=Number.isFinite(n)&&n>0?`ระยะเวลา ${durationText(n)}${n>120?' — เกิน 120 นาที':''}`:'กรุณาระบุเวลาสิ้นสุดหลังเวลาเริ่มต้น';$('#leave-duration').classList.toggle('error',!Number.isFinite(n)||n<=0||n>120);}
  form.elements.start.oninput=form.elements.end.oninput=showDuration;showDuration();
  form.onsubmit=e=>{
    e.preventDefault();const f=new FormData(form),start=f.get('start'),end=f.get('end'),day=f.get('date'),reason=f.get('reason').trim(),phone=f.get('phone').trim(),minutes=minutesOf(end)-minutesOf(start);
    if(!reason||!phone||!Number.isFinite(minutes)||minutes<=0||minutes>120){toast('กรุณากรอกข้อมูลครบ และเลือกช่วงเวลาไม่เกิน 120 นาที',true);return;}
    const same=db.leaves.filter(l=>l.ownerId===me.id&&l.date===day&&l.status!=='ไม่อนุมัติ');
    if(same.some(l=>start<l.end&&end>l.start)){toast('ช่วงเวลาซ้ำกับคำขอเดิม',true);return;}
    if(same.reduce((n,l)=>n+Number(l.minutes||0),0)+minutes>120){toast('ยอดลารวมวันเดียวกันเกิน 120 นาที',true);return;}
    const approver=me.role==='secretary'?null:me.role==='head'?'pannathipa':me.dept==='hr'?'supaporn':'jantima';
    if(!commit(()=>db.leaves.unshift({id:rnd(),ownerId:me.id,approverId:approver,date:day,type:f.get('type'),start,end,minutes,reason,phone,status:'รออนุมัติ',createdAt:new Date().toISOString()})))return;
    navigate('leave','history');toast('ยื่นคำขอลาแล้ว');
  };
}
function leaveTable(list,actions=false){
  return `<div class="table-scroll"><table class="leave-table"><thead><tr><th>ผู้ยื่น</th><th>วันที่ลา</th><th>ประเภท</th><th>ช่วงเวลา</th><th>ระยะเวลา</th><th>เหตุผล</th><th>สถานะ</th><th>จัดการ</th></tr></thead><tbody>${list.length?list.map(l=>`<tr><td>${userLabel(l.ownerId)}</td><td><span class="date-range">${shortDate(l.date)}</span></td><td>${esc(l.type)}</td><td class="time-range">${esc(l.start)}–${esc(l.end)}</td><td>${l.minutes} นาที</td><td>${esc(l.reason)}</td><td>${badge(l.status)}</td><td><div class="table-action-group">${actions&&l.status==='รออนุมัติ'&&l.approverId===me.id&&l.ownerId!==me.id?`<button class="approve-button" data-decide="${esc(l.id)}" data-decision="อนุมัติแล้ว">อนุมัติ</button><button class="danger" data-decide="${esc(l.id)}" data-decision="ไม่อนุมัติ">ไม่อนุมัติ</button>`:''}<button class="table-action" data-leave="${esc(l.id)}">รายละเอียด</button></div></td></tr>`).join(''):'<tr><td colspan="8" class="empty">ไม่พบคำขอตามตัวกรองที่เลือก</td></tr>'}</tbody></table></div>`;
}
function leaveFilters(prefix,title){
  return `<div class="toolbar"><h3>${title}</h3>${clearButton(prefix+'-clear')}</div><div class="filters"><label>ปี (พ.ศ.)<input id="${prefix}-year" type="number" min="2500" max="2800" value="2569" placeholder="ทุกปี"></label><label>เดือน<select id="${prefix}-month">${options(monthNames.map((m,i)=>[String(i),m]))}</select></label><label>ประเภทการลา<select id="${prefix}-type">${options([['ลาป่วย','ลาป่วย'],['ลากิจส่วนตัว','ลากิจส่วนตัว']])}</select></label><label>สถานะ<select id="${prefix}-status">${options(['รออนุมัติ','อนุมัติแล้ว','ไม่อนุมัติ'].map(s=>[s,s]))}</select></label></div>`;
}
function filteredLeaves(source,prefix){
  const v=key=>$('#'+prefix+'-'+key).value,y=v('year'),m=v('month'),t=v('type'),s=v('status');
  return source.filter(l=>(!y||date(l.date).getFullYear()===Number(y)-543)&&(m==='all'||date(l.date).getMonth()===Number(m))&&(t==='all'||l.type===t)&&(s==='all'||l.status===s)).sort((a,b)=>b.date.localeCompare(a.date)||b.start.localeCompare(a.start));
}
function historyView(){
  $('#leave-view').innerHTML=`<h2>ประวัติและสถานะการลา</h2>${leaveSummary()}<section class="panel filters-panel">${leaveFilters('lh','ตัวกรองประวัติการลา')}</section><section class="panel"><div class="toolbar"><h3 id="lh-title">รายการประวัติการลา</h3><button id="lh-export">ส่งออก Excel / Word</button></div><div id="lh-result"></div></section>`;
  restoreView();let list=[];
  function update(){list=filteredLeaves(db.leaves.filter(l=>l.ownerId===me.id),'lh');$('#lh-title').textContent=`รายการประวัติการลา (${list.length} รายการ)`;$('#lh-result').innerHTML=leaveTable(list);bindLeaves();rememberView();}
  $$('.filters input,.filters select').forEach(e=>e.onchange=update);
  $('#lh-clear').onclick=()=>{$('#lh-year').value='';$('#lh-month').value=$('#lh-type').value=$('#lh-status').value='all';update();};
  $('#lh-export').onclick=()=>exportDialog(list,'รายงานประวัติการลา');update();
}
function approvalsView(){
  if(me.role==='staff')return;
  $('#leave-view').innerHTML=`<h2>พิจารณาคำขอลา</h2><p class="helper"></p><section class="panel filters-panel">${leaveFilters('ap','ตัวกรองคำขอลา')}</section><section class="panel"><div class="toolbar"><h3 id="ap-title">รายการคำขอ</h3><button id="ap-export">ส่งออก Excel / Word</button></div><div id="ap-result"></div></section>`;
  $('#ap-status').value='รออนุมัติ';restoreView();let list=[];
  function update(){
    list=filteredLeaves(personnelLeaves(),'ap');$('#ap-title').textContent=`รายการคำขอ (${list.length} รายการ)`;$('#ap-result').innerHTML=leaveTable(list,true);bindLeaves();
    $$('[data-decide]').forEach(b=>b.onclick=()=>{
      const l=db.leaves.find(l=>l.id===b.dataset.decide);if(!l||l.approverId!==me.id||l.ownerId===me.id||l.status!=='รออนุมัติ')return;
      const decision=b.dataset.decision;
      openModal(`<div class="modal-heading"><h2>ยืนยัน${decision==='อนุมัติแล้ว'?'อนุมัติ':'ไม่อนุมัติ'}คำขอลา</h2>${closeButton()}</div><p>${esc(name(l.ownerId))} · ${shortDate(l.date)} · ${l.start}–${l.end}</p><div class="modal-footer"><button data-close>ยกเลิก</button><button class="primary" id="confirm-decision">ยืนยัน</button></div>`);
      $('#confirm-decision').onclick=()=>{
        if(l.status!=='รออนุมัติ'||l.approverId!==me.id)return;
        if(!commit(()=>{l.status=decision;l.decidedAt=new Date().toISOString();l.decidedBy=me.id;}))return;
        $('#modal').close();update();toast('บันทึกผลการพิจารณาแล้ว');
      };
    });rememberView();
  }
  $$('.filters input,.filters select').forEach(e=>e.onchange=update);
  $('#ap-clear').onclick=()=>{$('#ap-year').value='';$('#ap-month').value=$('#ap-type').value=$('#ap-status').value='all';update();};
  $('#ap-export').onclick=()=>exportDialog(list,'รายงานคำขอการลา');update();
}
function detailLeave(id){
  const l=db.leaves.find(l=>l.id===id);if(!l||!accessibleLeaves(l))return;
  openModal(`<div class="modal-heading"><div><p class="eyebrow">รายละเอียดคำขอลา</p><h2>${esc(l.type)}</h2></div>${closeButton()}</div><div class="detail-status">${badge(l.status)}</div><dl class="detail-grid"><div><dt>ผู้ยื่น</dt><dd>${userLabel(l.ownerId)}</dd></div><div><dt>วันที่ลา</dt><dd>${shortDate(l.date)}</dd></div><div><dt>ช่วงเวลา</dt><dd>${esc(l.start)}–${esc(l.end)}</dd></div><div><dt>ระยะเวลา</dt><dd>${durationText(l.minutes)}</dd></div><div class="wide"><dt>เหตุผล</dt><dd>${esc(l.reason)}</dd></div><div><dt>เบอร์ติดต่อ</dt><dd>${esc(l.phone)}</dd></div><div><dt>ผู้อนุมัติ</dt><dd>${l.approverId?esc(name(l.approverId)):'ไม่มีบัญชีผู้อนุมัติระดับถัดไปในต้นแบบ'}</dd></div></dl>`);
}
function bindLeaves(){$$('[data-leave]').forEach(b=>b.onclick=()=>detailLeave(b.dataset.leave));}

function reportRows(list){
  return list.map(x=>x.process?[x.title,x.process,name(x.ownerId),DEPT[account(x.ownerId)?.dept],name(x.holderId),shortDate(x.start),shortDate(x.due),state(x),WF[x.process]?.[x.step]||'—']:[name(x.ownerId),DEPT[account(x.ownerId)?.dept],shortDate(x.date),x.type,x.start,x.end,x.minutes,x.reason,x.status]);
}
function exportDialog(list,title){
  const tasksReport=title.includes('ภาระงาน');
  const headers=tasksReport?['ชื่องาน','กระบวนการ','ผู้รับผิดชอบ','กลุ่มงาน','ผู้รับผิดชอบปัจจุบัน','วันที่เริ่ม','กำหนดส่ง','สถานะ','ขั้นตอนปัจจุบัน']:['ผู้ยื่น','กลุ่มงาน','วันที่ลา','ประเภท','เวลาเริ่ม','เวลาสิ้นสุด','นาที','เหตุผล','สถานะ'];
  openModal(`<div class="modal-heading"><h2>ส่งออกรายงาน</h2>${closeButton()}</div><p>${esc(title)} (${list.length} รายการตามตัวกรอง)</p><p class="helper"></p><div class="pill-row"><button class="primary" id="excel-export">Excel (.xls)</button><button class="primary" id="word-export">Word (.doc)</button></div>`);
  async function build(format){
    const btn=$('#'+(format==='xls'?'excel-export':'word-export'));btn.disabled=true;const oldText=btn.textContent;btn.textContent='กำลังสร้างรายงาน…';
    try{
      const image=new Image();image.src='tu-logo.jpg';await image.decode();
      const canvas=document.createElement('canvas');canvas.width=180;canvas.height=180;canvas.getContext('2d').drawImage(image,0,0,180,180);
      const logo=canvas.toDataURL('image/png');
      const rows=reportRows(list).map(row=>`<tr>${row.map(v=>`<td>${esc(v)}</td>`).join('')}</tr>`).join('');
      const html=`<!doctype html><html lang="th"><head><meta charset="utf-8"><style>@page{size:A4 landscape;margin:1.5cm}body,table{font-family:'TH Sarabun New','Sarabun',serif;font-size:16pt;color:#111}table{border-collapse:collapse;width:100%}th,td{border:1px solid #9a9a9a;padding:6px;vertical-align:top}th{background:#fff0e5}h1{text-align:center;font-size:20pt}.meta{text-align:center}</style></head><body><div class="meta"><img src="${logo}" width="70" height="70" alt="ตรามหาวิทยาลัยธรรมศาสตร์"></div><h1>${esc(title)}</h1><p class="meta">คณะศิลปศาสตร์ มหาวิทยาลัยธรรมศาสตร์</p><p>ผู้ส่งออก: ${esc(me.name)} · วันที่ ${dateThai(today())} · ${list.length} รายการ</p><table><thead><tr>${headers.map(h=>`<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table></body></html>`;
      const blob=new Blob(['\ufeff',html],{type:format==='xls'?'application/vnd.ms-excel':'application/msword'}),url=URL.createObjectURL(blob),a=document.createElement('a');
      a.href=url;a.download=`TU_Arts_Report_${today()}.${format}`;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),10000);toast('สร้างไฟล์รายงานแล้ว');
    }catch(error){toast('ส่งออกไม่สำเร็จ โปรดเปิดผ่าน Live Server และตรวจไฟล์ตรามหาวิทยาลัย',true);}
    finally{btn.disabled=false;btn.textContent=oldText;}
  }
  $('#excel-export').onclick=()=>build('xls');$('#word-export').onclick=()=>build('doc');
}
window.addEventListener('storage',e=>{
  if(e.key===KEY&&e.newValue){try{const data=JSON.parse(e.newValue);if(Array.isArray(data.tasks)&&Array.isArray(data.leaves)){db=data;if(me&&!$('#modal')?.open){rememberView();render();}}}catch{toast('ข้อมูลจากอีกหน้าต่างไม่ถูกต้อง',true);}}
  if(e.key===SESSION&&e.newValue!==me?.id){me=account(e.newValue);clearSelections();Object.keys(fieldsByView).forEach(k=>delete fieldsByView[k]);render();}
});
render();
})();
