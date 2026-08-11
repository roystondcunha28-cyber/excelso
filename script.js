"use strict";

const API_URL = "https://script.google.com/macros/s/AKfycbyrOAQZ--7aDiAHv0ey60C8-xXuTKDAhOVDQjUOc-uiGdgNnpuJ97nL4m-ABkw0Znf3ig/exec";
const LOGIN_PASSWORD = "admin123";
const REFRESH_INTERVAL_MS = 60000;

const DEPARTMENTS = [
 "B2B / Sales","Customer Support","Warehouse","Scanning / Catalog",
 "Listing / Inventory","Digital Marketing","IT / Software Development",
 "Finance","Book Fair / Events","Books & Supply Procurement","HR",
 "Data Analysis","Software Testing","Product Development"
];

const DEPARTMENT_CODES = {
 "B2B / Sales":"B2B","Customer Support":"CS","Warehouse":"WH",
 "Scanning / Catalog":"SC","Listing / Inventory":"LI","Digital Marketing":"DM",
 "IT / Software Development":"IT","Finance":"FN","Book Fair / Events":"BF",
 "Books & Supply Procurement":"BP","HR":"HR","Data Analysis":"DA",
 "Software Testing":"ST","Product Development":"PD"
};

let tasks = [];
let currentDepartment = "";
let refreshTimer = null;
let loading = false;

const $ = id => document.getElementById(id);
const text = (id,v) => { const e=$(id); if(e) e.textContent = v ?? ""; };
const val = id => $(id)?.value ?? "";
const setVal = (id,v) => { const e=$(id); if(e) e.value = v ?? ""; };

function escapeHTML(v){
 return String(v ?? "").replace(/&/g,"&amp;").replace(/</g,"&lt;")
   .replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;");
}

function today(){
 const d=new Date();
 return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}
function parseDate(v){
 if(!v) return null;
 if(v instanceof Date) return isNaN(v) ? null : v;
 const s=String(v).trim();
 let m=s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
 if(m) return new Date(+m[1],+m[2]-1,+m[3]);
 const d=new Date(s); return isNaN(d) ? null : d;
}
function inputDate(v){
 const d=parseDate(v); if(!d) return "";
 return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}
function displayDate(v){
 const d=parseDate(v); if(!d) return v ? String(v) : "-";
 return d.toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"});
}
function overdue(t){
 if(!t?.dueDate || ["completed","cancelled"].includes(String(t.status).toLowerCase())) return false;
 const d=parseDate(t.dueDate), n=parseDate(today());
 return !!d && !!n && d<n;
}
function dueToday(v){
 const d=parseDate(v), n=parseDate(today());
 return !!d && !!n && d.getTime()===n.getTime();
}
function beforeToday(v){
 const d=parseDate(v), n=parseDate(today());
 return !!d && !!n && d<n;
}

function notify(title,msg){
 const n=$("notification"); if(!n) return;
 text("notificationTitle",title); text("notificationMessage",msg);
 n.classList.add("show"); clearTimeout(notify.timer);
 notify.timer=setTimeout(()=>n.classList.remove("show"),3500);
}

function showLogin(){
 $("loginScreen")?.style && ($("loginScreen").style.display="flex");
 const app=$("app"); if(app) app.style.display="none";
}
function showApp(){
 const l=$("loginScreen"); if(l) l.style.display="none";
 const app=$("app"); if(app) app.style.display="flex";
}
function initLogin(){
 const form=$("loginForm"); if(!form) return;
 form.addEventListener("submit",e=>{
   e.preventDefault();
   const p=val("loginPassword").trim();
   if(p===LOGIN_PASSWORD){
     sessionStorage.setItem("usedbookrOperationsLogin","true");
     $("loginError")?.classList.remove("show");
     setVal("loginPassword","");
     showApp(); loadTasks(true);
   }else{
     const er=$("loginError");
     if(er){er.textContent="Incorrect password. Please try again.";er.classList.add("show");}
     setVal("loginPassword",""); $("loginPassword")?.focus();
   }
 });
}
function checkLogin(){
 if(sessionStorage.getItem("usedbookrOperationsLogin")==="true"){showApp();loadTasks(false)}
 else showLogin();
}
function initLogout(){
 $("logoutButton")?.addEventListener("click",()=>{
   sessionStorage.removeItem("usedbookrOperationsLogin"); showLogin(); setVal("loginPassword",""); $("loginPassword")?.focus();
 });
}

