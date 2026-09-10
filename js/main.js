/* ==========================================================================
   MAIN.JS
   Pequenas interações da página:
   1. Animação de "revelar ao rolar" para cards e passos.
   2. Abrir/fechar o convite (envelope) no hero.
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  setupScrollReveal();
  setupEnvelopeHint();
  setupEventForm();
});

/**
 * Adiciona a classe .reveal aos blocos principais e usa IntersectionObserver
 * para revelar (fade-in + slide-up) cada um quando entra na tela.
 */
function setupScrollReveal() {
  const selectors = ".step, .trust-item, .gift-card, .chaos-card";
  const elements = document.querySelectorAll(selectors);

  elements.forEach((el) => el.classList.add("reveal"));

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  elements.forEach((el) => observer.observe(el));
}

/**
 * O convite (envelope) abre/fecha ao clicar (ver index.html, onclick).
 * Aqui só damos uma "dica" visual: abre sozinho por um instante ao carregar
 * a página, pra deixar claro que ele é clicável.
 */
function setupEnvelopeHint() {
  const envelope = document.getElementById("envelope");
  if (!envelope) return;

  setTimeout(() => {
    if (envelope.classList.contains("open")) return;
    envelope.classList.add("open");
    setTimeout(() => envelope.classList.remove("open"), 1400);
  }, 900);
}

/**
 * Alterna o convite entre aberto/fechado.
 * Chamada pelo atributo onclick="toggleEnvelope()" no index.html.
 */
function toggleEnvelope() {
  const envelope = document.getElementById("envelope");
  if (envelope) envelope.classList.toggle("open");
}

/* ==========================================================================
   MODAL "CRIAR MEU EVENTO"
   Abre/fecha a janela com o formulário (nome, e-mail, tipo de evento) e
   envia os dados pro Netlify Forms via fetch, sem recarregar a página.
   ========================================================================== */

/**
 * Abre o modal de criação de evento e trava o scroll da página por trás.
 * Chamada pelos botões "Criar meu evento" no index.html.
 */
function openEventForm() {
  const modal = document.getElementById("eventModal");
  if (!modal) return;
  modal.classList.add("open");
  document.body.style.overflow = "hidden";
}

/**
 * Fecha o modal, libera o scroll e reseta o formulário para a próxima vez
 * que a pessoa abrir (volta pra tela de formulário, limpa os campos).
 */
function closeEventForm() {
  const modal = document.getElementById("eventModal");
  if (!modal) return;
  modal.classList.remove("open");
  document.body.style.overflow = "";

  const formView = document.getElementById("modalFormView");
  const thanksView = document.getElementById("modalThanksView");
  const form = document.getElementById("eventForm");
  if (formView) formView.style.display = "block";
  if (thanksView) thanksView.style.display = "none";
  if (form) form.reset();
}

/**
 * Intercepta o envio do formulário para mandar os dados direto pro
 * Netlify Forms via fetch (em vez de recarregar a página), e troca a
 * visualização do modal para a tela de agradecimento.
 */
function setupEventForm() {
  const form = document.getElementById("eventForm");
  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(form);

    fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(formData).toString(),
    })
      .then(() => {
        const formView = document.getElementById("modalFormView");
        const thanksView = document.getElementById("modalThanksView");
        if (formView) formView.style.display = "none";
        if (thanksView) thanksView.style.display = "block";
      })
      .catch(() => {
        alert("Não conseguimos enviar agora. Confira sua internet e tente de novo.");
      });
  });
}
