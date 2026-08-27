/* ==========================================================================
   MAIN.JS
   Pequenas interações da página:
   1. Animação de "revelar ao rolar" para cards e passos.
   2. Abrir/fechar o convite (envelope) no hero.
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  setupScrollReveal();
  setupEnvelopeHint();
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
