// Executive summary, investment milestones and bill comparison.
// Dependencies and shared state are provided through ctx.
function initProposalSectionsSummary(ctx) {
  function ringkasan() {
    const o = ctx.rek(),
      r = o.hasil,
      pl = ctx.D.pln,
      k = o.komponen;
    const komp = [];
    if (k.pv)
      komp.push([
        ctx.IC.panel,
        "Panel Surya",
        `${ctx.esc(k.pv.merek || "")} ${ctx.esc(k.pv.jenisSel || "")} ${ctx.num(k.pv.wp)} Wp`,
        `${ctx.num(k.pv.qty)} keping`
      ]);
    if (k.inverter)
      komp.push([
        ctx.IC.bolt,
        "Inverter",
        `${ctx.esc(k.inverter.merek || "")} ${ctx.esc(k.inverter.jenisInv || ctx.D.namaSistem[o.jenis])} ${ctx.num(k.inverter.kw || 0, (k.inverter.kw || 0) % 1 ? 1 : 0)} kW${k.inverter.fase ? " / " + ctx.esc(k.inverter.fase) : ""}`,
        `${ctx.num(k.inverter.qty)} unit`
      ]);
    if (k.baterai)
      komp.push([
        ctx.IC.battery,
        "Baterai",
        `${ctx.esc(k.baterai.merek || "")} ${ctx.esc(k.baterai.jenisBat || "LiFePO4")} ${ctx.num((o.bateraiKWh * 1000) / (k.baterai.qty || 1), 0)} Wh`,
        `${ctx.num(k.baterai.qty)} unit`
      ]);
    const tl = [
      ["Bulan ke-0", ctx.rp(o.investasi), "Investasi awal", "inv"],
      [
        "Bulan ke-12",
        ctx.rp(-(r.kasBulan ? r.kasBulan(12) : r.tahun[0].kumulatif)),
        "Sisa modal",
        "inv"
      ],
      [
        `Bulan ke-${ctx.bln(r) ?? "-"}`,
        "Balik modal",
        ctx.bepTeks(r).replace(/^\d+ bulan /, ""),
        "bep"
      ],
      [
        "Bulan ke-144",
        ctx.rp(r.kasBulan ? r.kasBulan(144) : r.tahun[11].kumulatif),
        "Keuntungan 12 tahun",
        "pos"
      ],
      [`Bulan ke-${r.horizon * 12}`, ctx.rp(r.netProfit), `Keuntungan ${r.horizon} tahun`, "pos"]
    ];
    return `<section class="sheet" id="ringkasan">${ctx.kepala(ctx.NO.ringkasan, "Ringkasan Proposal", ctx.multi ? `Rekomendasi: ${o.label} — ${ctx.judulSistem(o)}` : ctx.judulSistem(o))}
      <div class="sys-card">
        <div class="sc-h"><small>Sistem yang ditawarkan</small><b>${ctx.esc(o.judul || ctx.judulSistem(o))}</b></div>
        <table class="sc-t">${komp.map((c) => `<tr><td>${c[0]}</td><td><b>${c[1]}</b></td><td>${c[2]}</td><td class="r">${c[3]}</td></tr>`).join("")}</table>
      </div>
      <div class="hero-kpi">
        <div class="kpis">
          ${ctx.kpi("wallet", ctx.rp(o.investasi), "Investasi (termasuk PPN)", "", o.investasi, "rp")}
          ${ctx.kpi("sun", ctx.rp(r.hematBulan1), "Penghematan bulan pertama", "", r.hematBulan1, "rp")}
          ${ctx.kpi("clock", (ctx.bln(r) ?? "-") + " bulan", "Balik modal (BEP)", "", ctx.bln(r), "bln")}
          ${ctx.kpi("chart", ctx.rs(r.netProfit), `Keuntungan bersih ${r.horizon} tahun`, "", r.netProfit, "rs")}
        </div>
      </div>
      ${ctx.multi ? `<h3 class="h3">Pilihan Sistem</h3><div class="tw"><table class="tbl cmp opts"><thead><tr><th>Opsi</th><th>Sistem</th><th>Investasi</th><th>Hemat / bulan</th><th>Balik modal</th></tr></thead><tbody>${ctx.D.opsi.map((x) => `<tr class="${x.id === ctx.D.rekomendasi ? "rec-row" : ""}"><td><b>${ctx.esc(x.label)}</b>${x.id === ctx.D.rekomendasi ? `<span class="pill">Rekomendasi</span>` : ""}</td><td>${ctx.esc(ctx.judulSistem(x))}</td><td>${ctx.rp(x.investasi)}</td><td>${ctx.rp(x.hasil.hematBulan1)}</td><td>${ctx.bln(x.hasil) ?? "-"} bulan</td></tr>`).join("")}</tbody></table></div>` : ""}
      <h3 class="h3">Perjalanan Investasi${ctx.multi ? ` <small>${ctx.esc(o.label)}</small>` : ""}</h3>
      <div class="card ijr">${perjalanan(o)}</div>
      <div class="two">
        <div class="card"><h4>${ctx.IC.wallet} Tagihan listrik per bulan</h4>
          ${bar("Sebelum PLTS", pl.tagihan, pl.tagihan, "b0")}
          ${bar("Sesudah PLTS", r.tagihanSesudah, pl.tagihan, "b1")}
          <p class="note">Tagihan diperkirakan turun <b>${ctx.pct(r.persenHemat)}</b> di bulan pertama. Nilai penghematan ikut naik seiring kenaikan tarif PLN (asumsi ${ctx.num(ctx.A.kenaikanTarif, 1)}%/tahun).</p></div>
        <div class="card"><h4>${ctx.IC.leaf} Dampak lingkungan per tahun</h4>
          <div class="eco-mini">
            <div>${ctx.IC.bolt}<b>${ctx.kWh(r.produksiDasar)}</b><span>energi bersih</span></div>
            <div>${ctx.IC.tree}<b>${ctx.num(r.pohonTahunan, 0)} pohon</b><span>setara penyerapan CO₂</span></div>
            <div>${ctx.IC.leaf}<b>${ctx.num(r.co2Tahun1, 2)} ton</b><span>CO₂ dihindari</span></div>
          </div></div>
      </div>
    </section>`;
  }
  // Perjalanan investasi: 5 tonggak dalam satu baris (anak panah merah → emas → biru) + skala bulan proporsional
  function perjalanan(o) {
    const r = o.hasil,
      H = r.horizon * 12,
      bep = ctx.bln(r);
    const kas = (m) =>
      m <= 0
        ? -o.investasi
        : r.kasBulan
          ? r.kasBulan(m)
          : (r.tahun[Math.ceil(m / 12) - 1] || r.tahun[r.tahun.length - 1]).kumulatif;
    const t = [
      [0, "Bulan ke-0", ctx.rp(o.investasi), "Investasi awal", "inv"],
      [12, "Bulan ke-12", ctx.rp(-kas(12)), "Sisa modal", "inv2"],
      [
        bep,
        `Bulan ke-${bep ?? "-"}`,
        "Balik modal",
        ctx.bepTeks(r).replace(/^\d+ bulan \(|\)$/g, ""),
        "bep"
      ],
      [144, "Bulan ke-144", ctx.rp(kas(144)), "Untung 12 tahun", "pos"],
      [H, `Bulan ke-${H}`, ctx.rp(kas(H)), `Untung ${r.horizon} tahun`, "pos2"]
    ];
    const pct = (m) => Math.max(0, Math.min(100, ((m || 0) / H) * 100));
    return `<div class="ij">${t.map((x) => `<div class="ij-s ${x[4]}"><small>${ctx.esc(x[1])}</small><b>${ctx.esc(x[2])}</b><span>${ctx.esc(x[3])}</span></div>`).join("")}</div>
      <div class="ij-bar"><i style="width:${pct(bep)}%"></i>${t.map((x) => `<em class="${x[4]}" style="left:${pct(x[0])}%"></em>`).join("")}</div>
      <div class="ij-ax"><span>0</span><span>${bep ? `balik modal bulan ke-${bep}` : ""}</span><span>${H} bulan</span></div>`;
  }
  // Tagihan listrik per tahun: tanpa PLTS vs dengan PLTS (selisih = penghematan)
  function grafikTagihan() {
    const pl = ctx.D.pln;
    if (!(pl.tagihan > 0)) return "";
    const n = ctx.A.horizonTahun,
      e = (ctx.A.kenaikanTarif || 0) / 100;
    const tanpa = [...Array(n)].map(
      (_, i) => pl.tagihan * 12 * (ctx.A.metode === "bulanan" ? 1 + e * i : Math.pow(1 + e, i))
    );
    const ser = ctx.D.opsi.map((o) =>
      tanpa.map((v, i) => Math.max(0, v - ((o.hasil.tahun[i] || {}).hemat || 0)))
    );
    const W = 720,
      H = 250,
      L = 58,
      R = 14,
      T = 16,
      B = 32,
      w = W - L - R,
      h = H - T - B;
    const mx = Math.max(...tanpa) * 1.05,
      step = ctx.niceStep(mx / 5);
    const x = (i) => L + (i / (n - 1)) * w,
      y = (v) => T + h - (v / (Math.ceil(mx / step) * step)) * h;
    let g = "";
    for (let v = 0; v <= Math.ceil(mx / step) * step + 1; v += step)
      g += `<line x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}" class="gl${v === 0 ? " z" : ""}"/><text x="${L - 8}" y="${y(v) + 4}" class="ax" text-anchor="end">${ctx.rs(v).replace("Rp ", "")}</text>`;
    for (let i = 0; i < n; i += 5)
      g += `<text x="${x(i)}" y="${H - B + 16}" class="ax" text-anchor="middle">${i + 1}</text>`;
    g += `<text x="${x(n - 1)}" y="${H - B + 16}" class="ax" text-anchor="middle">${n}</text>`;
    const ri = Math.max(
      0,
      ctx.D.opsi.findIndex((o) => o.id === ctx.D.rekomendasi)
    );
    g += `<polygon points="${tanpa.map((v, i) => x(i) + "," + y(v)).join(" ")} ${ser[ri]
      .map((v, i) => x(i) + "," + y(v))
      .reverse()
      .join(" ")}" class="tg-gap"/>`;
    g += `<polyline points="${tanpa.map((v, i) => x(i) + "," + y(v)).join(" ")}" class="tg-ln tanpa"/>`;
    ser.forEach((sr, k) => {
      g += `<polyline points="${sr.map((v, i) => x(i) + "," + y(v)).join(" ")}" class="tg-ln s${k % 4}"/>`;
    });
    tanpa.forEach((v, i) => {
      g += `<rect x="${x(i) - w / n / 2}" y="${T}" width="${w / n}" height="${h}" fill="transparent" data-tip="Tahun ke-${i + 1}|Tanpa PLTS: ${ctx.rp(v)}${ctx.D.opsi.map((o, k) => `|${ctx.multi ? ctx.esc(o.label) : "Dengan PLTS"}: ${ctx.rp(ser[k][i])}`).join("")}"/>`;
    });
    const tot = (a) => a.reduce((s2, v) => s2 + v, 0),
      tT = tot(tanpa),
      tD = tot(ser[ri]);
    return `<h3 class="h3">Tagihan Listrik ${n} Tahun: Tanpa vs Dengan PLTS</h3>
      <div class="card chart-card"><svg viewBox="0 0 ${W} ${H}" class="chart" role="img" aria-label="Tagihan listrik tanpa dan dengan PLTS">${g}</svg>
        <div class="lg-inline"><span><i class="tanpa"></i>Tanpa PLTS (tagihan eksisting ${ctx.rp(pl.tagihan)}/bulan, naik ${ctx.num(ctx.A.kenaikanTarif, 1)}%/tahun)</span>${ctx.D.opsi.map((o, k) => `<span><i class="s${k % 4}"></i>${ctx.multi ? ctx.esc(o.label) + " — " : ""}Dengan PLTS</span>`).join("")}<span><i class="gap"></i>Penghematan</span></div></div>
      <div class="tg-sum"><div><small>Total tagihan ${n} th tanpa PLTS</small><b>${ctx.rs(tT)}</b></div><div><small>Total tagihan ${n} th dengan PLTS${ctx.multi ? ` (${ctx.esc(ctx.D.opsi[ri].label)})` : ""}</small><b>${ctx.rs(tD)}</b></div><div class="hl"><small>Selisih = uang yang dihemat</small><b>${ctx.rs(tT - tD)}</b></div></div>`;
  }
  const bar = (lbl, v, max, cls) =>
    `<div class="bb"><span>${lbl}</span><div><i class="${cls}" style="width:${Math.max(3, (v / (max || 1)) * 100)}%"></i></div><b>${ctx.rp(v)}</b></div>`;

  Object.assign(ctx, { ringkasan, perjalanan, grafikTagihan, bar });
}

if (typeof module !== "undefined" && module.exports) module.exports = initProposalSectionsSummary;
