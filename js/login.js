/* ==========================================================================
   LOGIN.JS
   Login de demonstração: não valida senha de verdade (não há backend
   ainda). Só guarda qual aba está selecionada e redireciona pro painel
   certo — painel.html para organizador(a), cerimonialista.html para
   cerimonialista.
   ========================================================================== */

let selectedRole = "noiva"; // "noiva" | "cerimonialista"

function selectRole(role) {
  selectedRole = role;
  document.getElementById("tabNoiva").classList.toggle("active", role === "noiva");
  document.getElementById("tabCerimonialista").classList.toggle("active", role === "cerimonialista");

  const sub = document.getElementById("loginSub");
  sub.textContent =
    role === "noiva"
      ? "Entre para acompanhar as confirmações do seu evento."
      : "Entre para ver, num só lugar, todos os eventos que você atende.";
}

function handleLogin(event) {
  event.preventDefault();

  const email = document.getElementById("emailInput").value.trim();
  const senha = document.getElementById("senhaInput").value.trim();
  const error = document.getElementById("loginError");

  if (!email || !senha) {
    error.textContent = "Preencha e-mail e senha para continuar.";
    error.classList.add("show");
    return;
  }

  error.classList.remove("show");
  window.location.href = selectedRole === "noiva" ? "painel.html" : "cerimonialista.html";
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("tabNoiva").addEventListener("click", () => selectRole("noiva"));
  document.getElementById("tabCerimonialista").addEventListener("click", () => selectRole("cerimonialista"));
  document.getElementById("loginForm").addEventListener("submit", handleLogin);
});
