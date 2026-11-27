(() => {
  const WORKS = window.WORKS || [];
  const META = window.META || {};
  const PROFILE = window.PROFILE || {};
  const CATS = { architecture: "Architecture", furniture: "Furniture", products: "Products", art: "Art" };


  const el = (tag, attrs = {}, ...kids) => {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (k === "class") n.className = v; else if (k === "text") n.textContent = v; else n.setAttribute(k, v);
    }
    n.append(...kids.filter(Boolean));
    return n;
  };
  const pretty = (s) => s.replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const srcset = (name) => `img/${name}-800.webp 800w, img/${name}-1600.webp 1600w`;

  const works = WORKS.map((w) => {
    const m = META[w.id] || {};
    return { ...w, ...m, title: m.title || pretty(w.file), tags: m.tags || [] };
  });

  // 名前とリンク
  if (PROFILE.name) document.getElementById("name").textContent = PROFILE.name;
  document.getElementById("line").textContent = PROFILE.line || "";
  const links = document.getElementById("links");
  for (const l of PROFILE.links || []) links.append(el("a", { href: l.url, rel: "me noopener", target: "_blank", text: l.label }));
  document.getElementById("year").textContent = new Date().getFullYear();

  // 作品のカード
  const strip = document.getElementById("strip");
  works.forEach((w, i) => {
    const first = w.images[0];
    const img = el("img", {
      class: "ph", src: `img/${first.src}-800.webp`, srcset: srcset(first.src),
      sizes: "(max-width: 600px) 78vw, 450px", alt: w.title,
      loading: i < 3 ? "eager" : "lazy", decoding: "async",
    });
    const title = el("div", { class: "title" }, w.title, w.ja ? el("span", { class: "ja", text: w.ja }) : null);
    const meta = el("div", { class: "meta" },
      el("span", { class: "tag cat", text: CATS[w.category] }),
      ...w.tags.map((t) => el("span", { class: "tag", text: t })),
      w.year ? el("span", { text: String(w.year) }) : null,
    );
    const btn = el("button", { type: "button", "aria-label": `${w.title} — open` }, img,
      w.images.length > 1 ? el("span", { class: "count", text: `1 / ${w.images.length}` }) : null);
    btn.addEventListener("click", () => open(w));
    strip.append(el("li", { class: "card", "data-cat": w.category }, btn, el("div", { class: "info" }, title, meta)));
  });

  // 絞り込み
  const filters = document.getElementById("filters");
  const cats = ["all", ...Object.keys(CATS).filter((c) => works.some((w) => w.category === c))];
  const chips = cats.map((c) => {
    const n = c === "all" ? works.length : works.filter((w) => w.category === c).length;
    const b = el("button", { class: "chip", type: "button", "aria-pressed": String(c === "all") },
      c === "all" ? "All" : CATS[c], el("span", { class: "n", text: String(n) }));
    b.addEventListener("click", () => {
      chips.forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      for (const card of strip.children) card.hidden = c !== "all" && card.dataset.cat !== c;
      strip.scrollTo({ left: 0 });
    });
    filters.append(b);
    return b;
  });

  // パソコンでは、ホイールの縦の動きで横に送る
  strip.addEventListener("wheel", (e) => {
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX) && strip.scrollWidth > strip.clientWidth) {
      strip.scrollLeft += e.deltaY;
      e.preventDefault();
    }
  }, { passive: false });

  // 全画面で見る
  const viewer = document.getElementById("viewer");
  const slides = document.getElementById("slides");
  const cap = document.getElementById("cap");
  function open(w) {
    slides.replaceChildren(...w.images.map((im) => el("figure", {},
      el("img", { src: `img/${im.src}-1600.webp`, srcset: srcset(im.src), sizes: "100vw", alt: w.title, width: im.w, height: im.h }))));
    const credit = [w.role, w.by ? `© ${w.by}` : null].filter(Boolean).join(" · ");
    counter.textContent = w.images.length > 1 ? `1 / ${w.images.length}` : "";
    cap.replaceChildren(
      el("div", { class: "title" }, counter, w.title, w.ja ? el("span", { class: "ja", text: w.ja }) : null),
      el("div", {}, credit),
      el("div", {}, w.photo ? `Photo: ${w.photo}` : ""),
    );
    viewer.showModal();
    slides.scrollLeft = 0;
  }
  const counter = el("span", { class: "n" });
  slides.addEventListener("scroll", () => {
    const n = slides.children.length;
    if (n > 1) counter.textContent = `${Math.round(slides.scrollLeft / slides.clientWidth) + 1} / ${n}`;
  }, { passive: true });
  // パソコンでは ← → で送る
  viewer.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") slides.scrollBy({ left: slides.clientWidth, behavior: "smooth" });
    if (e.key === "ArrowLeft") slides.scrollBy({ left: -slides.clientWidth, behavior: "smooth" });
  });
  document.getElementById("close").addEventListener("click", () => viewer.close());
  viewer.addEventListener("click", (e) => { if (e.target === viewer) viewer.close(); });
  slides.addEventListener("click", (e) => { if (e.target === slides || e.target.tagName === "FIGURE") viewer.close(); });
})();
