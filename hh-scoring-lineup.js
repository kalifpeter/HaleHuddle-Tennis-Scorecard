(function(){
'use strict';
const REGISTRY='hh-teams-saved-match-lineups-v38';
const fmt=document.body.dataset.hhScoreFormat;
const date=document.getElementById('date');
if(!date||!fmt)return;
const parent=date.closest('.card')||date.parentElement;
const section=document.createElement('div');
section.className='hh-saved-match-picker';
section.style.cssText='padding:16px;margin:12px 0;border:1px solid #73849b;border-radius:14px;';
const label=document.createElement('label');label.textContent='Load saved match lineup by date';label.style.cssText='display:block;font-weight:700;margin-bottom:8px';
const pick=document.createElement('select');pick.setAttribute('aria-label','Saved match lineup');pick.style.cssText='display:block;width:100%;max-width:100%;padding:12px;border-radius:9px;background:#1d293a;color:#fff;border:1px solid #8a9db5;font-size:16px';
const status=document.createElement('p');status.style.cssText='font-size:14px;margin:8px 0 0';
section.append(label,pick,status);parent.insertBefore(section,parent.firstChild);
const read=()=>{try{return JSON.parse(localStorage.getItem(REGISTRY)||'[]').filter(x=>x.format===fmt&&x.date&&x.teamId)}catch(e){return[]}};
let items=[];
function refresh(){items=read().sort((a,b)=>b.date.localeCompare(a.date));pick.replaceChildren(new Option('Select match date / team',''));items.forEach(x=>pick.add(new Option(`${x.date} · ${x.teamName} vs ${x.opponent||'Opponent'} · ${x.divisionName}`,x.id)));status.textContent=items.length?'Select a saved lineup to fill this scorecard.':'No saved lineups for this scoring format. Save one in Match Lineup first.';}
function set(id,value){const el=document.getElementById(id);if(!el)return;el.value=value||'';el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));}
function apply(x){if(!x)return;const existing=document.querySelectorAll('.match input.score');if(Array.from(existing).some(el=>el.value!=='')){if(!confirm('Loading this lineup changes player and match details but retains entered scores. Continue?'))return;}
set('date',x.date);set('teamA',x.teamName);set('teamB',x.opponent);set('seasonName',x.season);
const athletes=new Map((x.athletes||[]).map(a=>[a.id,a.name]));
document.querySelectorAll('.match').forEach(card=>{const ids=x.assignments?.[card.dataset.name]||[];['.player-a1','.player-a2'].forEach((sel,i)=>{const el=card.querySelector(sel);if(el){el.value=athletes.get(ids[i])||'';el.dispatchEvent(new Event('input',{bubbles:true}));}})});
status.textContent='Loaded '+x.date+' · '+x.teamName+'. Opponent player names can be entered on the scorecard.';
}
pick.addEventListener('change',()=>apply(items.find(x=>x.id===pick.value)));
date.addEventListener('change',()=>{const matches=items.filter(x=>x.date===date.value);if(matches.length===1){pick.value=matches[0].id;apply(matches[0]);}else if(matches.length>1){status.textContent='Multiple lineups on this date. Select the correct team above.';}});
window.addEventListener('pageshow',refresh);refresh();const wanted=new URLSearchParams(location.search).get('match');if(wanted){const item=items.find(x=>x.id===wanted);if(item){pick.value=item.id;apply(item);}}
})();