async function api(action,data={}){
 try{
   const r=await fetch(API_URL,{
     method:"POST",
     headers:{"Content-Type":"text/plain;charset=utf-8"},
     body:JSON.stringify({action,...data})
   });
   const raw=await r.text();
   let json; try{json=JSON.parse(raw)}catch{throw new Error("API returned non-JSON data.")};
   return json;
 }catch(e){
   console.error(e); notify("Connection Error",e.message||"Unable to connect to Google Sheets.");
   return {success:false,message:e.message};
 }
}

function first(o,keys,f=""){
 for(const k of keys) if(o?.[k]!==undefined && o?.[k]!==null && String(o[k]).trim()!=="") return o[k];
 return f;
}
function normalizeRows(rows){
 return (Array.isArray(rows)?rows:[]).map((r,i)=>({
  taskId:String(first(r,["Task ID","taskId","TaskID","id"],`T${String(i+1).padStart(3,"0")}`)),
  department:String(first(r,["Department","department"])),
  task:String(first(r,["Task","task","Title","title"])),
  description:String(first(r,["Description","description"])),
  assignedTo:String(first(r,["Assigned To","assignedTo","Assignee","assignee"])),
  priority:String(first(r,["Priority","priority"],"Medium")),
  status:String(first(r,["Status","status"],"Open")),
  createdDate:inputDate(first(r,["Created Date","createdDate"])),
  dueDate:inputDate(first(r,["Due Date","dueDate"])),
  followupDate:inputDate(first(r,["Follow-up Date","followupDate","Followup Date"])),
  lastAction:String(first(r,["Last Action / Follow-up","Last Action","lastAction","Follow-up / Action Taken"])),
  remarks:String(first(r,["Remarks","remarks"])),
  updatedBy:String(first(r,["Updated By","updatedBy"])),
  updatedDate:String(first(r,["Updated Date","updatedDate"]))
 }));
}

async function loadTasks(showMsg=true){
 if(loading) return; loading=true;
 try{
   if(showMsg) notify("Refreshing","Loading latest data from Google Sheets...");
   const r=await api("getTasks");
   if(!r.success){notify("Data Error",r.message||"Unable to load tasks.");return}
   tasks=normalizeRows(r.tasks||[]);
   updateAll();
   text("dataSourceStatus","Google Sheets — Connected");
   if(showMsg) notify("Updated",`${tasks.length} task(s) loaded from Google Sheets.`);
 }finally{loading=false}
}

function initDepartments(){
 const s=$("taskDepartment"), f=$("departmentFilter");
 if(s){s.innerHTML='<option value="">Select Department</option>';DEPARTMENTS.forEach(d=>s.add(new Option(d,d)))}
 if(f){f.innerHTML='<option value="">All Departments</option>';DEPARTMENTS.forEach(d=>f.add(new Option(d,d)))}
 renderDepartments();
}
function code(d){return DEPARTMENT_CODES[d]||"DP"}

function badgePriority(p){
 const x=String(p||"Medium"), c=x.toLowerCase().replace(/\s+/g,"-");
 return `<span class="priority-badge priority-${c}">${escapeHTML(x)}</span>`;
}
function badgeStatus(s,t){
 let x=s||"Open"; if(!["Completed","Cancelled"].includes(x)&&overdue(t)) x="Overdue";
 const c=x.toLowerCase().replace(/\s+/g,"-");
 return `<span class="status-badge status-${c}">${escapeHTML(x)}</span>`;
}

