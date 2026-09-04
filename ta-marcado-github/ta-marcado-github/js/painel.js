const GUESTS = [
  { nome:"Fernanda Souza", telefone:"(67) 99911-2200", grupo:"Família da noiva", status:"confirmado", lugares:2, restricao:"Nenhuma", criancas:0, respondido:"02/09/2026" },
  { nome:"Lucas Almeida", telefone:"(67) 99820-1133", grupo:"Trabalho", status:"pendente", lugares:2, restricao:"—", criancas:0, respondido:"—" },
  { nome:"Mariana Costa", telefone:"(67) 99100-4500", grupo:"Faculdade", status:"recusado", lugares:1, restricao:"—", criancas:0, respondido:"01/09/2026" },
  { nome:"João Ribeiro", telefone:"(67) 99221-7711", grupo:"Família do noivo", status:"confirmado", lugares:3, restricao:"Sem lactose", criancas:1, respondido:"03/09/2026" },
  { nome:"Camila Martins", telefone:"(67) 99771-0808", grupo:"Amigos", status:"aprovacao", lugares:1, restricao:"Vegetariano", criancas:0, respondido:"04/09/2026" },
  { nome:"Paulo Nunes", telefone:"(67) 99660-5512", grupo:"Amigos", status:"pendente", lugares:2, restricao:"—", criancas:0, respondido:"—" }
];

let activeFilter = "todos";
let selectedGuest = null;

const labels = {
  confirmado:"Confirmado",
  recusado:"Recusado",
  pendente:"Pendente",
  aprovacao:"Aguardando aprovação"
};

function renderStats() {
  const set = (id, value) => { const el=document.getElementById(id); if(el) el.textContent=value; };
  set("statTotal", GUESTS.reduce((n,g)=>n+g.lugares,0));
  set("statConfirmado", GUESTS.filter(g=>g.status==="confirmado").reduce((n,g)=>n+g.lugares,0));
  set("statRecusado", GUESTS.filter(g=>g.status==="recusado").length);
  set("statPendente", GUESTS.filter(g=>g.status==="pendente").length);
  set("statAprovacao", GUESTS.filter(g=>g.status==="aprovacao").length);
}

function filteredGuests() {
  const q = (document.getElementById("searchInput")?.value || "").toLowerCase().trim();
  const group = document.getElementById("groupFilter")?.value || "todos";
  return GUESTS.filter(g => {
    const statusOk = activeFilter === "todos" || g.status === activeFilter;
    const groupOk = group === "todos" || g.grupo === group;
    const qOk = !q || `${g.nome} ${g.telefone}`.toLowerCase().includes(q);
    return statusOk && groupOk && qOk;
  });
}

function renderTable() {
  const body = document.getElementById("guestTableBody");
  if (!body) return;
  const rows = filteredGuests();
  body.innerHTML = rows.map((g,i) => `
    <tr>
      <td><strong>${g.nome}</strong><br><small>${g.telefone}</small></td>
      <td>${g.grupo}</td>
      <td><span class="badge ${g.status}">${labels[g.status]}</span></td>
      <td>${g.lugares}</td>
      <td>${g.restricao}</td>
      <td>${g.criancas}</td>
      <td>${g.respondido}</td>
      <td><button class="invite-btn" type="button" data-name="${g.nome}">Convite</button></td>
    </tr>`).join("");
  const empty = document.getElementById("emptyState");
  if (empty) empty.style.display = rows.length ? "none" : "block";
  body.querySelectorAll(".invite-btn").forEach(btn => btn.addEventListener("click", () => openInviteModal(btn.dataset.name)));
}

function openInviteModal(name) {
  selectedGuest = GUESTS.find(g=>g.nome===name);
  if (!selectedGuest) return;
  const modal = document.getElementById("inviteModal");
  const title = document.getElementById("inviteModalGuestName");
  const text = document.getElementById("inviteMessageText");
  if (title) title.textContent = selectedGuest.nome;
  if (text) text.value = `Olá, ${selectedGuest.nome}! 💌\n\nVocê está convidado(a) para o casamento de Ana & Marcos, no dia 12 de dezembro.\n\nConfirme sua presença pelo link:\nhttps://exemplo.com/convite\n\nEsperamos você!`;
  if (modal) { modal.classList.add("open"); modal.style.display="flex"; }
}

function closeInviteModal() {
  const modal = document.getElementById("inviteModal");
  if (modal) { modal.classList.remove("open"); modal.style.display="none"; }
}

function sendViaWhatsApp() {
  if (!selectedGuest) return;
  const message = document.getElementById("inviteMessageText")?.value || "";
  const digits = selectedGuest.telefone.replace(/\D/g,"");
  window.open(`https://wa.me/55${digits}?text=${encodeURIComponent(message)}`, "_blank", "noopener");
}

document.addEventListener("DOMContentLoaded", () => {
  renderStats();
  const group = document.getElementById("groupFilter");
  if (group) {
    [...new Set(GUESTS.map(g=>g.grupo))].sort().forEach(v => {
      const o=document.createElement("option"); o.value=v; o.textContent=v; group.appendChild(o);
    });
    group.addEventListener("change", renderTable);
  }
  document.getElementById("searchInput")?.addEventListener("input", renderTable);
  document.querySelectorAll(".stat-card").forEach(card => card.addEventListener("click", () => {
    activeFilter = card.dataset.filter || "todos";
    document.querySelectorAll(".stat-card").forEach(c=>c.classList.toggle("active",c===card));
    renderTable();
  }));
  document.getElementById("btnNaoRespondeu")?.addEventListener("click", e => {
    activeFilter="pendente";
    document.querySelectorAll(".stat-card").forEach(c=>c.classList.toggle("active",c.dataset.filter==="pendente"));
    e.currentTarget.classList.add("active");
    renderTable();
  });
  document.getElementById("btnLimpar")?.addEventListener("click", () => {
    activeFilter="todos";
    const s=document.getElementById("searchInput"); if(s) s.value="";
    if(group) group.value="todos";
    document.getElementById("btnNaoRespondeu")?.classList.remove("active");
    document.querySelectorAll(".stat-card").forEach(c=>c.classList.remove("active"));
    renderTable();
  });
  const modal=document.getElementById("inviteModal");
  if(modal){ modal.style.display="none"; modal.addEventListener("click",e=>{if(e.target===modal) closeInviteModal();}); }
  renderTable();
});
