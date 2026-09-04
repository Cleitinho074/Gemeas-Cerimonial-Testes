function toggleEnvelope() {
  const envelope = document.getElementById("envelope");
  if (envelope) envelope.classList.toggle("open");
}

function openEventForm() {
  const modal = document.getElementById("eventModal");
  if (!modal) return;
  modal.classList.add("open");
  modal.style.display = "flex";
  document.body.style.overflow = "hidden";
}

function closeEventForm() {
  const modal = document.getElementById("eventModal");
  if (!modal) return;
  modal.classList.remove("open");
  modal.style.display = "none";
  document.body.style.overflow = "";
}

function setupScrollReveal() {
  const els = document.querySelectorAll(".section, .step, .gift-card, .testimonial");
  if (!("IntersectionObserver" in window)) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = "1";
        entry.target.style.transform = "none";
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });
  els.forEach(el => {
    el.style.opacity = "0";
    el.style.transform = "translateY(12px)";
    el.style.transition = "opacity .45s ease, transform .45s ease";
    obs.observe(el);
  });
}

function setupEnvelopeHint() {
  const envelope = document.getElementById("envelope");
  if (!envelope) return;
  envelope.setAttribute("role", "button");
  envelope.setAttribute("tabindex", "0");
  envelope.addEventListener("keydown", e => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleEnvelope();
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setupScrollReveal();
  setupEnvelopeHint();

  const modal = document.getElementById("eventModal");
  if (modal) {
    modal.style.display = "none";
    modal.addEventListener("click", e => {
      if (e.target === modal) closeEventForm();
    });
  }

  const form = document.getElementById("eventForm");
  if (form) {
    form.addEventListener("submit", e => {
      // On Netlify the form can be submitted normally. Locally, show the prototype success view.
      if (location.protocol === "file:") {
        e.preventDefault();
        const formView = document.getElementById("modalFormView");
        const thanks = document.getElementById("modalThanksView");
        if (formView) formView.style.display = "none";
        if (thanks) thanks.style.display = "block";
      }
    });
  }
});