function updateDashboard(){
 text("totalTasks",tasks.length);
 text("openTasks",tasks.filter(t=>t.status==="Open").length);
 text("progressTasks",tasks.filter(t=>t.status==="In Progress").length);
 text("blockedTasks",tasks.filter(t=>t.status==="Blocked").length);
 text("completedTasks",tasks.filter(t=>t.status==="Completed").length);
 text("overdueTasks",tasks.filter(overdue).length);
 text("highPriorityCount",tasks.filter(t=>t.priority==="High").length);
 text("mediumPriorityCount",tasks.filter(t=>t.priority==="Medium").length);
 text("lowPriorityCount",tasks.filter(t=>t.priority==="Low").length);
 const td=tasks.filter(t=>dueToday(t.followupDate)).length;
 const od=tasks.filter(t=>beforeToday(t.followupDate)).length;
 const up=tasks.filter(t=>{const d=parseDate(t.followupDate),n=parseDate(today());return d&&n&&d>n}).length;
 ["followupsToday","followupPageToday"].forEach(id=>text(id,td));
 ["followupsOverdue","followupPageOverdue"].forEach(id=>text(id,od));
 ["followupsUpcoming","followupPageUpcoming"].forEach(id=>text(id,up));
}

function renderRecent(){
 const b=$("recentTasksTable"); if(!b)return;
 const a=[...tasks].sort((x,y)=>String(y.updatedDate).localeCompare(String(x.updatedDate))).slice(0,10);
 b.innerHTML=a.length?a.map(t=>`<tr><td>${escapeHTML(t.taskId)}</td><td>${escapeHTML(t.task)}</td><td>${escapeHTML(t.department)}</td><td>${escapeHTML(t.assignedTo)}</td><td>${badgePriority(t.priority)}</td><td>${badgeStatus(t.status,t)}</td><td>${displayDate(t.dueDate)}</td></tr>`).join(""):`<tr><td colspan="7" class="empty-table">No tasks available.</td></tr>`;
}

function filteredTasks(){
 const q=val("taskSearch").trim().toLowerCase(), d=val("departmentFilter"), p=val("priorityFilter"), s=val("statusFilter");
 return tasks.filter(t=>{
   const hay=[t.taskId,t.task,t.description,t.assignedTo,t.department,t.priority,t.status,t.lastAction,t.remarks].join(" ").toLowerCase();
   if(q&&!hay.includes(q))return false; if(d&&t.department!==d)return false; if(p&&t.priority!==p)return false;
   if(s==="Overdue")return overdue(t); if(s&&t.status!==s)return false; return true;
 });
}
function renderTasks(){
 const b=$("allTasksTable"); if(!b)return; const a=filteredTasks();
 b.innerHTML=a.length?a.map(t=>`<tr><td>${escapeHTML(t.taskId)}</td><td><strong>${escapeHTML(t.task)}</strong></td><td>${escapeHTML(t.department)}</td><td>${escapeHTML(t.assignedTo)}</td><td>${badgePriority(t.priority)}</td><td>${badgeStatus(t.status,t)}</td><td>${displayDate(t.dueDate)}</td><td><button class="table-action edit-task" data-id="${escapeHTML(t.taskId)}">Edit</button></td></tr>`).join(""):`<tr><td colspan="8" class="empty-table">No matching tasks available.</td></tr>`;
 b.querySelectorAll(".edit-task").forEach(x=>x.addEventListener("click",()=>editTask(x.dataset.id)));
}

