const API_URL = "https://script.google.com/macros/s/AKfycby79xvbf8cLHF5OY-_nUGuspL6e7gy2fujRtmSbgPpH5NbaRu1OyLjSRioEoJHa8Mq_/exec";
let CREDS = JSON.parse(localStorage.getItem("bonus_creds") || "null");
let state = {user:{},settings:{},agents:[],players:[],nega:[],dashboard:{},users:[]};

const $=id=>document.getElementById(id);
const money=n=>"₱"+Number(n||0).toLocaleString("en-PH",{minimumFractionDigits:0,maximumFractionDigits:2});
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
function showMessage(msg,error=true){const e=$("message");e.textContent=msg;e.style.display="block";e.className="message "+(error?"error":"success");setTimeout(()=>e.style.display="none",3500);}
async function api(action,method="GET",data={}){
  if(API_URL.includes("PASTE_"))throw new Error("Set API_URL in frontend/app.js first.");
  if(!CREDS)throw new Error("Please log in.");
  let r;
  if(method==="GET"){r=await fetch(API_URL+"?"+new URLSearchParams({action,username:CREDS.username,password:CREDS.password}));}
  else{r=await fetch(API_URL,{method:"POST",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify({action,username:CREDS.username,password:CREDS.password,data})});}
  const j=await r.json();if(!j.ok)throw new Error(j.error);return j.result;
}
async function login(){
  const username=$("loginUser").value.trim(),password=$("loginPass").value;
  if(!username||!password)return showMessage("Enter username and password.");
  CREDS={username,password};localStorage.setItem("bonus_creds",JSON.stringify(CREDS));
  try{await load();$("login").classList.add("hidden");$("app").classList.remove("hidden");}
  catch(e){CREDS=null;localStorage.removeItem("bonus_creds");showMessage(e.message);}
}
function logout(){CREDS=null;localStorage.removeItem("bonus_creds");location.reload();}
async function load(){
  state=await api("bootstrap");
  $("role").textContent=state.user.role==="ADMIN"?"ADMIN":"AGENT";
  $("welcome").textContent=state.user.role==="ADMIN"?"Admin Dashboard":"Agent Dashboard";
  render();
}
function render(){
  const d=state.dashboard||{};
  $("statAgents").textContent=d.agents||0;$("statQualified").textContent=d.qualifiedAgents||0;
  $("statNega").textContent=money(d.totalNega);$("statPoints").textContent=Number(d.totalPoints||0).toFixed(1);$("statBonus").textContent=money(d.totalBonus);
  $("dashboardTable").innerHTML=table(["Agent","Extreme","Maxwin","Unique","Qualified","NEGA","Points","Bonus"],(d.summaries||[]).map(x=>[esc(x.name),x.extremeActive,x.maxwinActive,x.uniqueTotal,x.qualified?yes("QUALIFIED"):no("NOT QUALIFIED"),money(x.totalNega),Number(x.totalPoints).toFixed(1),money(x.bonus)]));
  if(state.user.role==="ADMIN"){
    $("adminTab").style.display="block";$("usersTab").style.display="block";
    $("agentsTable").innerHTML=table(["ID","Name","Status","Action"],state.agents.map(a=>[esc(a.AGENT_ID),esc(a.NAME),esc(a.STATUS),`<button onclick="deleteAgent('${esc(a.AGENT_ID)}')">Delete</button>`]));
    $("usersTable").innerHTML=table(["Username","Role","Agent","Status","Action"],state.users.map(u=>[esc(u.USERNAME),esc(u.ROLE),esc(u.AGENT_ID||"—"),esc(u.STATUS),`<button onclick="deleteUser('${esc(u.USER_ID)}')">Disable</button>`]));
  }
  fillAgentSelects();
  $("playersTable").innerHTML=table(["Agent","Player","Site","Active","Action"],state.players.map(p=>{const a=(state.agents.find(x=>String(x.AGENT_ID)===String(p.AGENT_ID))||{}).NAME||p.AGENT_ID;const active=String(p.ACTIVE).toUpperCase()==="TRUE";return[esc(a),esc(p.PLAYER_NAME),esc(p.SITE),active?yes("ACTIVE"):no("INACTIVE"),`<button onclick="togglePlayer('${esc(p.PLAYER_ID)}',${!active})">${active?"Deactivate":"Activate"}</button>`]}));
  $("negaTable").innerHTML=table(["Agent","Cutoff","Extreme","Maxwin","Combined","Points","Bonus"],state.nega.map(n=>{const a=(state.agents.find(x=>String(x.AGENT_ID)===String(n.AGENT_ID))||{}).NAME||n.AGENT_ID;return[esc(a),formatDate(n.CUTOFF_DATE),money(n.EXTREME_NEGA),money(n.MAXWIN_NEGA),money(n.COMBINED_NEGA),Number(n.POINTS).toFixed(1),money(n.BONUS_VALUE)]}));
  $("bonusTable").innerHTML=table(["Agent","Extreme Players","Maxwin Players","Unique","Qualified","Total NEGA","Points","Christmas Bonus"],(d.summaries||[]).map(x=>[esc(x.name),x.extremeActive,x.maxwinActive,x.uniqueTotal,x.qualified?yes("QUALIFIED"):no("NOT QUALIFIED"),money(x.totalNega),Number(x.totalPoints).toFixed(1),money(x.bonus)]));
}
function yes(t){return `<span class="badge yes">${t}</span>`}function no(t){return `<span class="badge no">${t}</span>`}
function table(h,rows){return "<thead><tr>"+h.map(x=>`<th>${x}</th>`).join("")+"</tr></thead><tbody>"+rows.map(r=>"<tr>"+r.map(x=>`<td>${x}</td>`).join("")+"</tr>").join("")+"</tbody>"}
function formatDate(v){const d=new Date(v);return isNaN(d)?String(v||""):d.toISOString().slice(0,10)}
function fillAgentSelects(){["playerAgent","negaAgent","userAgent"].forEach(id=>{const e=$(id);if(!e)return;const old=e.value;e.innerHTML='<option value="">Select agent</option>'+state.agents.map(a=>`<option value="${esc(a.AGENT_ID)}">${esc(a.NAME)}</option>`).join("");if(old)e.value=old;});}
$("loginBtn").onclick=login;$("logoutBtn").onclick=logout;
$("agentForm").onsubmit=async e=>{e.preventDefault();try{await api("saveAgent","POST",{agentId:$("agentId").value,name:$("agentName").value});e.target.reset();await load();}catch(x){showMessage(x.message)}};
$("userForm").onsubmit=async e=>{e.preventDefault();try{await api("saveUser","POST",{username:$("newUsername").value,password:$("newPassword").value,role:$("newRole").value,agentId:$("userAgent").value,status:"ACTIVE"});e.target.reset();await load();}catch(x){showMessage(x.message)}};
$("playerForm").onsubmit=async e=>{e.preventDefault();try{await api("savePlayer","POST",{agentId:$("playerAgent").value,playerName:$("playerName").value,site:$("playerSite").value,active:true});e.target.reset();await load();}catch(x){showMessage(x.message)}};
$("negaForm").onsubmit=async e=>{e.preventDefault();try{await api("saveNega","POST",{agentId:$("negaAgent").value,cutoffDate:$("cutoffDate").value,extremeNega:$("extremeNega").value,maxwinNega:$("maxwinNega").value});e.target.reset();await load();}catch(x){showMessage(x.message)}};
async function deleteAgent(id){if(!confirm("Delete this agent?"))return;try{await api("deleteAgent","POST",{agentId:id});await load()}catch(e){showMessage(e.message)}}
async function deleteUser(id){if(!confirm("Disable this user?"))return;try{await api("deleteUser","POST",{userId:id});await load()}catch(e){showMessage(e.message)}}
async function togglePlayer(id,active){try{await api("togglePlayer","POST",{playerId:id,active});await load()}catch(e){showMessage(e.message)}}
document.querySelectorAll(".tab").forEach(b=>b.onclick=()=>{document.querySelectorAll(".tab").forEach(x=>x.classList.remove("active"));document.querySelectorAll(".panel").forEach(x=>x.classList.remove("active"));b.classList.add("active");$(b.dataset.tab).classList.add("active")});

if(CREDS){$("login").classList.add("hidden");$("app").classList.remove("hidden");load().catch(e=>{showMessage(e.message);logout()});}
