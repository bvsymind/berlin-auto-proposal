// Option comparison table and recommendation.
// Dependencies and shared state are provided through ctx.
function initProposalSectionsComparison(ctx) {
  function perbandingan() {
    if (!ctx.multi) return "";
    const bk = (x) =>
      x.bateraiKWh
        ? `~${ctx.num(x.hasil.backupJam, 1)} jam @ ${ctx.num(ctx.A.bebanBackupKW, 1)} kW`
        : "Tidak ada";
    const metr = [
      ["Sistem", (x) => ctx.D.namaSistem[x.jenis]],
      ["Kapasitas PV", (x) => `${ctx.num(x.kWp, 2)} kWp`],
      ["Baterai", (x) => (x.bateraiKWh ? `${ctx.num(x.bateraiKWh, 2)} kWh` : "—")],
      [
        "Area panel",
        (x) =>
          x.luas ? `±${ctx.num(x.luas, 0)} m²${ctx.luasKanopi(x) ? " (incl. kanopi)" : ""}` : "—"
      ],
      ["Investasi", (x) => ctx.rp(x.investasi)],
      ["Biaya per Wp", (x) => (ctx.perWp(x) ? ctx.rp(ctx.perWp(x)) : "—")],
      [
        "Hemat bulan pertama",
        (x) => `${ctx.rp(x.hasil.hematBulan1)} (${ctx.pct(ctx.porsiTagihan(x), 1)})`
      ],
      ["Balik modal", (x) => (ctx.bln(x.hasil) ?? "-") + " bulan"],
      [`Keuntungan ${ctx.A.horizonTahun} tahun`, (x) => ctx.rp(x.hasil.netProfit)],
      [`ROI ${ctx.A.horizonTahun} tahun`, (x) => ctx.pct(x.hasil.roi)],
      ["Backup saat PLN padam", bk]
    ].filter((m) => !/^(Baterai|Backup)/.test(m[0]) || ctx.D.opsi.some((x) => x.bateraiKWh)); // tanpa baterai di semua opsi → baris tidak perlu
    const terbaik = (f, besar) => {
      const v = ctx.D.opsi.map(f);
      const b = besar ? Math.max(...v) : Math.min(...v);
      return ctx.D.opsi
        .filter((x, i) => Math.abs(v[i] - b) <= Math.abs(b) * 0.005 + 1e-9)
        .map((x) => x.id);
    };
    const unggul = {
      Investasi: terbaik((x) => x.investasi, false),
      "Biaya per Wp": terbaik((x) => ctx.perWp(x) || 9e9, false),
      "Hemat bulan pertama": terbaik((x) => x.hasil.hematBulan1, true),
      "Balik modal": terbaik((x) => ctx.bln(x.hasil) ?? 9999, false),
      [`Keuntungan ${ctx.A.horizonTahun} tahun`]: terbaik((x) => x.hasil.netProfit, true),
      [`ROI ${ctx.A.horizonTahun} tahun`]: terbaik((x) => x.hasil.roi, true)
    };
    const an = ctx.analisisOpsi(),
      o = an.o,
      r = o.hasil;
    const isi = (s) =>
      s.replace(
        /\{(\w+)\}/g,
        (m, k) =>
          ({
            kata: ctx.D.proyek.segmenKata || "Anda",
            backupJam: ctx.num(r.backupJam, 1),
            bebanBackup: ctx.num(ctx.A.bebanBackupKW, 1),
            bep: ctx.th(r.bep),
            roi: ctx.pct(r.roi),
            hemat25: ctx.rs(r.totalHemat),
            horizon: r.horizon
          })[k] ?? m
      );
    const alasan =
      ctx.D.alasanManual && (ctx.D.alasan || []).length
        ? ctx.D.alasan.map((a) => [isi(a[0]), isi(a[1])])
        : an.alasan;
    return `<section class="sheet flow" id="perbandingan">${ctx.kepala(ctx.NO.perbandingan, "Perbandingan & Rekomendasi", `${ctx.D.opsi.length} opsi sistem secara berdampingan`)}
      <div class="card chart-card">${ctx.grafikGaris()}<div class="lg-inline">${ctx.D.opsi.map((x, i) => `<span><i class="s${i % 4}"></i>${ctx.esc(x.label)} — ${ctx.esc(ctx.judulSistem(x))}</span>`).join("")}</div></div>
      <div class="tw"><table class="tbl cmp"><thead><tr><th>Aspek</th>${ctx.D.opsi.map((x) => `<th class="${x.id === ctx.D.rekomendasi ? "rec" : ""}">${ctx.esc(x.label)}${x.id === ctx.D.rekomendasi ? "<em>Rekomendasi</em>" : ""}</th>`).join("")}</tr></thead>
        <tbody>${metr.map((m) => `<tr><td>${m[0]}</td>${ctx.D.opsi.map((x) => `<td class="${(unggul[m[0]] || []).includes(x.id) && (unggul[m[0]] || []).length < ctx.D.opsi.length ? "best" : ""}">${ctx.esc(m[1](x))}</td>`).join("")}</tr>`).join("")}</tbody></table></div>
      <p class="note"><span class="best-key"></span> nilai terbaik untuk aspek tersebut. Persentase pada "Hemat bulan pertama" = porsi tagihan PLN saat ini yang terpangkas.</p>
      <div class="rec-card"><div class="rc-l">${ctx.IC.award}<small>Rekomendasi kami</small><b>${ctx.esc(o.label)} — ${ctx.esc(ctx.judulSistem(o))}</b>${an.ringkasan ? `<p class="rc-why">${ctx.esc(an.ringkasan.charAt(0).toUpperCase() + an.ringkasan.slice(1))} dibanding ${ctx.esc(an.pembanding)}, dengan investasi ${ctx.esc(ctx.rp(o.investasi))}.</p>` : ""}</div></div>
      <h3 class="h3">Mengapa ${ctx.esc(o.label)}?</h3>
      <div class="reasons">${alasan.map((a, i) => `<div class="rs"><span>${i + 1}</span><div><b>${ctx.esc(a[0])}</b><p>${ctx.esc(a[1])}</p></div></div>`).join("")}</div>
      ${an.alternatif.map(({ l, cocok, kons }) => (cocok.length ? `<div class="card alt"><h4>Kapan ${ctx.esc(l.label)} (${ctx.esc(ctx.judulSistem(l))}) lebih cocok?</h4><ul class="dots">${cocok.map((t) => `<li>${t}</li>`).join("")}</ul>${kons.length ? `<p class="kons"><b>Yang perlu dipertimbangkan:</b> dibanding ${ctx.esc(o.label)}, ${ctx.esc(kons.join(", ").replace(/, ([^,]*)$/, " dan $1"))}.</p>` : ""}</div>` : "")).join("")}
    </section>`;
  }

  Object.assign(ctx, { perbandingan });
}

if (typeof module !== "undefined" && module.exports)
  module.exports = initProposalSectionsComparison;
