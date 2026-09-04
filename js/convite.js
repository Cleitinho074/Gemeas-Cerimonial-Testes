const KNOWN_GUESTS = [
  { nome:"Fernanda Souza", limite:2 },
  { nome:"João Ribeiro", limite:3 },
  { nome:"Mariana Costa", limite:1 },
  { nome:"Lucas Almeida", limite:2 }
];

let guest = null;
let answer = null;
let qty = 1;

function norm(s){ return s.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().trim(); }

function showStep(id, dotIndex=0) {
  ["step1","stepNotFound","step2","step3"].forEach(x => {
    const el=document.getElementById(x); if(el) el.hidden = x !== id;
  });
  document.querySelectorAll(".progress-dots .dot").forEach((d,i)=>{
    d.classList.toggle("active",i===dotIndex);
    d.classList.toggle("done",i<dotIndex);
  });
}

function updateQty(){
  const v=document.getElementById("qtyValue"); if(v) v.textContent=qty;
  const minus=document.getElementById("qtyMinus"); if(minus) minus.disabled=qty<=1;
  const plus=document.getElementById("qtyPlus"); if(plus) plus.disabled=!!guest && qty>=guest.limite;
}

function selectAnswer(value){
  answer=value;
  const yes=document.getElementById("btnVou"), no=document.getElementById("btnNaoVou");
  yes?.classList.toggle("selected",value==="yes"); yes?.classList.toggle("yes",value==="yes");
  no?.classList.toggle("selected",value==="no"); no?.classList.toggle("no",value==="no");
  document.getElementById("confirmFields")?.classList.toggle("show",value==="yes");
  document.getElementById("naoVouFields")?.classList.toggle("show",value==="no");
}

document.addEventListener("DOMContentLoaded", () => {
  const names=document.getElementById("eventNames"); if(names) names.textContent="Ana & Marcos";
  const details=document.getElementById("eventDetails"); if(details) details.textContent="12 de dezembro · Sítio das Palmeiras";

  document.getElementById("nameForm")?.addEventListener("submit", e=>{
    e.preventDefault();
    const typed=document.getElementById("nameInput")?.value || "";
    guest=KNOWN_GUESTS.find(g=>norm(g.nome)===norm(typed));
    const err=document.getElementById("nameError");
    if(!guest){ err?.classList.add("show"); return; }
    err?.classList.remove("show");
    const greeting=document.getElementById("greeting"); if(greeting) greeting.textContent=`Oi, ${guest.nome.split(" ")[0]}!`;
    const limit=document.getElementById("limiteInfo"); if(limit) limit.textContent=`Seu convite permite até ${guest.limite} pessoa${guest.limite>1?"s":""}.`;
    qty=1; updateQty(); showStep("step2",1);
  });

  document.getElementById("notFoundLink")?.addEventListener("click", e=>{e.preventDefault();showStep("stepNotFound",0);});
  document.getElementById("selfRegisterForm")?.addEventListener("submit", e=>{
    e.preventDefault();
    guest={nome:document.getElementById("srNome")?.value || "Convidado", limite:1};
    const title=document.getElementById("doneTitle"); if(title) title.textContent="Cadastro enviado!";
    const sub=document.getElementById("doneSub"); if(sub) sub.textContent="Sua solicitação ficou aguardando aprovação do organizador.";
    const box=document.getElementById("summaryBox"); if(box) box.innerHTML=`<strong>${guest.nome}</strong><br>Status: aguardando aprovação`;
    showStep("step3",2);
  });

  document.getElementById("btnVou")?.addEventListener("click",()=>selectAnswer("yes"));
  document.getElementById("btnNaoVou")?.addEventListener("click",()=>selectAnswer("no"));
  document.getElementById("qtyMinus")?.addEventListener("click",()=>{qty=Math.max(1,qty-1);updateQty();});
  document.getElementById("qtyPlus")?.addEventListener("click",()=>{qty=Math.min(guest?.limite||1,qty+1);updateQty();});

  document.getElementById("confirmForm")?.addEventListener("submit", e=>{
    e.preventDefault();
    if(!answer){ alert("Escolha se você vai ou não ao evento."); return; }
    const title=document.getElementById("doneTitle");
    const sub=document.getElementById("doneSub");
    const box=document.getElementById("summaryBox");
    if(answer==="yes"){
      if(title) title.textContent="Presença confirmada!";
      if(sub) sub.textContent="Que alegria! Nos vemos no grande dia.";
      const restr=document.getElementById("restricaoInput")?.value || "Nenhuma";
      const kids=document.getElementById("criancasInput")?.value || "0";
      if(box) box.innerHTML=`<strong>${guest.nome}</strong><br>Pessoas: ${qty}<br>Restrição alimentar: ${restr}<br>Crianças: ${kids}`;
    } else {
      if(title) title.textContent="Resposta registrada";
      if(sub) sub.textContent="Sentiremos sua falta. Obrigado por avisar.";
      if(box) box.innerHTML=`<strong>${guest.nome}</strong><br>Resposta: não vou`;
    }
    showStep("step3",2);
  });

  document.getElementById("editButton")?.addEventListener("click",()=>showStep("step2",1));
  updateQty();
});
