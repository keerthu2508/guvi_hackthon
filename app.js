
// Frontend SPA - communicates with Node.js backend
const API = window.location.origin + '/api';

let state = {
  patients: [],
  page: 'dashboard', // dashboard | patient | doctor
  selectedId: null
};

async function fetchPatients(){
  try{
    const res = await fetch(API + '/patients');
    state.patients = await res.json();
  }catch(e){
    console.error('Failed to fetch patients', e);
    state.patients = [];
  }
}

function goHome(){ state.page='dashboard'; render(); }
function goDoctor(){ state.page='doctor'; render(); }
function openPatient(id){ state.selectedId = id; state.page='patient'; render(); }

async function render(){
  await fetchPatients();
  const root = document.getElementById('root');
  if(state.page === 'dashboard') root.innerHTML = dashboardHTML();
  else if(state.page === 'patient') root.innerHTML = await patientHTML(state.selectedId);
  else if(state.page === 'doctor') root.innerHTML = doctorHTML();
  attachEvents();
  if(state.page === 'dashboard') renderDashboardCharts();
  if(state.page === 'doctor') renderDoctorCharts();
}

function dashboardHTML(){
  return `
  <div class="container">
    <div class="hero">
      <div class="hero-card">
        <h2>Manage chronic care remotely</h2>
        <p>Multilingual, offline-capable reminders, AI-assisted insights, and telemedicine-ready reports.</p>
      </div>
      <div class="hero-card" style="max-width:340px">
        <h3>Quick Actions</h3>
        <button onclick="openAddPatient()">+ Add Patient</button>
        <button onclick="goDoctor()">Doctor View</button>
      </div>
    </div>
    <div class="grid">
      <aside class="sidebar card">
        <h3>Patients</h3>
        <div id="patientList">
          ${state.patients.map(p=>`<div class="patient-item" onclick="openPatient(${p.id})"><div><strong>${p.name}</strong><div style="font-size:0.85rem;color:var(--muted)">${(p.conditions||[]).join(', ')}</div></div><div><small>${p.lastSync||''}</small></div></div>`).join('')}
        </div>
      </aside>
      <main class="main">
        <section class="card chart-card" id="overviewCard">
          <h3>Overview</h3>
          <canvas id="overviewChart" height="140"></canvas>
        </section>
        <section class="card chart-card">
          <h3>Recent Alerts</h3>
          <div id="alerts">No alerts</div>
        </section>
      </main>
    </div>
  </div>`;
}

function openAddPatient(){
  const name = prompt('Patient name');
  if(!name) return;
  const body = { name, age:0, gender:'O', conditions:[] };
  fetch(API + '/patients', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body)}).then(()=>render());
}

async function patientHTML(id){
  try{
    const res = await fetch(API + '/patients/' + id);
    const p = await res.json();
    return `
      <div class="container">
        <div class="card">
          <div style="display:flex;justify-content:space-between;align-items:center"><div><h2>${p.name}</h2><div style="color:var(--muted)">${(p.conditions||[]).join(', ')}</div></div><div><button onclick="goHome()">Back</button><button onclick="exportPatient(${p.id})">Export PDF</button></div></div>
        </div>
        <div class="grid" style="margin-top:12px">
          <main class="main card">
            <h3>Vitals</h3>
            <div id="vitalRows">${(p.vitals||[]).map(v=>`<div class="vital-row">${v.time} • HR:${v.hr} • BP:${v.bp} • SpO2:${v.spo2}</div>`).join('') || '<div>No vitals</div>'}</div>
            <canvas id="chartVitals" height="160"></canvas>
          </main>
          <aside class="card">
            <h3>AI Insights</h3><div id="aiInsights">Loading...</div>
            <h3 style="margin-top:12px">Medications</h3><div id="medications">${(p.meds||[]).map(m=>`<div>${m.name} • ${m.time}</div>`).join('') || '<div>No meds</div>'}</div>
          </aside>
        </div>
      </div>
    `;
  }catch(e){ console.error(e); return '<div class="container"><div class="card">Failed to load patient</div></div>'; }
}

function doctorHTML(){
  return `
  <div class="container">
    <div class="card"><h3>Doctor View — Consolidated</h3><canvas id="doctorChart" height="180"></canvas></div>
    <div class="card" style="margin-top:12px"><h3>Adherence</h3><canvas id="adherenceChart" height="140"></canvas></div>
  </div>`;
}

function attachEvents(){ /* placeholder for UI event wiring */ }

function renderDashboardCharts(){
  const ctx = document.getElementById('overviewChart')?.getContext('2d');
  if(!ctx) return;
  const labels = state.patients.map(p=>p.name);
  const avgSys = state.patients.map(p=>{
    const sys = (p.vitals||[]).map(v=>parseInt((v.bp||'0/0').split('/')[0]||0));
    return sys.length? Math.round(sys.reduce((a,b)=>a+b,0)/sys.length):0;
  });
  if(window.overviewChart) window.overviewChart.destroy();
  window.overviewChart = new Chart(ctx, {type:'bar', data:{ labels, datasets:[{label:'Avg Systolic BP', data:avgSys, backgroundColor: labels.map((_,i)=>`rgba(11,110,153,${0.6 - i*0.1})`)} ]}, options:{plugins:{legend:{display:false}}}});
}

async function renderDoctorCharts(){
  const ctx = document.getElementById('doctorChart')?.getContext('2d');
  if(ctx){
    const labels = state.patients.map(p=>p.name);
    const avgSys = state.patients.map(p=>{
      const sys = (p.vitals||[]).map(v=>parseInt((v.bp||'0/0').split('/')[0]||0));
      return sys.length? Math.round(sys.reduce((a,b)=>a+b,0)/sys.length):0;
    });
    if(window.docChart) window.docChart.destroy();
    window.docChart = new Chart(ctx, {type:'line', data:{labels, datasets:[{label:'Avg Systolic BP',data:avgSys,borderColor:'#E77B24',tension:0.3,fill:true}]}, options:{plugins:{legend:{display:false}}}});
  }
  const ctx2 = document.getElementById('adherenceChart')?.getContext('2d');
  if(ctx2){
    const labels = state.patients.map(p=>p.name);
    const adherence = state.patients.map(p=>{
      const meds = p.meds||[];
      return meds.length? Math.round((meds.filter(m=>m.taken).length / meds.length)*100):0;
    });
    if(window.adChart) window.adChart.destroy();
    window.adChart = new Chart(ctx2, {type:'doughnut', data:{labels, datasets:[{data:adherence, backgroundColor:['#E77B24','#E84998','#B035C9','#F6CFB7']}]}, options:{plugins:{legend:{position:'bottom'}}}});
  }
}

async function exportPatient(id){
  const el = document.getElementById('root');
  const canvas = await html2canvas(el, {scale:2});
  const img = canvas.toDataURL('image/png');
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF('p','pt','a4');
  const imgProps = pdf.getImageProperties(img);
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
  pdf.addImage(img, 'PNG', 0, 0, pdfWidth, pdfHeight);
  pdf.save('patient_report.pdf');
}

window.addEventListener('load', ()=>{ render(); });
