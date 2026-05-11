const sets = window.HEALTH_VOCAB_SETS || [];

function getSetFromPage() {
  const page = document.body.dataset.setSlug;
  return sets.find((set) => set.slug === page);
}

function renderNav(currentSlug) {
  const nav = document.querySelector("[data-nav]");
  if (!nav) return;

  nav.innerHTML = sets
    .map((set) => {
      const active = set.slug === currentSlug ? "is-active" : "";
      return `<a class="chip ${active}" href="${set.slug}.html">${set.title}</a>`;
    })
    .join("");
}

function renderLanding() {
  const grid = document.querySelector("[data-set-grid]");
  if (!grid) return;

  grid.innerHTML = sets
    .map(
      (set, index) => `
        <a class="set-card" href="${set.slug}.html">
          <span class="set-card__eyebrow">Set ${index + 1}</span>
          <h2>${set.title}</h2>
          <p>${set.focus}</p>
          <span class="set-card__meta">${set.cards.length} picture cards</span>
        </a>
      `
    )
    .join("");
}

function createCardMarkup(card, index) {
  return `
    <button class="flip-card" type="button" data-flip-card aria-pressed="false">
      <span class="flip-card__count">${String(index + 1).padStart(2, "0")}</span>
      <span class="flip-card__cue">${card.cue || ""}</span>
      <span class="flip-card__image-wrap">
        <img src="${card.image}" alt="${card.term}" loading="lazy" />
        <span class="flip-card__hint">Tap the picture to reveal</span>
      </span>
      <span class="flip-card__answer" aria-hidden="true">
        <strong>${card.term}</strong>
        ${card.definition ? `<small>${card.definition}</small>` : ""}
      </span>
    </button>
  `;
}

function wireFlipCards() {
  document.querySelectorAll("[data-flip-card]").forEach((card) => {
    card.addEventListener("click", () => {
      const isRevealed = card.classList.toggle("is-revealed");
      card.setAttribute("aria-pressed", String(isRevealed));
    });
  });
}

function wireControls() {
  const revealAll = document.querySelector("[data-reveal-all]");
  const hideAll = document.querySelector("[data-hide-all]");
  const cards = [...document.querySelectorAll("[data-flip-card]")];

  if (revealAll) {
    revealAll.addEventListener("click", () => {
      cards.forEach((card) => {
        card.classList.add("is-revealed");
        card.setAttribute("aria-pressed", "true");
      });
    });
  }

  if (hideAll) {
    hideAll.addEventListener("click", () => {
      cards.forEach((card) => {
        card.classList.remove("is-revealed");
        card.setAttribute("aria-pressed", "false");
      });
    });
  }
}

function renderSetPage() {
  const set = getSetFromPage();
  if (!set) return;

  document.title = `${set.title} | Health Vocab`;
  renderNav(set.slug);

  const title = document.querySelector("[data-set-title]");
  const focus = document.querySelector("[data-set-focus]");
  const cards = document.querySelector("[data-card-grid]");
  if (title) title.textContent = set.title;
  if (focus) focus.textContent = set.focus;
  if (cards) cards.innerHTML = set.cards.map(createCardMarkup).join("");

  wireFlipCards();
  wireControls();
}

renderLanding();
renderSetPage();
