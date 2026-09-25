/* HH Teams V3.1: simple local division/team management, compatible with V3.0 saved data. */
'use strict';
const KEY='hh-teams-program-v30', $=id=>document.getElementById(id), clean=v=>String(v||'').trim();
const escape=v=>String(v||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,8);
let db;try{db=JSON.parse(localStorage.getItem(KEY)||'null')||{program:'',divisions:[],teams:[]};if(!Array.isArray(db.divisions)||!Array.isArray(db.teams))throw Error('Invalid')}catch(e){db={program:'',divisions:[],teams:[]}}
let current='';
function save(msg='Saved on this device.'){try{localStorage.setItem(KEY,JSON.stringify(db));$('status').textContent=msg}catch(e){$('status').textContent='Could not save: device storage unavailable.'}}
const team=()=>db.teams.find(t=>t.id===current);
function render(){
 $('program').value=db.program||'';
 let previous=$('quickDivision').value;
 $('quickDivision').innerHTML='<option value="new">+ New division</option>'+db.divisions.map(d=>`<option value="${d.id}">${escape(d.name)}</option>`).join('');
 if(db.divisions.some(d=>d.id===previous))$('quickDivision').value=previous;
 $('divisionName').classList.toggle('hide',$('quickDivision').value!=='new');
 $('divisionList').innerHTML=db.divisions.map(d=>`<div class="group"><div class="group-head"><strong>${escape(d.name)}</strong><button class="secondary mini" data-rename-division="${d.id}">Edit name</button><button class="danger mini" data-delete-division="${d.id}">Delete</button></div>${db.teams.filter(t=>t.division===d.id).map(t=>`<div class="team-item"><strong>${escape(t.name)}</strong><span class="muted note">${t.roster.length} athletes</span><button class="mini" data-manage="${t.id}">Manage</button><button class="danger mini" data-delete-team="${t.id}">Delete</button></div>`).join('')||'<p class="muted">No teams yet.</p>'}</div>`).join('')||'<p class="muted">Start by creating your first division and team above.</p>';
 renderTeam();
}
function renderTeam(){const t=team();$('teamTools').classList.toggle('hide',!t);if(!t)return;
 $('editingTeamTitle').textContent='Manage '+t.name;$('editTeamName').value=t.name;
 $('moveDivision').innerHTML=db.divisions.map(d=>`<option value="${d.id}">${escape(d.name)}</option>`).join('');$('moveDivision').value=t.division;
 $('roster').innerHTML=t.roster.map((a,i)=>`<div class="team-item"><strong>${escape(a)}</strong><button class="secondary mini" data-edit-athlete="${i}">Edit</button><button class="danger mini" data-remove-athlete="${i}">Remove</button></div>`).join('')||'<p class="muted">No athletes yet.</p>';
 $('coaches').innerHTML=t.coaches.map(c=>`<div class="group"><div class="row"><strong style="flex:1">${escape(c.name)}</strong><button class="secondary mini" data-edit-coach="${c.id}">Edit</button><button class="danger mini" data-remove-coach="${c.id}">Remove</button></div>${[['view','View roster and lineup'],['scores','Enter scores'],['edit','Edit roster and lineup'],['sub','Make substitutions'],['approval','Require approval for lineup changes']].map(([k,label])=>`<label class="check"><input type="checkbox" data-coach="${c.id}" data-permission="${k}" ${c.permissions[k]?'checked':''}>${label}</label>`).join('')}</div>`).join('')||'<p class="muted">No parent coaches assigned.</p>';
 $('matchLabel').value=t.lineup.label||'';$('matchDate').value=t.lineup.date||'';$('lineupText').value=t.lineup.text||'';
}
$('quickDivision').onchange=()=>{$('divisionName').classList.toggle('hide',$('quickDivision').value!=='new')};
$('saveProgram').onclick=()=>{db.program=clean($('program').value);save();render()};
$('createTeam').onclick=()=>{let division=$('quickDivision').value, dn=clean($('divisionName').value),name=clean($('teamName').value);if(division==='new'&&!dn)return alert('Enter a division name.');if(!name)return alert('Enter a team name.');if(division==='new'){division=uid();db.divisions.push({id:division,name:dn})}let t={id:uid(),division,name,roster:[],coaches:[],lineup:{label:'',date:'',text:''}};db.teams.push(t);current=t.id;save('Team created.');render();$('quickDivision').value=division;$('divisionName').classList.add('hide');$('teamName').value='';$('teamTools').scrollIntoView({behavior:'smooth',block:'start'})};
$('divisionList').onclick=e=>{let el=e.target,id;
 if(id=el.dataset.manage){current=id;renderTeam();$('teamTools').scrollIntoView({behavior:'smooth',block:'start'})}
 else if(id=el.dataset.renameDivision){let d=db.divisions.find(x=>x.id===id);if(!d)return;let name=prompt('Division name:',d.name);if(name===null)return;name=clean(name);if(!name)return alert('Name cannot be empty.');d.name=name;save('Division renamed.');render()}
 else if(id=el.dataset.deleteDivision){let d=db.divisions.find(x=>x.id===id);if(!d)return;let n=db.teams.filter(t=>t.division===id).length;if(n)return alert('Move or delete the '+n+' team(s) in this division first.');if(!confirm('Delete division '+d.name+'?'))return;db.divisions=db.divisions.filter(x=>x.id!==id);save('Division deleted.');render()}
 else if(id=el.dataset.deleteTeam){let t=db.teams.find(x=>x.id===id);if(!t||!confirm('Permanently delete '+t.name+' and its roster, coaches and lineup from this device?'))return;db.teams=db.teams.filter(x=>x.id!==id);if(current===id)current='';save('Team deleted.');render()}
};
$('closeTeam').onclick=()=>{current='';renderTeam();$('divisionList').scrollIntoView({behavior:'smooth',block:'start'})};
$('renameTeam').onclick=()=>{let t=team(),name=clean($('editTeamName').value);if(!t||!name)return alert('Enter a team name.');t.name=name;save('Team renamed.');render()};
$('moveTeam').onclick=()=>{let t=team();if(!t)return;t.division=$('moveDivision').value;save('Team moved.');render()};
$('addAthlete').onclick=()=>{let t=team(),name=clean($('athleteName').value);if(!t||!name)return;t.roster.push(name);$('athleteName').value='';save('Athlete added.');renderTeam()};
$('roster').onclick=e=>{let t=team(),el=e.target,i;if(!t)return;if(el.dataset.editAthlete!==undefined){i=Number(el.dataset.editAthlete);let name=prompt('Edit athlete name:',t.roster[i]);if(name===null)return;if(!clean(name))return alert('Name cannot be empty.');t.roster[i]=clean(name);save('Athlete updated.');renderTeam()}else if(el.dataset.removeAthlete!==undefined){i=Number(el.dataset.removeAthlete);if(!confirm('Remove '+t.roster[i]+' from this team?'))return;t.roster.splice(i,1);save('Athlete removed.');renderTeam()}};
$('addCoach').onclick=()=>{let t=team(),name=clean($('coachName').value);if(!t||!name)return;t.coaches.push({id:uid(),name,permissions:{view:true,scores:true,edit:false,sub:false,approval:false}});$('coachName').value='';save('Coach assigned.');renderTeam()};
$('coaches').onchange=e=>{let id=e.target.dataset.coach,k=e.target.dataset.permission;if(!id||!k)return;let c=team().coaches.find(c=>c.id===id);if(c){c.permissions[k]=e.target.checked;save('Permissions saved locally.')}};
$('coaches').onclick=e=>{let id=e.target.dataset.editCoach||e.target.dataset.removeCoach;if(!id)return;let t=team(),c=t.coaches.find(x=>x.id===id);if(!c)return;if(e.target.dataset.editCoach){let name=prompt('Edit coach name:',c.name);if(name===null)return;if(!clean(name))return alert('Name cannot be empty.');c.name=clean(name);save('Coach renamed.')}else{if(!confirm('Remove '+c.name+' from this team?'))return;t.coaches=t.coaches.filter(x=>x.id!==id);save('Coach removed.')}renderTeam()};
function storeLineup(){let t=team();if(!t)return false;t.lineup={label:clean($('matchLabel').value),date:$('matchDate').value,text:clean($('lineupText').value)};save('Lineup saved locally.');return true}
$('saveLineup').onclick=storeLineup;
$('shareLineup').onclick=async()=>{if(!storeLineup())return;let t=team(),d=db.divisions.find(x=>x.id===t.division),l=t.lineup;let message=[db.program,d?.name,t.name,l.label,l.date,'',l.text].filter(Boolean).join('\n');try{if(navigator.share){await navigator.share({title:'HH Teams lineup',text:message});$('status').textContent='Share sheet opened.'}else if(navigator.clipboard){await navigator.clipboard.writeText(message);$('status').textContent='Lineup copied.'}else prompt('Copy lineup:',message)}catch(e){if(e.name!=='AbortError')prompt('Copy lineup:',message)}};
render();