function renderFollowups(){
 const b=$("followupsTable"); if(!b)return;
 const a=tasks.filter(t=>t.followupDate).sort((x,y)=>x.followupDate.localeCompare(y.followupDate));
 b.innerHTML=a.length?a.map(t=>`<tr><td>${escapeHTML(t.taskId)}</td><td>${escapeHTML(t.task)}</td><td>${escapeHTML(t.department)}</td><td>${escapeHTML(t.assignedTo)}</td><td>${displayDate(t.followupDate)}</td><td>${escapeHTML(t.lastAction||"-")}</td><td>${badgeStatus(t.status,t)}</td></tr>`).join(""):`<tr><td colspan="7" class="empty-table">No follow-ups available.</td></tr>`;
}

function renderDepartments(){
 const b=$("departmentsGrid"); if(!b)return;
 b.innerHTML=DEPARTMENTS.map(d=>{
  const a=tasks.filter(t=>t.department===d),c=a.filter(t=>t.status==="Completed").length,bl=a.filter(t=>t.status==="Blocked").length,o=a.filter(overdue).length;
  return `<div class="department-card"><div class="department-card-code">${code(d)}</div><h3>${escapeHTML(d)}</h3><div class="department-card-stats"><div><strong>${a.length}</strong><span>Total</span></div><div><strong>${c}</strong><span>Completed</span></div><div><strong>${bl}</strong><span>Blocked</span></div><div><strong>${o}</strong><span>Overdue</span></div></div><button class="secondary-button department-view-button" data-department="${escapeHTML(d)}">View Department</button></div>`;
 }).join("");
 b.querySelectorAll(".department-view-button").forEach(x=>x.addEventListener("click",()=>openDepartment(x.dataset.department)));
}
function renderPerformance(){
 const b=$("departmentPerformance"); if(!b)return;
 b.innerHTML=DEPARTMENTS.map(d=>{
  const a=tasks.filter(t=>t.department===d), pct=a.length?Math.round(a.filter(t=>t.status==="Completed").length/a.length*100):0;
  return `<div class="department-performance-row"><div class="department-performance-name"><strong>${escapeHTML(d)}</strong><span>${a.length} task(s)</span></div><div class="department-progress"><div class="department-progress-bar" style="width:${pct}%"></div></div><strong>${pct}%</strong></div>`;
 }).join("");
}
function renderAnalysis(){
 const b=$("analysisTable"); if(!b)return;
 b.innerHTML=DEPARTMENTS.map(d=>{
  const a=tasks.filter(t=>t.department===d), total=a.length, completed=a.filter(t=>t.status==="Completed").length;
  return `<tr><td>${escapeHTML(d)}</td><td>${total}</td><td>${a.filter(t=>t.status==="Open").length}</td><td>${a.filter(t=>t.status==="In Progress").length}</td><td>${a.filter(t=>t.status==="Blocked").length}</td><td>${a.filter(overdue).length}</td><td>${completed}</td><td>${total?Math.round(completed/total*100):0}%</td></tr>`;
 }).join("");
}
function renderActivity(){
 const b=$("activityTimeline"); if(!b)return;
 const a=[...tasks].sort((x,y)=>String(y.updatedDate).localeCompare(String(x.updatedDate))).slice(0,30);
 b.innerHTML=a.length?a.map(t=>`<div class="activity-item"><div class="activity-dot"></div><div class="activity-content"><strong>${escapeHTML(t.task)}</strong><p>${escapeHTML(t.status)} · ${escapeHTML(t.department)}</p><small>Updated by ${escapeHTML(t.updatedBy||"System")} · ${escapeHTML(displayDate(t.updatedDate))}</small></div></div>`).join(""):`<div class="empty-state">No activity recorded yet.</div>`;
}

