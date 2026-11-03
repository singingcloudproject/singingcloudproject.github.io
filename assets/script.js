// Singing Cloud Studio — motion & small helpers.
// Everything here respects "reduce motion": if it's on, the page is shown complete and still.
(() => {
  const root = document.documentElement;
  root.classList.add("js");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isPhone = window.matchMedia("(max-width: 700px)").matches;

  /* ---------- mobile menu ---------- */
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.getElementById("site-nav");
  if (toggle && nav) {
    const setOpen = (open) => { toggle.setAttribute("aria-expanded", String(open)); nav.classList.toggle("open", open); };
    toggle.addEventListener("click", () => setOpen(toggle.getAttribute("aria-expanded") !== "true"));
    nav.addEventListener("click", (ev) => { if (ev.target.closest("a")) setOpen(false); });
  }

  /* ---------- header darkens after scrolling ---------- */
  const header = document.querySelector(".site-header");
  const onScrollHeader = () => header && header.classList.toggle("scrolled", window.scrollY > 10);
  window.addEventListener("scroll", onScrollHeader, { passive: true });
  onScrollHeader();

  /* ---------- service "Get in touch" buttons pre-select that service in the form ---------- */
  document.querySelectorAll("[data-topic]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const select = document.querySelector('form.form select[name="topic"]');
      if (!select) return;
      const match = [...select.options].find((o) => o.text === btn.dataset.topic);
      if (match) select.value = match.value;
    });
  });

  /* ---------- footer year ---------- */
  document.querySelectorAll("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));

  /* ---------- count-up numbers ---------- */
  const fmt = new Intl.NumberFormat(root.lang || "en");
  const counters = document.querySelectorAll(".count");
  counters.forEach((el) => (el.textContent = fmt.format(reduce ? +el.dataset.count : 0)));
  const countUp = (el) => {
    const target = +el.dataset.count;
    if (reduce) { el.textContent = fmt.format(target); return; }
    const start = performance.now();
    const dur = 1800;
    const step = (now) => {
      const p = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt.format(Math.round(target * eased));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  /* ---------- fade / slide / float in on scroll, one after another ---------- */
  document.querySelectorAll("[data-stagger]").forEach((group) => {
    [...group.children].forEach((child, i) => {
      if (!child.style.getPropertyValue("--d")) child.style.setProperty("--d", `${i * 110}ms`);
    });
  });
  const revealEls = document.querySelectorAll(".reveal, .reveal-zoom, .reveal-right");
  const show = (el) => {
    el.classList.add("in");
    el.querySelectorAll(".count").forEach(countUp);
    // after its entrance, let hover effects react instantly
    const delay = parseFloat(getComputedStyle(el).transitionDelay) * 1000 || 0;
    setTimeout(() => el.classList.add("done"), delay + 1200);
  };
  if (reduce || !("IntersectionObserver" in window)) {
    revealEls.forEach((el) => el.classList.add("in", "done"));
    counters.forEach((el) => (el.textContent = fmt.format(+el.dataset.count)));
  } else {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((en) => { if (en.isIntersecting) { show(en.target); io.unobserve(en.target); } }),
      { threshold: 0.15, rootMargin: "0px 0px -50px 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  }

  /* ---------- subtle parallax on photos & video (off on phones and for reduce motion) ---------- */
  const parallaxEls = [...document.querySelectorAll("[data-parallax]")];
  if (!reduce && !isPhone && parallaxEls.length) {
    let ticking = false;
    const update = () => {
      const vh = window.innerHeight;
      parallaxEls.forEach((el) => {
        const r = el.parentElement.getBoundingClientRect();
        if (r.bottom < -100 || r.top > vh + 100) return;
        const offset = (r.top + r.height / 2 - vh / 2) * -(+el.dataset.parallax);
        el.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0)`;
      });
      ticking = false;
    };
    window.addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    window.addEventListener("resize", update);
    update();
  }

  /* ---------- starry tech sky in the hero ---------- */
  const canvas = document.querySelector(".hero .stars");
  if (canvas && canvas.getContext) {
    const ctx = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0, h = 0, stars = [], running = false, raf = 0;
    const colors = ["191,227,255", "142,203,255", "246,217,150"];
    const resize = () => {
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.round(Math.min(isPhone ? 45 : 110, (w * h) / 9000));
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        r: Math.random() * 1.3 + 0.3,
        vx: (Math.random() - 0.5) * 0.08, vy: -(Math.random() * 0.12 + 0.02),
        tw: Math.random() * Math.PI * 2, ts: Math.random() * 0.02 + 0.006,
        c: colors[Math.random() < 0.12 ? 2 : Math.random() < 0.5 ? 1 : 0],
      }));
    };
    const draw = (move) => {
      ctx.clearRect(0, 0, w, h);
      for (const s of stars) {
        if (move) {
          s.x += s.vx; s.y += s.vy; s.tw += s.ts;
          if (s.y < -4) { s.y = h + 4; s.x = Math.random() * w; }
          if (s.x < -4) s.x = w + 4; else if (s.x > w + 4) s.x = -4;
        }
        const a = 0.35 + Math.sin(s.tw) * 0.3 + 0.3;
        ctx.beginPath();
        ctx.fillStyle = `rgba(${s.c},${a.toFixed(2)})`;
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
    };
    const loop = () => { draw(true); raf = requestAnimationFrame(loop); };
    const start = () => { if (!running && !reduce) { running = true; raf = requestAnimationFrame(loop); } };
    const stop = () => { running = false; cancelAnimationFrame(raf); };
    resize();
    draw(false);
    window.addEventListener("resize", () => { resize(); draw(false); });
    // only animate while the hero is on screen and the tab is visible — saves battery on phones
    if (!reduce && "IntersectionObserver" in window) {
      let visible = true;
      new IntersectionObserver(([en]) => { visible = en.isIntersecting; visible && !document.hidden ? start() : stop(); }).observe(canvas);
      document.addEventListener("visibilitychange", () => (document.hidden || !visible ? stop() : start()));
    }
  }

  /* ---------- the singing cloud + orbiting icons (hero) ----------
     The mouth moves between singer shapes ("ah" wide, "oh" round, "mm" nearly closed…)
     following a little melody: long held notes and quicker phrases.
     On big held notes the cloud stretches up and leans back, with a brighter glow and a light vibrato;
     between phrases it squashes down a little. It floats and sways the whole time.
     Runs only while the hero is on screen; "reduce motion" shows a still pose. */
  const stage = document.querySelector(".logo-stage");
  if (stage) {
    const svg = stage.querySelector(".mascot");
    const body = svg.querySelector(".sc-body");
    const shadow = svg.querySelector(".sc-shadow");
    const mouthEls = [...svg.querySelectorAll(".sc-m")];
    const tongue = svg.querySelector(".sc-tongue");
    const glow = stage.querySelector(".art-glow");
    const orbs = [...stage.querySelectorAll(".orb")];

    // must match mascot.py
    const CX = 208, CY = 104, PX = 200, PY = 282;
    const SHAPES = {          // [half width, opening, top-lip curve]
      rest: [118, 108, 20],
      ah: [124, 122, 22],     // wide open
      oh: [74, 106, -58],     // round
      oo: [52, 60, -40],      // small round
      eh: [110, 62, 16],      // half open
      mm: [86, 7, 8],         // nearly closed
    };
    // the melody: [shape, seconds, how big the note is 0–1]
    const MELODY = [
      ["mm", 0.8, 0], ["ah", 2.1, 1],                                   // breath… big held note
      ["mm", 0.2, 0], ["oh", 0.34, 0.25], ["eh", 0.26, 0.2], ["ah", 0.32, 0.3], ["oo", 0.38, 0.25], // quick phrase
      ["mm", 0.6, 0], ["oh", 1.7, 0.8],                                  // held round note
      ["eh", 0.24, 0.2], ["ah", 0.3, 0.35], ["mm", 0.18, 0], ["ah", 0.34, 0.3], ["oo", 0.32, 0.2], // quick phrase
      ["mm", 0.9, 0], ["ah", 2.5, 1], ["oh", 0.55, 0.5], ["mm", 1.3, 0], // finale and rest
    ];

    const mouthPath = (w, h, t) =>
      `M${(CX - w).toFixed(1)} ${CY}C${(CX - w * 0.55).toFixed(1)} ${(CY + t).toFixed(1)} ${(CX + w * 0.55).toFixed(1)} ${(CY + t).toFixed(1)} ${(CX + w).toFixed(1)} ${CY}` +
      `C${(CX + w).toFixed(1)} ${(CY + h * 1.33).toFixed(1)} ${(CX - w).toFixed(1)} ${(CY + h * 1.33).toFixed(1)} ${(CX - w).toFixed(1)} ${CY}Z`;
    const approach = (cur, target, speed, dt) => cur + (target - cur) * (1 - Math.exp(-speed * dt));

    const mouth = [...SHAPES.rest];
    const s = { stretch: 0, lean: 0, lift: 0, power: 0 };
    let note = 0, noteTime = 0, time = 0, leanDir = 1;

    // orbit geometry: a tilted ellipse around the cloud
    const TILT = (-32 * Math.PI) / 180, cosT = Math.cos(TILT), sinT = Math.sin(TILT);
    let stageW = stage.clientWidth;
    window.addEventListener("resize", () => (stageW = stage.clientWidth));
    const placeOrbs = (t) => {
      const a = stageW * 0.62, b = stageW * 0.17, n = orbs.length;
      orbs.forEach((el, i) => {
        const th = t * ((2 * Math.PI) / 46) + (i * 2 * Math.PI) / n;   // one lap ≈ 46 s
        const x = a * Math.cos(th), y = b * Math.sin(th);
        const z = Math.sin(th);                                         // +1 = in front, −1 = behind
        const k = (z + 1) / 2;
        el.style.transform = `translate3d(${(x * cosT - y * sinT).toFixed(1)}px, ${(x * sinT + y * cosT).toFixed(1)}px, 0) scale(${(0.7 + 0.3 * k).toFixed(3)})`;
        el.style.opacity = (0.22 + 0.58 * k).toFixed(3);
        el.style.zIndex = z > 0 ? 3 : 1;
      });
    };

    const render = (w, h, t, float, drift, sway) => {
      const sy = 1 + s.stretch, sx = 1 - s.stretch * 0.55;           // stretch up = a bit thinner
      body.setAttribute("transform",
        `translate(${(PX + drift).toFixed(2)} ${(PY + float + s.lift).toFixed(2)}) rotate(${(s.lean + sway).toFixed(2)}) scale(${sx.toFixed(4)} ${sy.toFixed(4)}) translate(${-PX} ${-PY})`);
      const d = mouthPath(w, h, t);
      mouthEls.forEach((el) => el.setAttribute("d", d));
      tongue.setAttribute("transform", `translate(${CX} ${(CY + h * 0.8).toFixed(1)}) scale(${(w * 0.46).toFixed(2)} ${(Math.max(h, 1) * 0.4).toFixed(2)})`);
      const up = Math.max(0, -(float + s.lift)) / 30;                  // higher cloud → smaller, lighter shadow
      shadow.setAttribute("transform", `translate(${(drift * 0.5).toFixed(2)} 0) translate(200 312) scale(${(1 - up * 0.35).toFixed(3)} 1) translate(-200 -312)`);
      shadow.setAttribute("opacity", (1 - up * 0.5).toFixed(3));
      glow.style.opacity = (0.45 + 0.5 * s.power + 0.08 * (h / 120)).toFixed(3);
      glow.style.transform = `translate3d(${(drift * 0.4).toFixed(1)}px, ${((float + s.lift) * 0.5).toFixed(1)}px, 0) scale(${(0.9 + 0.2 * s.power).toFixed(3)})`;
    };

    const frame = (dt) => {
      time += dt;
      noteTime += dt;
      let [shape, dur, power] = MELODY[note];
      if (noteTime >= dur) {
        noteTime -= dur;
        note = (note + 1) % MELODY.length;
        [shape, dur, power] = MELODY[note];
        if (dur >= 1 && power > 0.5) leanDir = -leanDir;                // alternate the lean on big notes
      }
      const long = dur >= 1;
      const target = SHAPES[shape];
      const speed = shape === "mm" ? 14 : long ? 6 : 18;                // quick notes snap, long notes bloom
      for (let k = 0; k < 3; k++) mouth[k] = approach(mouth[k], target[k], speed, dt);

      // vibrato on held notes (like a real singer)
      let vib = 0;
      if (long && power > 0) vib = Math.sin(time * 2 * Math.PI * 5.4) * Math.min(1, Math.max(0, (noteTime - 0.5) / 0.6)) * power;

      // body: stretch up + lean back on big notes, squash between phrases
      const held = long ? Math.min(1, noteTime / (dur * 0.6)) : 1;
      let tStretch, tLean, tLift;
      if (shape === "mm") { tStretch = -0.045; tLean = 0; tLift = 5; }
      else { tStretch = 0.015 + 0.075 * power * held; tLean = -5.5 * power * held * leanDir; tLift = -14 * power * held; }
      const bodySpeed = long ? 2.4 : 5;
      s.stretch = approach(s.stretch, tStretch, bodySpeed, dt);
      s.lean = approach(s.lean, tLean, 2.2, dt);
      s.lift = approach(s.lift, tLift, 2.8, dt);
      s.power = approach(s.power, shape === "mm" ? 0 : power, 3, dt);

      const float = Math.sin(time * 1.05) * 7;
      const drift = Math.sin(time * 0.62) * 6;
      const sway = Math.sin(time * 1.3) * 1.8;
      render(mouth[0] + vib * 2, Math.max(2, mouth[1] + vib * 5), mouth[2], float, drift, sway);
      placeOrbs(time);
    };

    // still pose for "reduce motion" (and before the first frame)
    render(...SHAPES.rest, 0, 0, 0);
    placeOrbs(4);

    if (!reduce) {
      let raf = 0, last = 0, running = false, visible = true;
      const loop = (now) => {
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now;
        frame(dt);
        raf = requestAnimationFrame(loop);
      };
      const start = () => { if (!running) { running = true; last = performance.now(); raf = requestAnimationFrame(loop); } };
      const stop = () => { running = false; cancelAnimationFrame(raf); };
      // pause while the hero is off screen or the tab is hidden — saves battery
      if ("IntersectionObserver" in window) {
        new IntersectionObserver(([en]) => { visible = en.isIntersecting; visible && !document.hidden ? start() : stop(); })
          .observe(stage.closest(".hero") || stage);
      } else start();
      document.addEventListener("visibilitychange", () => (document.hidden || !visible ? stop() : start()));
    }
  }

  /* ---------- hero gently fades and drifts up as you scroll down ---------- */
  const heroGrid = document.querySelector(".hero-grid");
  const heroCue = document.querySelector(".scroll-cue");
  if (heroGrid && !reduce) {
    let ticking = false;
    const fade = () => {
      const p = Math.min(1, Math.max(0, window.scrollY / (heroGrid.closest(".hero").offsetHeight * 0.85)));
      heroGrid.style.opacity = (1 - p * 0.85).toFixed(3);
      heroGrid.style.transform = p ? `translate3d(0, ${(-p * 70).toFixed(1)}px, 0)` : "";
      if (heroCue) heroCue.style.opacity = (1 - p * 2).toFixed(3);
      ticking = false;
    };
    window.addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(fade); } }, { passive: true });
    fade();
  }

  /* ---------- contact form → Formspree (sends without leaving the page) ---------- */
  document.querySelectorAll("form.form").forEach((form) => {
    const status = form.querySelector(".form-status");
    const button = form.querySelector("button[type=submit]");
    const label = button.textContent;
    form.addEventListener("submit", async (ev) => {
      ev.preventDefault();
      status.className = "form-status";
      if (form.dataset.connected !== "true") { status.textContent = form.dataset.notConnected; status.classList.add("err"); return; }
      button.disabled = true;
      button.textContent = form.dataset.sending;
      try {
        const res = await fetch(form.action, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } });
        if (!res.ok) throw new Error(res.status);
        form.reset();
        status.textContent = form.dataset.success;
        status.classList.add("ok");
        // replace the form with a clear "Thank you" box (in the page's language)
        const thanks = document.createElement("div");
        thanks.className = "form-thanks";
        thanks.setAttribute("role", "status");
        thanks.setAttribute("tabindex", "-1");
        thanks.innerHTML = '<span class="form-thanks-icon" aria-hidden="true">✓</span>';
        const p = document.createElement("p");
        p.textContent = form.dataset.success;
        thanks.appendChild(p);
        form.appendChild(thanks);
        form.classList.add("sent");
        thanks.focus();
      } catch (err) {
        status.textContent = form.dataset.error;
        status.classList.add("err");
      } finally {
        button.disabled = false;
        button.textContent = label;
      }
    });
  });
})();
