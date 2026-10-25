// Simulation, print events, navigation, tooltips and count animations.
// Dependencies and shared state are provided through ctx.
function initProposalInteractions(ctx) {
  // ---------------------------- INTERAKSI ----------------------------
  const fmtAngka = (v, f) =>
    f === "rp"
      ? ctx.rp(v)
      : f === "rs"
        ? ctx.rs(v)
        : f === "bln"
          ? Math.round(v) + " bulan"
          : f === "ton2"
            ? ctx.num(v, 2) + " ton"
            : f === "ton"
              ? ctx.num(v, 0) + " ton"
              : ctx.num(v, 0);
  function hidupkan() {
    const io =
      "IntersectionObserver" in window
        ? new IntersectionObserver(
            (es) =>
              es.forEach((e) => {
                if (!e.isIntersecting) return;
                io.unobserve(e.target);
                const el = e.target,
                  to = +el.dataset.count,
                  f = el.dataset.fmt,
                  t0 = performance.now();
                if (!isFinite(to) || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
                const step = (t) => {
                  const k = Math.min(1, (t - t0) / 900),
                    v = to * (1 - Math.pow(1 - k, 3));
                  el.textContent = fmtAngka(v, f);
                  if (k < 1) requestAnimationFrame(step);
                  else el.textContent = fmtAngka(to, f);
                };
                requestAnimationFrame(step);
              }),
            { threshold: 0.4 }
          )
        : null;
    if (io && !window.__print)
      document.querySelectorAll("[data-count]").forEach((el) => io.observe(el));
  }
  function pasangGlobal() {
    const tip = document.getElementById("tip");
    document.addEventListener("mousemove", (e) => {
      const t = e.target.closest && e.target.closest("[data-tip]");
      if (!t) {
        tip.hidden = true;
        return;
      }
      const [a, ...b] = t.dataset.tip.split("|");
      tip.innerHTML = `<b>${a}</b>${b.map((x) => `<span>${x}</span>`).join("")}`;
      tip.hidden = false;
      tip.style.left = Math.min(window.innerWidth - tip.offsetWidth - 12, e.clientX + 14) + "px";
      tip.style.top = e.clientY + 16 + "px";
    });
    const spy = () => {
      let cur = "";
      document.querySelectorAll("section.sheet").forEach((s) => {
        if (s.getBoundingClientRect().top < 140) cur = s.id;
      });
      document.querySelectorAll("#nav a[data-sec]").forEach((a) => {
        const on = a.dataset.sec === cur;
        if (on && !a.classList.contains("on")) {
          const nav = a.parentElement;
          nav.scrollTo({
            left: a.offsetLeft - nav.clientWidth / 2 + a.offsetWidth / 2,
            behavior: "smooth"
          });
        }
        a.classList.toggle("on", on);
      });
      document.getElementById("bar").classList.toggle("solid", window.scrollY > 60);
    };
    window.addEventListener("scroll", spy, { passive: true });
    spy();
    // Link "#bagian" (menu, daftar isi): gulir di halaman ini saja. Tanpa ini, di pratinjau (iframe srcdoc)
    // browser membuka alamat halaman induk sehingga pratinjau berubah menjadi halaman generator.
    document.addEventListener("click", (e) => {
      const a = e.target.closest && e.target.closest('a[href^="#"]');
      if (!a) return;
      const el = document.getElementById(decodeURIComponent(a.getAttribute("href").slice(1)));
      if (!el) return;
      e.preventDefault();
      el.scrollIntoView({
        behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
        block: "start"
      });
    });
    window.addEventListener("beforeprint", () => {
      window.__print = true;
      document.querySelectorAll("details").forEach((d) => {
        d.dataset.o = d.open ? 1 : 0;
        d.open = !!ctx.D.cetakItem;
      });
      document.querySelectorAll("[data-count]").forEach((el) => {
        el.textContent = fmtAngka(+el.dataset.count, el.dataset.fmt);
      });
    });
    window.addEventListener("afterprint", () => {
      document.querySelectorAll("details").forEach((d) => {
        d.open = d.dataset.o === "1";
      });
    });
    document.getElementById("btnPrint").onclick = () => window.print();
    const sim = document.getElementById("sim"),
      simBtn = document.getElementById("btnSim");
    simBtn.onclick = () => {
      sim.hidden = !sim.hidden;
      simBtn.classList.toggle("on", !sim.hidden);
    };
    document.getElementById("simClose").onclick = () => {
      sim.hidden = true;
      simBtn.classList.remove("on");
    };
    const ctrl = [
      ["kenaikanTarif", "%/th", 1],
      ["jamEfektif", "jam", 2],
      ["bebanBackupKW", "kW", 1]
    ];
    const label = () =>
      ctrl.forEach(([k, s, d]) => {
        const v = document.getElementById("v_" + k);
        if (v) v.textContent = ctx.num(ctx.A[k], d) + " " + s;
      });
    const upd = () => {
      label();
      document.body.classList.toggle(
        "simulating",
        ctrl.some(([k]) => ctx.A[k] !== ctx.A0[k])
      );
      ctx.render();
    };
    ctrl.forEach(([k]) => {
      const el = document.getElementById("s_" + k);
      if (el) {
        el.value = ctx.A[k];
        el.oninput = () => {
          ctx.A[k] = +el.value;
          upd();
        };
      }
    });
    document.getElementById("simReset").onclick = () => {
      ctx.A = JSON.parse(JSON.stringify(ctx.A0));
      ctrl.forEach(([k]) => {
        const el = document.getElementById("s_" + k);
        if (el) el.value = ctx.A[k];
      });
      upd();
    };
    upd();
  }

  Object.assign(ctx, { fmtAngka, hidupkan, pasangGlobal });
}

if (typeof module !== "undefined" && module.exports) module.exports = initProposalInteractions;
