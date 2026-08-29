document.documentElement.classList.add("js");

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
const nav = document.querySelector("[data-nav]");
const menuButton = document.querySelector(".menu-toggle");
const mobileMenu = document.querySelector("#mobile-menu");
let previousScrollY = window.scrollY;
let ticking = false;

function updateScrollState() {
  const scrollY = window.scrollY;
  const maximum = Math.max(1, document.documentElement.scrollHeight - innerHeight);
  document.documentElement.style.setProperty("--route-progress", Math.min(1, scrollY / maximum).toFixed(4));
  nav?.classList.toggle("is-scrolled", scrollY > 24);
  nav?.classList.toggle("is-hidden", scrollY > 260 && scrollY > previousScrollY + 4 && !mobileMenu?.hasAttribute("hidden"));
  if (mobileMenu?.hasAttribute("hidden")) nav?.classList.toggle("is-hidden", scrollY > 260 && scrollY > previousScrollY + 4);
  previousScrollY = scrollY;
  ticking = false;
}

addEventListener("scroll", () => {
  if (!ticking) { requestAnimationFrame(updateScrollState); ticking = true; }
}, { passive: true });
updateScrollState();

function closeMenu({ restoreFocus = false } = {}) {
  if (!menuButton || !mobileMenu) return;
  mobileMenu.hidden = true;
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.setAttribute("aria-label", "Abrir menú");
  nav?.classList.remove("is-hidden");
  if (restoreFocus) menuButton.focus();
}

menuButton?.addEventListener("click", () => {
  const willOpen = mobileMenu.hidden;
  mobileMenu.hidden = !willOpen;
  menuButton.setAttribute("aria-expanded", String(willOpen));
  menuButton.setAttribute("aria-label", willOpen ? "Cerrar menú" : "Abrir menú");
  if (willOpen) mobileMenu.querySelector("a")?.focus();
});
mobileMenu?.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => closeMenu()));
addEventListener("keydown", (event) => { if (event.key === "Escape" && !mobileMenu?.hidden) closeMenu({ restoreFocus: true }); });

const tilt = document.querySelector("[data-tilt]");
if (tilt && finePointer.matches && !reducedMotion.matches) {
  tilt.addEventListener("pointermove", (event) => {
    const bounds = tilt.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - .5;
    const y = (event.clientY - bounds.top) / bounds.height - .5;
    tilt.style.transform = `rotateX(${(-y * 2.5).toFixed(2)}deg) rotateY(${(x * 3).toFixed(2)}deg)`;
  });
  tilt.addEventListener("pointerleave", () => { tilt.style.transform = ""; });
}

const companionContent = {
  saber: { image: "assets/favorites-3.jpg", alt: "Paradas favoritas en BUSGo!", kicker: "Todo a un vistazo", title: "Las paradas que importan, primero." },
  llegar: { image: "assets/journey-3.jpg", alt: "BUSGo! siguiendo un viaje", kicker: "Durante el trayecto", title: "La próxima parada siempre a mano." },
  personalizar: { image: "assets/favorites-3.jpg", alt: "Favoritos personalizados en BUSGo!", kicker: "Tu forma de moverte", title: "Favoritos y accesos que se adaptan a ti." }
};
document.querySelectorAll("[data-companion]").forEach((tab) => {
  tab.addEventListener("click", () => {
    const content = companionContent[tab.dataset.companion];
    if (!content) return;
    document.querySelectorAll("[data-companion]").forEach((item) => item.setAttribute("aria-selected", String(item === tab)));
    const image = document.querySelector("[data-companion-image]");
    if (image) { image.src = content.image; image.alt = content.alt; }
    document.querySelector("[data-companion-kicker]").textContent = content.kicker;
    document.querySelector("[data-companion-title]").textContent = content.title;
  });
});

const arrivalForm = document.querySelector("[data-arrival-form]");
const demoStatus = document.querySelector("[data-demo-status]");
const demoResults = document.querySelector("[data-demo-results]");
const arrivalEndpoint = "https://wyacoovzuzruvynblfgp.supabase.co/functions/v1/tus-miguel-api/api/v1/estimations/get";

arrivalForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const stopID = Number(new FormData(arrivalForm).get("stop"));
  if (!Number.isInteger(stopID) || stopID < 1 || stopID > 65535) {
    demoStatus.textContent = "Introduce un número de parada válido."; demoResults.replaceChildren(); return;
  }
  arrivalForm.classList.add("is-loading");
  demoStatus.textContent = `Consultando la parada ${stopID}…`; demoResults.replaceChildren();
  try {
    const response = await fetch(arrivalEndpoint, {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ stopId: stopID }), signal: AbortSignal.timeout(5500)
    });
    if (!response.ok) throw new Error(`service-${response.status}`);
    const payload = await response.json();
    const lines = Array.isArray(payload.activeLines) ? payload.activeLines : [];
    if (!lines.length) { demoStatus.textContent = "No hay próximas llegadas disponibles para esta parada."; return; }
    const usesOpenData = lines.some((line) => line?.source === "santanderOpenData");
    demoStatus.textContent = `${lines.length} ${lines.length === 1 ? "línea encontrada" : "líneas encontradas"}${usesOpenData ? " · datos abiertos de Santander" : " · información en directo"}.`;
    const fragment = document.createDocumentFragment();
    lines.slice(0, 6).forEach((line) => {
      const next = line?.arrivals?.next;
      const row = document.createElement("div"); row.className = "demo-arrival";
      const badge = document.createElement("span"); badge.className = "line-badge"; badge.textContent = String(line.label ?? "—");
      const description = document.createElement("span");
      const destination = document.createElement("b"); destination.textContent = String(line.destination ?? "Destino no disponible");
      const source = document.createElement("small");
      source.textContent = line?.source === "santanderOpenData" ? "Estimación · datos.santander.es" : "Próxima llegada en directo";
      description.append(destination, source);
      const eta = document.createElement("strong"); eta.textContent = Number.isFinite(next) ? (next <= 0 ? "Próximo" : `${Math.round(next)} min`) : "—";
      row.append(badge, description, eta); fragment.append(row);
    });
    demoResults.append(fragment);
  } catch {
    demoStatus.textContent = "La información en directo no está disponible ahora. Puedes continuar en BUSGo!.";
  } finally { arrivalForm.classList.remove("is-loading"); }
});

fetch("data/site.json", { cache: "no-cache" }).then((response) => response.ok ? response.json() : Promise.reject()).then((site) => {
  document.querySelectorAll("[data-rating]").forEach((element) => { element.textContent = Number(site.rating).toLocaleString("es-ES", { minimumFractionDigits: 1, maximumFractionDigits: 1 }); });
  document.querySelectorAll("[data-rating-count]").forEach((element) => { element.textContent = Number(site.ratingCount).toLocaleString("es-ES"); });
}).catch(() => {});
document.querySelectorAll("[data-current-year]").forEach((element) => { element.textContent = String(new Date().getFullYear()); });

document.addEventListener("visibilitychange", () => { document.documentElement.classList.toggle("page-hidden", document.hidden); });
