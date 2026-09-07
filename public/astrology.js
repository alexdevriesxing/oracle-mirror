import { buildMoonWindow, moonPhaseForDate } from "./astrology-core.js";

function todayKey(){const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;}
function esc(value){return String(value??"").replace(/[&<>'"]/g,(c)=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]||c));}
function track(event,details={}){window.dataLayer=window.dataLayer||[];window.dataLayer.push({event,site_name:"Oracle Mirror",source:"astrology_lunar_v1",page_path:location.pathname,...details});}

function render(date){const result=document.querySelector("[data-moon-result]");const windowNode=document.querySelector("[data-moon-window]");if(!result||!windowNode)return;const phase=moonPhaseForDate(date);if(!phase){result.innerHTML='<p class="moon-error">Choose a valid calendar date.</p>';windowNode.innerHTML="";return;}
  result.innerHTML=`<article class="moon-result-card"><div class="moon-result-glyph">${phase.glyph}</div><div><p class="astrology-kicker">Approximate lunar phase</p><h2>${esc(phase.name)}</h2><p><strong>${esc(date)}</strong> · lunar age about ${phase.ageDays} days · illuminated fraction about ${phase.illuminatedPercent}%</p><a href="/astrology/moon/phases/${phase.slug}">Read the ${esc(phase.name)} guide →</a></div></article>`;
  windowNode.innerHTML=`<h2>15-day lunar window</h2><div class="moon-window-grid">${buildMoonWindow(date,15).map(item=>`<a class="moon-day${item.date===date?" current":""}" href="/astrology/moon/phases/${item.phase.slug}"><span>${item.phase.glyph}</span><strong>${item.date.slice(5)}</strong><small>${esc(item.phase.name)}</small></a>`).join("")}</div><p class="moon-method-note">Approximate model using the average 29.53058867-day synodic month; exact phase event times vary.</p>`;
  track("moon_phase_calculated",{result_kind:phase.slug});
}

const form=document.querySelector("[data-moon-form]");if(form){const input=form.elements?.date;if(input&&!input.value)input.value=todayKey();form.addEventListener("submit",(event)=>{event.preventDefault();render(input.value);});render(input.value||todayKey());}