function renderDepartmentDetail(d){
 const a=tasks.filter(t=>t.department===d);
 text("departmentDetailCode",code(d));text("departmentDetailTitle",d);text("departmentDetailSubtitle","Department operational overview and task monitoring.");
 text("departmentTotal",a.length);text("departmentOpen",a.filter(t=>t.status==="Open").length);text("departmentProgress",a.filter(t=>t.status==="In Progress").length);text("departmentBlocked",a.filter(t=>t.status==="Blocked").length);text("departmentOverdue",a.filter(overdue).length);text("departmentCompleted",a.filter(t=>t.status==="Completed").length);
 const b=$("departmentTasksTable"); if(!b)return;
 b.innerHTML=a.length?a.map(t=>`<tr><td>${escapeHTML(t.taskId)}</td><td>${escapeHTML(t.task)}</td><td>${escapeHTML(t.assignedTo)}</td><td>${badgePriority(t.priority)}</td><td>${badgeStatus(t.status,t)}</td><td>${displayDate(t.dueDate)}</td><td>${displayDate(t.followupDate)}</td><td><button class="table-action edit-department-task" data-id="${escapeHTML(t.taskId)}">Edit</button></td></tr>`).join(""):`<tr><td colspan="8" class="empty-table">No department tasks available.</td></tr>`;
 b.querySelectorAll(".edit-department-task").forEach(x=>x.addEventListener("click",()=>editTask(x.dataset.id)));
}
function openDepartment(d){
 currentDepartment=d;
 document.querySelectorAll(".page").forEach(p=>p.classList.remove("active-page"));
 $("departmentDetailPage")?.classList.add("active-page");
 renderDepartmentDetail(d);
 document.querySelectorAll(".nav-item").forEach(n=>n.classList.toggle("active",n.dataset.department===d));
 text("pageTitle",d); text("pageSubtitle","Department operational overview and task monitoring");
}

function showPage(page){
 currentDepartment="";
 document.querySelectorAll(".page").forEach(p=>p.classList.remove("active-page"));
 const p=$(page+"Page"); if(p)p.classList.add("active-page");
 document.querySelectorAll(".nav-item").forEach(n=>n.classList.toggle("active",(n.dataset.page||"")===page));
 const names={dashboard:["Operations Dashboard","Centralized operational monitoring"],tasks:["All Tasks","Manage tasks across all departments"],followups:["Follow-ups","Monitor commitments and pending actions"],reports:["Reports & Analysis","Analyze operational performance"],activity:["Activity Log","Track operational changes"],settings:["Settings","System configuration"],departments:["Departments","All 14 departments and their operational workload"]};
 if(names[page]){text("pageTitle",names[page][0]);text("pageSubtitle",names[page][1])}
}
function initNavigation(){
 document.querySelectorAll(".nav-item").forEach(n=>n.addEventListener("click",()=>{
  if(n.dataset.department)return openDepartment(n.dataset.department);
  if(n.dataset.page)showPage(n.dataset.page);
 }));
 $("menuToggle")?.addEventListener("click",()=>document.querySelector(".sidebar")?.classList.toggle("sidebar-open"));
}

