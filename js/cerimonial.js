const EVENTOS = [
  { id:"ana-marcos", nome:"Ana & Marcos", tipo:"casamento", data:"2026-12-12", local:"Sítio das Palmeiras", conta:"Ana Souza", confirmado:126, recusado:11, pendente:38, aprovacao:4 },
  { id:"isadora-15", nome:"15 anos da Isadora", tipo:"debutante", data:"2026-10-03", local:"Espaço Jardim", conta:"Carla Mendes", confirmado:84, recusado:7, pendente:21, aprovacao:2 },
  { id:"joao-40", nome:"João — 40 anos", tipo:"aniversario", data:"2027-01-16", local:"Villa Festas", conta:"João Ribeiro", confirmado:52, recusado:5, pendente:18, aprovacao:1 }
];

let tipoAtual="todos";

function daysUntil(date){
  const today=new Date(); today.setHours(0,0,0,0);
  return Math.ceil((new Date(date+"T12:00:00")-today)/86400000);
}
function fmtDate(date){ return new Intl.DateTimeFormat("pt-BR",{day:"2-digit",month:"long",year:"numeric"}).format(new Date(date+"T12:00:00")); }

function renderResumo(){
  const set=(id,v)=>{const e=document.getElementById(id);if(e)e.textContent=v};
  set("resumoEventos",EVENTOS.length);
  set("resumoContas",new Set(EVENTOS.map(e=>e.conta)).size);
  set("resumoConfirmados",EVENTOS.reduce((n,e)=>n+e.confirmado,0));
  set("resumoPendentes",EVENTOS.reduce((n,e)=>n+e.pendente,0));
  set("resumoAprovacao",EVENTOS.reduce((n,e)=>n+e.aprovacao,0));
  const next=[...EVENTOS].sort((a,b)=>a.data.localeCompare(b.data))[0];
  set("resumoProximo",`${next.nome} · ${fmtDate(next.data)}`);
}

function filteredEvents(){
  const q=(document.getElementById("buscaEvento")?.value||"").toLowerCase();
  const order=document.getElementById("ordenacao")?.value||"data";
  let list=EVENTOS.filter(e=>(tipoAtual==="todos"||e.tipo===tipoAtual) && `${e.nome} ${e.conta} ${e.local}`.toLowerCase().includes(q));
  list.sort(order==="pendentes" ? (a,b)=>b.pendente-a.pendente : (a,b)=>a.data.localeCompare(b.data));
  return list;
}

function renderEvents(){
  const grid=document.getElementById("eventGrid"); if(!grid)return;
  const list=filteredEvents();
  grid.innerHTML=list.map(e=>{
    const total=e.confirmado+e.recusado+e.pendente+e.aprovacao;
    const pct=Math.round((e.confirmado+e.recusado)/total*100);
    const days=daysUntil(e.data);
    return `<article class="event-card ${days<=45?"urgente":""}" tabindex="0" data-id="${e.id}">
      <div class="event-top"><span class="mono">${e.tipo==="debutante"?"15 anos":e.tipo}</span><span class="countdown ${days<=45?"perto":""}">${days>=0?days+" dias":"realizado"}</span></div>
      <h3>${e.nome}</h3><p class="event-when">${fmtDate(e.data)} · ${e.local}</p>
      <div class="progress"><span style="width:${pct}%"></span></div><p class="progress-label">${pct}% já responderam</p>
      <div class="count-row"><span class="count confirmado"><b>${e.confirmado}</b> confirmados</span><span class="count recusado"><b>${e.recusado}</b> recusados</span><span class="count pendente"><b>${e.pendente}</b> pendentes</span><span class="count aprovacao"><b>${e.aprovacao}</b> aprovação</span></div>
      <div class="event-foot"><div class="conta">Conta: <strong>${e.conta}</strong><span class="conta-sub">${e.local}</span></div><span class="open-link">Abrir evento →</span></div>
    </article>`;
  }).join("");
  const empty=document.getElementById("eventEmpty"); if(empty) empty.style.display=list.length?"none":"block";
  grid.querySelectorAll(".event-card").forEach(card=>{
    const open=()=>openEvent(card.dataset.id);
    card.addEventListener("click",open);
    card.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();open();}});
  });
}

function openEvent(id){
  const e=EVENTOS.find(x=>x.id===id); if(!e)return;
  document.getElementById("telaLista").style.display="none";
  document.getElementById("telaDetalhe").style.display="block";
  const crumb=document.getElementById("crumbEvento"); if(crumb)crumb.textContent=e.nome;
  document.querySelectorAll("#telaDetalhe [data-event-name]").forEach(x=>x.textContent=e.nome);
  location.hash=`evento=${id}`;
}

function closeEvent(){
  document.getElementById("telaLista").style.display="block";
  document.getElementById("telaDetalhe").style.display="none";
  history.replaceState(null,"",location.pathname+location.search);
}

document.addEventListener("DOMContentLoaded",()=>{
  renderResumo(); renderEvents();
  document.getElementById("buscaEvento")?.addEventListener("input",renderEvents);
  document.getElementById("ordenacao")?.addEventListener("change",renderEvents);
  document.querySelectorAll(".tipo-chip").forEach(btn=>btn.addEventListener("click",()=>{
    tipoAtual=btn.dataset.tipo||"todos";
    document.querySelectorAll(".tipo-chip").forEach(b=>b.classList.toggle("active",b===btn));
    renderEvents();
  }));
  document.getElementById("limparEventos")?.addEventListener("click",()=>{
    tipoAtual="todos";
    const q=document.getElementById("buscaEvento"); if(q)q.value="";
    const o=document.getElementById("ordenacao"); if(o)o.value="data";
    document.querySelectorAll(".tipo-chip").forEach(b=>b.classList.toggle("active",b.dataset.tipo==="todos"));
    renderEvents();
  });
  document.getElementById("voltarLista")?.addEventListener("click",e=>{e.preventDefault();closeEvent();});
  const match=location.hash.match(/evento=([^&]+)/); if(match) openEvent(match[1]);
});
