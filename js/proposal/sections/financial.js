// Financial projections and cash-flow details.
// Dependencies and shared state are provided through ctx.
function initProposalSectionsFinancial(ctx) {
  function finansial() {
    return `<section class="sheet" id="finansial">${ctx.kepala(ctx.NO.finansial, "Analisis Finansial", `Metode perhitungan bulanan · kenaikan tarif ${ctx.num(ctx.A.kenaikanTarif, 1)}%/tahun · ${ctx.A.horizonTahun} tahun`)}
      ${ctx.grafikTagihan()}
      ${ctx.D.opsi
        .map((o, oi) => {
          const r = o.hasil;
          const kunci = (t) =>
            r.horizon <= 15 ||
            t.tahun <= 10 ||
            t.tahun % 5 === 0 ||
            t.tahun === Math.ceil(r.bep || 0);
          return `${ctx.multi ? `<h3 class="h3 opt-h${oi ? " brk" : ""}">${ctx.esc(o.label)} — ${ctx.esc(ctx.judulSistem(o))}</h3>` : ""}
        <div class="kpis k5 fin">
          ${ctx.kpi("wallet", ctx.rs(o.investasi), "Investasi")}
          ${ctx.kpi("sun", ctx.rp(r.hematBulan1), "Hemat bulan pertama")}
          ${ctx.kpi("clock", (ctx.bln(r) ?? "-") + " bln", "Balik modal")}
          ${ctx.kpi("chart", ctx.pct(r.roi), `ROI ${r.horizon} tahun`)}
          ${ctx.kpi("award", r.irr != null ? ctx.pct(r.irr, 1) : "-", "IRR")}
        </div>
        <div class="card chart-card">${ctx.grafikBatang(o)}<div class="lg-inline"><span><i class="neg"></i>Belum balik modal</span><span><i class="pos"></i>Sudah untung</span></div></div>
        <h3 class="h3">Proyeksi Penghematan Tahunan</h3>
        <div class="tw"><table class="tbl num bep-t"><thead><tr><th>Tahun</th><th>Tarif (Rp/kWh)</th><th>Produksi (kWh)</th><th>Penghematan</th><th>Posisi Kas</th><th></th></tr></thead><tbody>
          <tr class="inv"><td>0</td><td>—</td><td>—</td><td>Investasi</td><td>${ctx.rp(-o.investasi)}</td><td></td></tr>
          ${r.tahun
            .map((t) => {
              const isB = r.bep != null && t.tahun === Math.ceil(r.bep);
              return `<tr class="${isB ? "bep-row" : ""} ${t.kumulatif < 0 ? "is-neg" : ""} ${kunci(t) ? "" : "pr-hide"}"><td>${t.tahun}</td><td>${ctx.num(t.tarif, 0)}</td><td>${ctx.num(t.produksi, 0)}</td><td>${ctx.rp(t.bersih)}</td><td>${ctx.rp(t.kumulatif)}</td><td>${isB ? `<span class="pill">${ctx.IC.check} BEP</span>` : ""}</td></tr>`;
            })
            .join("")}
        </tbody></table></div>
        ${r.horizon > 15 ? `<p class="note pr-only">Ditampilkan tahun-tahun kunci; tabel lengkap ${r.horizon} tahun tersedia di versi proposal interaktif (.html).</p>` : ""}
        <div class="sum-box">
          <div><small>Total penghematan ${r.horizon} th</small><b>${ctx.rs(r.totalHemat)}</b></div>
          <div><small>Keuntungan bersih</small><b>${ctx.rs(r.netProfit)}</b></div>
          <div><small>Kelipatan investasi</small><b>${ctx.num(r.kelipatan, 2)}×</b></div>
          <div><small>Harga per Wp</small><b>${ctx.rp(r.biayaPerWp)}</b></div>
        </div>`;
        })
        .join("")}
    </section>`;
  }

  Object.assign(ctx, { finansial });
}

if (typeof module !== "undefined" && module.exports) module.exports = initProposalSectionsFinancial;
