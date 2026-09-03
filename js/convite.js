/* ==========================================================================
   CONVITE.JS
   Lógica do protótipo da página pública do convidado.
   EVENT_INFO e KNOWN_GUESTS são dados de exemplo — na versão real viriam
   do banco (tabelas "evento" e "convidado"), buscados pelo slug do link.
   ========================================================================== */

const EVENT_INFO = {
  nomes: "Ana & Marcos",
  data: "12 de dezembro de 2026",
  local: "Sítio das Palmeiras",
};

// Lista de exemplo — simula os convidados já cadastrados pela noiva.
const KNOWN_GUESTS = [
  { nome: "Fernanda Alves", limite: 2 },
  { nome: "Rodrigo Souza", limite: 1 },
  { nome: "Camila e Bruno", limite: 2 },
  { nome: "Juliana Prima", limite: 3 },
  { nome: "Paulo e Renata", limite: 2 },
];

let currentGuest = null; // { nome, limite }
let currentResponse = null; // "vou" | "nao_vou"
let currentQty = 1;

/** Remove acentos e caixa alta/baixa para a busca tolerar erro de digitação (RF01.02). */
function normalize(text) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function findGuest(inputName) {
  const target = normalize(inputName);
  if (!target) return null;
  return KNOWN_GUESTS.find(
    (g) => normalize(g.nome).includes(target) || target.includes(normalize(g.nome))
  );
}

function goToStep(stepId) {
  document.querySelectorAll(".step-panel").forEach((el) => (el.hidden = true));
  document.getElementById(stepId).hidden = false;
}

function updateDots(activeIndex) {
  document.querySelectorAll(".progress-dots .dot").forEach((dot, i) => {
    dot.classList.toggle("active", i === activeIndex);
    dot.classList.toggle("done", i < activeIndex);
  });
}

/* --- ETAPA 1: identificação --- */
function handleNameSubmit() {
  const input = document.getElementById("nameInput");
  const error = document.getElementById("nameError");
  const guest = findGuest(input.value);

  if (!guest) {
    error.classList.add("show");
    return;
  }
  error.classList.remove("show");
  currentGuest = guest;
  currentQty = Math.min(1, guest.limite) || 1;
  openConfirmStep();
}

/* --- ETAPA "não encontrado" (RF01.07 — autocadastro pendente de aprovação) --- */
function goToNotFound() {
  updateDots(0);
  goToStep("stepNotFound");
}

function handleSelfRegister() {
  const nome = document.getElementById("srNome").value.trim();
  const telefone = document.getElementById("srTelefone").value.trim();
  if (!nome || !telefone) return;

  updateDots(2);
  document.getElementById("doneIcon").textContent = "⏳";
  document.getElementById("doneTitle").textContent = "Cadastro enviado!";
  document.getElementById("doneSub").textContent =
    "A noiva ainda precisa aprovar seu convite, já que você não estava na lista original — assim que aprovar, você recebe a confirmação.";
  document.getElementById("summaryBox").innerHTML = `<strong>${nome}</strong> · ${telefone}<br>Status: aguardando aprovação`;
  document.getElementById("editButton").hidden = true;
  goToStep("step3");
}

/* --- ETAPA 2: confirmação --- */
function openConfirmStep() {
  document.getElementById("greeting").textContent = `Oi, ${currentGuest.nome.split(" ")[0]}!`;
  document.getElementById("limiteInfo").textContent = `Seu convite é válido para até ${currentGuest.limite} ${currentGuest.limite > 1 ? "pessoas" : "pessoa"}.`;
  updateDots(1);
  goToStep("step2");
}

function selectResponse(response) {
  currentResponse = response;
  document.getElementById("btnVou").classList.toggle("selected", response === "vou");
  document.getElementById("btnVou").classList.toggle("yes", response === "vou");
  document.getElementById("btnNaoVou").classList.toggle("selected", response === "nao_vou");
  document.getElementById("btnNaoVou").classList.toggle("no", response === "nao_vou");

  const fields = document.getElementById("confirmFields");
  fields.classList.toggle("show", response === "vou");
}

function changeQty(delta) {
  const next = currentQty + delta;
  if (next < 1 || next > currentGuest.limite) return;
  currentQty = next;
  document.getElementById("qtyValue").textContent = currentQty;
  document.getElementById("qtyMinus").disabled = currentQty <= 1;
  document.getElementById("qtyPlus").disabled = currentQty >= currentGuest.limite;
}

function handleConfirmSubmit() {
  if (!currentResponse) return;

  updateDots(2);
  document.getElementById("editButton").hidden = false;

  if (currentResponse === "vou") {
    const restricao = document.getElementById("restricaoInput").value;
    const criancas = document.getElementById("criancasInput").value || "0";
    const recado = document.getElementById("recadoInput").value.trim();

    document.getElementById("doneIcon").textContent = "🎉";
    document.getElementById("doneTitle").textContent = "Presença confirmada!";
    document.getElementById("doneSub").textContent = "Já registramos sua resposta. Você pode editar até a data limite de confirmação.";
    document.getElementById("summaryBox").innerHTML = `
      <strong>${currentGuest.nome}</strong><br>
      Pessoas confirmadas: <strong>${currentQty}</strong><br>
      Restrição alimentar: ${restricao || "—"}<br>
      Crianças: ${criancas}<br>
      ${recado ? `Recado: "${recado}"` : ""}
    `;
  } else {
    const recado = document.getElementById("recadoNaoVouInput").value.trim();
    document.getElementById("doneIcon").textContent = "💌";
    document.getElementById("doneTitle").textContent = "Sentiremos sua falta!";
    document.getElementById("doneSub").textContent = "Obrigado por avisar. Se mudar de ideia, é só voltar nesse link.";
    document.getElementById("summaryBox").innerHTML = `
      <strong>${currentGuest.nome}</strong><br>
      Resposta: não vai comparecer<br>
      ${recado ? `Recado: "${recado}"` : ""}
    `;
  }

  goToStep("step3");
}

function handleEdit() {
  updateDots(1);
  goToStep("step2");
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("eventNames").textContent = EVENT_INFO.nomes;
  document.getElementById("eventDetails").textContent = `${EVENT_INFO.data} · ${EVENT_INFO.local}`;

  document.getElementById("nameForm").addEventListener("submit", (e) => {
    e.preventDefault();
    handleNameSubmit();
  });

  document.getElementById("notFoundLink").addEventListener("click", (e) => {
    e.preventDefault();
    goToNotFound();
  });

  document.getElementById("selfRegisterForm").addEventListener("submit", (e) => {
    e.preventDefault();
    handleSelfRegister();
  });

  document.getElementById("btnVou").addEventListener("click", () => selectResponse("vou"));
  document.getElementById("btnNaoVou").addEventListener("click", () => selectResponse("nao_vou"));
  document.getElementById("qtyMinus").addEventListener("click", () => changeQty(-1));
  document.getElementById("qtyPlus").addEventListener("click", () => changeQty(1));

  document.getElementById("confirmForm").addEventListener("submit", (e) => {
    e.preventDefault();
    handleConfirmSubmit();
  });

  document.getElementById("editButton").addEventListener("click", handleEdit);
});
