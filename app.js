"use strict";
const KEY="acts_ems_nc3_registrations";
const $=id=>document.getElementById(id);
let registrations=[];
try{registrations=JSON.parse(localStorage.getItem(KEY)||"[]");if(!Array.isArray(registrations))registrations=[]}catch{registrations=[]}
const save=()=>localStorage.setItem(KEY,JSON.stringify(registrations));
const safe=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function showTab(tab){document.querySelectorAll(".tab").forEach(b=>b.classList.toggle("active",b.dataset.tab===tab));document.querySelectorAll(".view").forEach(v=>v.classList.toggle("active",v.id===tab));if(tab==="records")renderRecords()}
document.querySelectorAll(".tab").forEach(b=>b.addEventListener("click",()=>showTab(b.dataset.tab)));
function regNo(){const d=new Date(),stamp=[d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("");return "ACTS-"+stamp+"-"+Math.random().toString(36).slice(2,6).toUpperCase()}
$("registration-form").addEventListener("submit",e=>{
 e.preventDefault();const data=Object.fromEntries(new FormData(e.currentTarget).entries());
 if(!data.consent){$("form-message").textContent="Please confirm the consent statement.";return}
 data.registrationNo=regNo();data.registeredAt=new Date().toISOString();registrations.unshift(data);save();e.currentTarget.reset();
 $("form-message").textContent="Registration submitted successfully. Registration No.: "+data.registrationNo;
});
function renderRecords(){
 const q=$("search").value.trim().toLowerCase();
 const rows=registrations.filter(r=>[r.fullName,r.contact,r.email,r.registrationNo].join(" ").toLowerCase().includes(q));
 $("records-body").innerHTML=rows.map(r=>`<tr><td><strong>${safe(r.registrationNo)}</strong></td><td>${safe(r.fullName)}</td><td>${safe(r.contact)}</td><td>${safe(r.email||"—")}</td><td>${safe(r.preferredDate||"—")}</td><td>${safe(new Date(r.registeredAt).toLocaleDateString())}</td><td class="no-print"><button type="button" data-delete="${safe(r.registrationNo)}">Delete</button></td></tr>`).join("");
 $("count").textContent=rows.length+" applicant"+(rows.length===1?"":"s");$("empty").hidden=rows.length>0;
}
$("search").addEventListener("input",renderRecords);
$("records-body").addEventListener("click",e=>{const no=e.target.dataset.delete;if(!no)return;if(confirm("Delete this registration record?")){registrations=registrations.filter(r=>r.registrationNo!==no);save();renderRecords()}});
$("export").addEventListener("click",()=>{
 const cols=["registrationNo","fullName","birthDate","sex","contact","email","address","preferredDate","experience","registeredAt"];
 const csv=[cols.join(","),...registrations.map(r=>cols.map(k=>'"'+String(r[k]??"").replace(/"/g,'""')+'"').join(","))].join("\r\n");
 const blob=new Blob(["\ufeff"+csv],{type:"text/csv;charset=utf-8"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="ACTS_EMS_NCIII_Registrations.csv";a.click();URL.revokeObjectURL(url);
});
$("print").addEventListener("click",()=>window.print());
renderRecords();