function clearForm(){
 $("taskForm")?.reset();setVal("editTaskId","");setVal("taskStatus","Open");setVal("taskPriority","Medium");setVal("taskCreatedDate",today());
}
function populate(t){
 setVal("editTaskId",t.taskId);setVal("taskName",t.task);setVal("taskDepartment",t.department);setVal("taskAssignedTo",t.assignedTo);
 setVal("taskPriority",t.priority);setVal("taskStatus",t.status);setVal("taskCreatedDate",t.createdDate);setVal("taskDueDate",t.dueDate);
 setVal("taskFollowupDate",t.followupDate);setVal("taskFollowupAction",t.lastAction);setVal("taskRemarks",t.remarks);
}
function openModal(t=null){
 const m=$("taskModal");if(!m)return;m.style.display="flex";
 text("taskModalTitle",t?"Edit Task":"Add New Task");
 if(t)populate(t);else{clearForm();if(currentDepartment)setVal("taskDepartment",currentDepartment)}
}
function closeModal(){const m=$("taskModal");if(m)m.style.display="none"}
async function saveTask(){
 const edit=val("editTaskId");
 const t={taskId:edit,department:val("taskDepartment"),task:val("taskName").trim(),assignedTo:val("taskAssignedTo").trim(),priority:val("taskPriority"),status:val("taskStatus"),createdDate:val("taskCreatedDate")||today(),dueDate:val("taskDueDate"),followupDate:val("taskFollowupDate"),lastAction:val("taskFollowupAction"),remarks:val("taskRemarks"),updatedBy:"Operations Head"};
 if(!t.task||!t.department||!t.assignedTo||!t.dueDate){notify("Missing Information","Please complete Task, Department, Assigned To and Due Date.");return}
 const r=await api(edit?"updateTask":"addTask",{task:t});
 if(!r.success){notify("Save Error",r.message||"Unable to save task.");return}
 closeModal();notify("Saved","Task saved to Google Sheets successfully.");await loadTasks(false);
}
function editTask(id){const t=tasks.find(x=>String(x.taskId)===String(id));if(t)openModal(t);else notify("Error","Task not found.");}
function initModal(){
 ["topAddTask","dashboardAddTask","tasksAddButton","departmentAddTaskButton"].forEach(id=>$(id)?.addEventListener("click",()=>openModal()));
 $("closeTaskModal")?.addEventListener("click",closeModal);$("cancelTaskButton")?.addEventListener("click",closeModal);
 $("taskModal")?.addEventListener("click",e=>{if(e.target===$("taskModal"))closeModal()});
 $("taskForm")?.addEventListener("submit",e=>{e.preventDefault();saveTask()});
}
function initFilters(){
 ["taskSearch","departmentFilter","priorityFilter","statusFilter"].forEach(id=>{const e=$(id);if(e){e.addEventListener("input",renderTasks);e.addEventListener("change",renderTasks)}});
}
function initExport(){
 const btn=$("exportTasksButton")||$("exportAllButton")||$("exportExcelButton"); if(btn)btn.addEventListener("click",exportCSV);
}
function exportCSV(){
 if(!tasks.length){notify("Export","There are no tasks to export.");return}
 const h=["Task ID","Department","Task","Description","Assigned To","Priority","Status","Created Date","Due Date","Follow-up Date","Last Action","Remarks","Updated By","Updated Date"];
 const rows=tasks.map(t=>[t.taskId,t.department,t.task,t.description,t.assignedTo,t.priority,t.status,t.createdDate,t.dueDate,t.followupDate,t.lastAction,t.remarks,t.updatedBy,t.updatedDate]);
 const csv=[h,...rows].map(r=>r.map(v=>`"${String(v??"").replace(/"/g,'""')}"`).join(",")).join("\n");
 const a=document.createElement("a");a.href=URL.createObjectURL(new Blob(["\ufeff"+csv],{type:"text/csv;charset=utf-8"}));a.download="UsedBookR_Operations_Tasks.csv";document.body.appendChild(a);a.click();a.remove();
}
function initRefresh(){
 let b=$("refreshDataButton"); if(!b){const r=document.querySelector(".topbar-right");if(r){b=document.createElement("button");b.id="refreshDataButton";b.className="secondary-button";b.textContent="↻ Refresh";r.insertBefore(b,r.firstChild)}} b?.addEventListener("click",()=>loadTasks(true));
}
function updateAll(){
 updateDashboard();renderRecent();renderTasks();renderFollowups();renderDepartments();renderPerformance();renderAnalysis();renderActivity();
 if(currentDepartment)renderDepartmentDetail(currentDepartment);
}
document.addEventListener("DOMContentLoaded",()=>{
 initDepartments();initNavigation();initModal();initFilters();initExport();initRefresh();initLogout();initLogin();checkLogin();
 setInterval(()=>{if(sessionStorage.getItem("usedbookrOperationsLogin")==="true")loadTasks(false)},REFRESH_INTERVAL_MS);
});
window.UsedBookROperations={reload:()=>loadTasks(true),getTasks:()=>tasks,openDepartment,editTask};
