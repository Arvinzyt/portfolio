/* 内容驱动渲染：从 content/*.yml 读取数据，无需修改本文件。
   所有文案均可在 /admin 后台可视化编辑。 */

const $ = (s) => document.querySelector(s);
const esc = (s = "") =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

async function loadYAML(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`加载失败: ${url}`);
  return jsyaml.load(await res.text());
}

async function init() {
  const [site, projectsData] = await Promise.all([
    loadYAML("content/site.yml"),
    loadYAML("content/projects.yml"),
  ]);

  /* ---------- 站点基础 ---------- */
  document.title = site.meta?.title || site.brand;
  const desc = document.querySelector('meta[name="description"]');
  if (desc && site.meta?.description) desc.setAttribute("content", site.meta.description);

  $("#nav-brand").textContent = site.brand;
  $("#nav-brand-sub").textContent = site.brand_sub || "";

  $("#nav-links").innerHTML = (site.nav || [])
    .map((n) => `<a class="lnk" href="${esc(n.href)}">${esc(n.label)}</a>`)
    .join("");

  /* ---------- Hero ---------- */
  $("#hero-meta").innerHTML = (site.hero.meta || [])
    .map((m) => `<div>${esc(m.label)}<b>${esc(m.value)}</b></div>`)
    .join("");

  $("#hero-title").innerHTML = (site.hero.title_lines || [])
    .map((l) => `<span class="line"><span>${l.accent ? `<em>${esc(l.text)}</em>` : esc(l.text)}</span></span>`)
    .join("");

  $("#hero-intro").textContent = site.hero.intro || "";

  /* ---------- 章节标签 ---------- */
  $("#label-about").textContent = site.sections?.about || "关于";
  $("#label-projects").textContent = site.sections?.projects || "精选项目";
  $("#label-services").textContent = site.sections?.services || "能力";
  $("#label-contact").textContent = site.sections?.contact || "联系";

  /* ---------- 关于 ---------- */
  const about = site.about || {};
  $("#about-text").innerHTML =
    `<h2>${esc(about.title)}</h2>` +
    (about.paragraphs || []).map((p) => `<p>${esc(p)}</p>`).join("");
  $("#about-side").innerHTML = about.portrait
    ? `<img src="${esc(about.portrait)}" alt="形象照" /><div class="caption">${esc(about.portrait_caption || "")}</div>`
    : "";

  /* ---------- 项目列表 ---------- */
  const list = $("#project-list");
  const preview = $("#preview");
  const previewImg = preview.querySelector("img");
  const isDesktop = matchMedia("(min-width: 901px)").matches;

  list.innerHTML = (projectsData.projects || [])
    .map((p, i) => {
      const idx = String(i + 1).padStart(2, "0");
      const tags = (p.tags || []).join(" · ");
      const href = p.link || "#";
      const target = p.link ? ' target="_blank" rel="noopener"' : "";
      return `
      <li class="project-item" data-img="${esc(p.image || "")}">
        <a class="project-link" href="${esc(href)}"${target}>
          <span class="project-index">${idx}</span>
          <span class="project-name">${esc(p.title)}</span>
          <span class="project-tags">${esc(tags)}</span>
          <span class="project-year">${esc(p.year || "")}</span>
          ${p.summary ? `<p class="project-summary">${esc(p.summary)}</p>` : ""}
          ${p.image ? `<img class="project-thumb" src="${esc(p.image)}" alt="${esc(p.title)}" loading="lazy" />` : ""}
        </a>
      </li>`;
    })
    .join("");

  /* ---------- 悬浮预览图（跟随光标，lerp 平滑） ---------- */
  if (isDesktop) {
    let tx = 0, ty = 0, cx = 0, cy = 0, raf = null;
    const tick = () => {
      cx += (tx - cx) * 0.14;
      cy += (ty - cy) * 0.14;
      preview.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
      raf = requestAnimationFrame(tick);
    };
    list.addEventListener("mousemove", (e) => { tx = e.clientX; ty = e.clientY; });
    list.querySelectorAll(".project-item").forEach((item) => {
      item.addEventListener("mouseenter", (e) => {
        const img = item.dataset.img;
        if (!img) return;
        previewImg.src = img;
        tx = cx = e.clientX; ty = cy = e.clientY;
        preview.classList.add("on");
        if (!raf) tick();
      });
      item.addEventListener("mouseleave", () => {
        preview.classList.remove("on");
      });
    });
  }

  /* ---------- 服务 / 能力 ---------- */
  $("#svc-list").innerHTML = (site.services || [])
    .map(
      (s, i) => `
      <li class="svc-item">
        <span class="svc-num">${String(i + 1).padStart(2, "0")}</span>
        <span class="svc-name">${esc(s.name)}</span>
        <span class="svc-desc">${esc(s.desc)}</span>
      </li>`
    )
    .join("");

  /* ---------- 联系 ---------- */
  const contact = site.contact || {};
  $("#contact-heading").textContent = contact.heading || "";
  const mail = $("#contact-mail");
  mail.textContent = contact.email || "";
  mail.href = `mailto:${contact.email || ""}`;
  $("#contact-socials").innerHTML = (contact.socials || [])
    .map((s) => `<a class="lnk" href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.label)}</a>`)
    .join("");

  /* ---------- 页脚巨型标识（字母分组，悬停消隐） ---------- */
  const brandText = (site.brand_sub || site.brand || "PORTFOLIO").toUpperCase();
  const footBrand = $("#foot-brand");
  footBrand.innerHTML = [...brandText]
    .map((ch, i) => `<span class="${i % 2 ? "g1" : "g2"}">${ch === " " ? "&nbsp;" : esc(ch)}</span>`)
    .join("");
  $("#foot-note").textContent = site.footer_note || "";

  /* 页脚大字自动缩放到恰好一行 */
  const fitBrand = () => {
    let size = window.innerWidth * 0.16;
    footBrand.style.fontSize = size + "px";
    const limit = footBrand.parentElement.clientWidth;
    while (footBrand.scrollWidth > limit && size > 20) {
      size *= 0.96;
      footBrand.style.fontSize = size + "px";
    }
  };
  fitBrand();
  addEventListener("resize", fitBrand);

  /* ---------- 入场与滚动显现 ---------- */
  requestAnimationFrame(() => document.body.classList.add("ready"));

  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("in")),
    { threshold: 0.12 }
  );
  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

  /* ---------- Hero 视差 ---------- */
  const heroTitle = $("#hero-title");
  addEventListener(
    "scroll",
    () => {
      const y = Math.min(scrollY, innerHeight);
      heroTitle.style.transform = `translateY(${y * 0.28}px)`;
      heroTitle.style.opacity = String(1 - y / innerHeight);
    },
    { passive: true }
  );
}

init().catch((err) => {
  console.error(err);
  document.body.innerHTML =
    '<p style="padding:40px;font-family:monospace">内容加载失败，请通过本地服务器或网站域名访问（直接双击打开 index.html 无法读取数据文件）。</p>';
});
