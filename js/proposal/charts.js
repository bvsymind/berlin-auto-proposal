// Cash-flow charts and system diagrams.
// Dependencies and shared state are provided through ctx.
function initProposalCharts(ctx) {
  // ---------------------------- GRAFIK ----------------------------
  function niceStep(raw) {
    if (!(raw > 0)) return 1;
    const p = Math.pow(10, Math.floor(Math.log10(raw))),
      f = raw / p;
    return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * p;
  }
  function grafikBatang(o, W = 720, H = 290) {
    const r = o.hasil,
      data = r.tahun,
      n = data.length;
    const L = 64,
      R = 14,
      T = 24,
      B = 34,
      w = W - L - R,
      h = H - T - B;
    const vals = data.map((t) => t.kumulatif).concat([-o.investasi]);
    let mn = Math.min(0, ...vals),
      mx = Math.max(0, ...vals);
    const step = niceStep((mx - mn) / 5);
    mn = Math.floor(mn / step) * step;
    mx = Math.ceil(mx / step) * step;
    const y = (v) => T + h - ((v - mn) / (mx - mn)) * h,
      bw = w / n;
    let g = "";
    for (let v = mn; v <= mx + 1; v += step)
      g += `<line x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}" class="gl${v === 0 ? " z" : ""}"/><text x="${L - 8}" y="${y(v) + 4}" class="ax" text-anchor="end">${ctx.rs(v).replace("Rp ", "")}</text>`;
    data.forEach((t, i) => {
      const x = L + i * bw + bw * 0.16,
        v = t.kumulatif,
        y0 = y(0),
        yv = y(v);
      g += `<rect x="${x}" y="${Math.min(y0, yv)}" width="${bw * 0.68}" height="${Math.max(1, Math.abs(yv - y0))}" rx="2" class="${v < 0 ? "neg" : "pos"}" data-tip="Tahun ke-${t.tahun}|Posisi kas: ${ctx.rp(v)}|Hemat tahun ini: ${ctx.rp(t.bersih)}"/>`;
      if (n <= 15 || t.tahun % 5 === 0 || t.tahun === 1)
        g += `<text x="${x + bw * 0.34}" y="${H - B + 16}" class="ax" text-anchor="middle">${t.tahun}</text>`;
    });
    if (r.bep != null) {
      const xb = L + r.bep * bw;
      g += `<line x1="${xb}" x2="${xb}" y1="${T - 6}" y2="${T + h}" class="bep"/><rect x="${xb - 52}" y="${T - 22}" width="104" height="20" rx="10" class="bepb"/><text x="${xb}" y="${T - 8}" class="bept" text-anchor="middle">BEP ${ctx.bln(r)} bulan</text>`;
    }
    g += `<text x="${L + w / 2}" y="${H - 2}" class="ax" text-anchor="middle">Tahun ke-</text>`;
    return `<svg viewBox="0 0 ${W} ${H}" class="chart" role="img" aria-label="Grafik posisi kas kumulatif ${ctx.esc(o.label)}">${g}</svg>`;
  }
  function grafikGaris(W = 720, H = 290) {
    const L = 64,
      R = 14,
      T = 16,
      B = 34,
      w = W - L - R,
      h = H - T - B,
      n = ctx.A.horizonTahun;
    const series = ctx.D.opsi.map((o) =>
      [{ tahun: 0, kumulatif: -o.investasi }].concat(o.hasil.tahun)
    );
    const vals = series.flat().map((t) => t.kumulatif);
    let mn = Math.min(0, ...vals),
      mx = Math.max(0, ...vals);
    const step = niceStep((mx - mn) / 5);
    mn = Math.floor(mn / step) * step;
    mx = Math.ceil(mx / step) * step;
    const x = (t) => L + (t / n) * w,
      y = (v) => T + h - ((v - mn) / (mx - mn)) * h;
    let g = "";
    for (let v = mn; v <= mx + 1; v += step)
      g += `<line x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}" class="gl${v === 0 ? " z" : ""}"/><text x="${L - 8}" y="${y(v) + 4}" class="ax" text-anchor="end">${ctx.rs(v).replace("Rp ", "")}</text>`;
    for (let t = 0; t <= n; t += 5)
      g += `<text x="${x(t)}" y="${H - B + 16}" class="ax" text-anchor="middle">${t}</text>`;
    series.forEach((s, i) => {
      g += `<polyline points="${s.map((t) => x(t.tahun) + "," + y(t.kumulatif)).join(" ")}" class="ln s${i % 4}"/>`;
      const o = ctx.D.opsi[i];
      if (o.hasil.bep != null)
        g += `<circle cx="${x(o.hasil.bep)}" cy="${y(0)}" r="5" class="dot s${i % 4}" data-tip="${ctx.esc(o.label)}|BEP ${ctx.bln(o.hasil)} bulan"/>`;
    });
    g += `<text x="${L + w / 2}" y="${H - 2}" class="ax" text-anchor="middle">Tahun ke-</text>`;
    return `<svg viewBox="0 0 ${W} ${H}" class="chart" role="img" aria-label="Perbandingan posisi kas kumulatif">${g}</svg>`;
  }

  // Diagram sistem (vektor, warna brand) — hybrid / on-grid / off-grid
  function diagramSistem(o) {
    const hyb = o.jenis !== "ongrid",
      off = o.jenis === "offgrid",
      hoff = o.jenis === "hybridoff";
    const box = (x, y, w, h, ikon, judul, sub, cls = "") =>
      `<g class="db ${cls}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="14"/><g transform="translate(${x + w / 2 - 14} ${y + 12}) scale(1.17)" class="di">${ikon}</g><text x="${x + w / 2}" y="${y + h - 26}" class="dt" text-anchor="middle">${ctx.esc(judul)}</text><text x="${x + w / 2}" y="${y + h - 11}" class="ds" text-anchor="middle">${ctx.esc(sub)}</text></g>`;
    const ik = (s) => s.replace('class="ic"', 'width="24" height="24"');
    const k = o.komponen;
    const line = (d, cls) => `<path d="${d}" class="dl ${cls}" marker-end="url(#ar-${cls})"/>`;
    let s = `<svg viewBox="0 0 720 330" class="sysd" role="img" aria-label="Diagram sistem ${ctx.esc(ctx.D.namaSistem[o.jenis])}">
      <defs>${["dc", "ac", "sg"].map((c) => `<marker id="ar-${c}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0 10 5 0 10z" class="am ${c}"/></marker>`).join("")}</defs>`;
    s += box(
      20,
      30,
      150,
      104,
      ik(ctx.IC.panel),
      "Panel Surya",
      k.pv ? `${ctx.num(k.pv.qty)} × ${ctx.num(k.pv.wp)} Wp` : ""
    );
    s += box(
      285,
      30,
      150,
      104,
      ik(ctx.IC.bolt),
      hoff
        ? "Inverter Off-Grid"
        : off
          ? "Inverter Off-Grid"
          : hyb
            ? "Inverter Hybrid"
            : "Inverter On-Grid",
      k.inverter
        ? `${k.inverter.qty > 1 ? ctx.num(k.inverter.qty) + " × " + ctx.num(k.inverter.kw || 0, 1) : ctx.num((k.inverter.kw || 0) * (k.inverter.qty || 1), 1)} kW${k.inverter.fase ? " · " + k.inverter.fase : ""}`
        : "",
      "main"
    );
    s += box(550, 30, 150, 104, ik(ctx.IC.home), "Beban Rumah / Gedung", "Panel distribusi (ACDB)");
    if (hyb)
      s += box(
        285,
        206,
        150,
        104,
        ik(ctx.IC.battery),
        "Baterai LiFePO4",
        o.bateraiKWh ? `${ctx.num(o.bateraiKWh, 2)} kWh` : ""
      );
    if (!off)
      s += box(
        550,
        206,
        150,
        104,
        ik(ctx.IC.grid),
        "Jaringan PLN",
        hoff ? "sumber cadangan · tanpa ekspor" : "kWh meter + smart meter"
      );
    s +=
      line("M170 82 H281", "dc") +
      `<text x="226" y="74" class="dlab" text-anchor="middle">DC</text>`;
    s +=
      line("M435 82 H546", "ac") +
      `<text x="490" y="74" class="dlab" text-anchor="middle">AC</text>`;
    if (hyb) s += line("M360 134 V202", "dc") + `<text x="372" y="172" class="dlab">DC</text>`;
    if (hoff)
      s += `<path d="M550 258 H470 V112 H439" class="dl ac" marker-end="url(#ar-ac)"/><text x="476" y="250" class="dlab">AC input (cadangan)</text>`;
    else if (!off)
      s +=
        line("M625 206 V138", "ac") +
        `<text x="637" y="176" class="dlab">AC</text>` +
        `<path d="M550 258 H470 V100 H439" class="dl sg" stroke-dasharray="5 4" marker-end="url(#ar-sg)"/><text x="476" y="250" class="dlab">monitoring / zero export</text>`;
    s += `<g class="dleg" transform="translate(20 300)"><rect width="16" height="4" y="-4" class="dc"/><text x="22" y="0">Arus DC</text><rect x="90" width="16" height="4" y="-4" class="ac"/><text x="112" y="0">Arus AC</text>${!off ? '<rect x="178" width="16" height="4" y="-4" class="sg"/><text x="200" y="0">Sinyal / komunikasi</text>' : ""}</g></svg>`;
    return s;
  }

  Object.assign(ctx, { niceStep, grafikBatang, grafikGaris, diagramSistem });
}

if (typeof module !== "undefined" && module.exports) module.exports = initProposalCharts;
