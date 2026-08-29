const timeline = document.querySelector("[data-release-timeline]");
const formatDate = (date) => date ? new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short", year: "numeric" }).format(new Date(`${date}T12:00:00Z`)) : "Fecha pendiente de sincronización";
const releaseID = (version) => version.replaceAll(".", "-");

fetch("../data/releases.json").then((response) => {
  if (!response.ok) throw new Error("release-data");
  return response.json();
}).then((releases) => {
  timeline.replaceChildren();
  const fragment = document.createDocumentFragment();
  releases.forEach((release) => {
    const article = document.createElement("article");
    article.id = releaseID(release.version);
    article.className = `timeline-release ${release.type}${release.current ? " current" : ""}`;
    const meta = document.createElement("p"); meta.className = "release-meta";
    meta.textContent = `${release.current ? "Actual · " : ""}${release.type} · ${formatDate(release.date)}`;
    const title = document.createElement("h2"); title.textContent = release.version;
    const subtitle = document.createElement("p"); subtitle.textContent = release.title;
    article.append(meta, title, subtitle);
    if (release.officialNotes?.length) {
      const list = document.createElement("ul");
      release.officialNotes.slice(0, release.current ? 3 : 2).forEach((note) => { const item = document.createElement("li"); item.textContent = note; list.append(item); });
      article.append(list);
    } else {
      const pending = document.createElement("p"); pending.className = "pending-notes"; pending.textContent = "Notas oficiales pendientes de sincronización desde App Store Connect."; article.append(pending);
    }
    if (release.version === "3.0") {
      const link = document.createElement("a"); link.className = "text-link"; link.href = "3.0/"; link.innerHTML = "Ver lanzamiento y notas oficiales <span aria-hidden=\"true\">→</span>"; article.append(link);
    }
    fragment.append(article);
  });
  timeline.append(fragment);
}).catch(() => { timeline.innerHTML = "<p>No se ha podido cargar el historial. <a class='text-link' href='3.0/'>Ver BUSGo! 3.0 →</a></p>"; });
document.querySelectorAll("[data-current-year]").forEach((element) => { element.textContent = String(new Date().getFullYear()); });
