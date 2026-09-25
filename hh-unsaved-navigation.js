/* V2.6: warn on unsaved user edits only when navigating Home. */
(function(){'use strict';let dirty=false;let baselineReady=false;
function init(){
  // Delayed initialization lets existing page-specific scripts populate saved fields first.
  baselineReady=true;
  document.addEventListener('input',function(e){if(baselineReady&&e.isTrusted&&e.target.matches('input,textarea,select'))dirty=true;},true);
  document.addEventListener('change',function(e){if(baselineReady&&e.isTrusted&&e.target.matches('input,textarea,select'))dirty=true;},true);
  document.addEventListener('click',function(e){const save=e.target.closest('button');if(save&&/^(save|save roster|save lineup|save match|save to season|save season|apply)$/i.test((save.textContent||'').trim())){dirty=false;}},false);
  const home=document.querySelector('.hh-page-home');if(home)home.addEventListener('click',function(e){if(dirty&&!window.confirm('You have unsaved changes. Return Home and discard them?'))e.preventDefault();});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
