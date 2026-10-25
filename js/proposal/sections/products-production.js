// Product specifications and energy production.
// Dependencies and shared state are provided through ctx.
function initProposalSectionsProductsProduction(ctx) {
  const garansiKomp = (c) =>
    c.garansi || (c.produk && (c.produk.garansiProduk || c.produk.garansi)) || 0;
  function spesifikasi() {
    // Ringkas: 4 data kunci + 3 keunggulan per produk; detail lengkap lewat link datasheet.
    const PILIH = {
      pv: [
        [/rating\s*daya/i, "Daya", (v) => ctx.num(+v || 0) + " Wp"],
        [/jenis\s*cell|jenis\s*sel/i, "Teknologi"]
      ],
      inverter: [
        [/jenis\s*inverter/i, "Tipe"],
        [
          /rating\s*daya\s*output|daya\s*output/i,
          "Output",
          (v) => String(v).replace(/(\d)\s*W\b/i, "$1 W")
        ]
      ],
      baterai: [
        [/kapasitas/i, "Kapasitas", (v) => ctx.num(+v || 0) + " Wh"],
        [/jenis\s*baterai/i, "Kimia"]
      ]
    };
    const NAMA = {
      pv: ["Panel Surya", ctx.IC.panel],
      inverter: ["Inverter", ctx.IC.bolt],
      baterai: ["Baterai", ctx.IC.battery]
    };
    // kelompokkan produk yang sama di beberapa opsi agar tidak berulang
    const daftar = [];
    ctx.D.opsi.forEach((o) =>
      ["pv", "inverter", "baterai"].forEach((key) => {
        const c = o.komponen[key];
        if (!c) return;
        const id = key + "|" + (c.model || c.nama || c.uraian);
        let d = daftar.find((x) => x.id === id);
        if (!d) daftar.push((d = { id, key, c, pakai: [] }));
        d.pakai.push({ label: o.label, qty: c.qty });
      })
    );
    daftar.sort(
      (a, b) =>
        ["pv", "inverter", "baterai"].indexOf(a.key) - ["pv", "inverter", "baterai"].indexOf(b.key)
    );
    const kartu = (d) => {
      const c = d.c,
        spek = c.spek || [];
      const baris = PILIH[d.key]
        .map(([re, lb, f]) => {
          const r = spek.find((x) => re.test(x[0]));
          return r && /[0-9a-z]/i.test(String(r[1])) ? [lb, f ? f(r[1]) : String(r[1])] : null;
        })
        .filter(Boolean);
      const jml = ctx.multi
        ? d.pakai.map((x) => `${ctx.esc(x.label)}: ${ctx.num(x.qty)}`).join(" · ")
        : `${ctx.num(c.qty)} ${d.key === "pv" ? "keping" : "unit"}`;
      return `<article class="prod">
        <header><div class="pi">${NAMA[d.key][1]}</div><div><small>${NAMA[d.key][0]}</small><b>${ctx.esc(c.merek || "")}</b><span>${ctx.esc(c.model || c.nama || c.uraian)}</span></div></header>
        <div class="qty">${jml}</div>
        ${baris.length ? `<dl class="ks">${baris.map((b) => `<dt>${ctx.esc(b[0])}</dt><dd>${ctx.esc(b[1])}</dd>`).join("")}</dl>` : ""}
        ${
          (c.keunggulan || []).length
            ? `<ul class="checks">${c.keunggulan
                .slice(0, 2)
                .map((t) => `<li>${ctx.esc(t)}</li>`)
                .join("")}</ul>`
            : ""
        }
        <footer>${garansiKomp(c) ? `<span class="wb">${ctx.IC.shield} Garansi ${ctx.num(garansiKomp(c))} tahun</span>` : "<span></span>"}${c.datasheet ? `<a class="ds-link" href="${ctx.esc(c.datasheet)}" target="_blank" rel="noopener">Datasheet ${ctx.IC.ext}</a>` : ""}</footer>
      </article>`;
    };
    return `<section class="sheet" id="spesifikasi">${ctx.kepala(ctx.NO.spesifikasi, "Spesifikasi & Garansi Produk", "Ringkasan komponen utama — spesifikasi lengkap pada link datasheet")}
      <div class="prods c${Math.min(3, daftar.length)}">${daftar.map(kartu).join("")}</div>
      ${ctx.D.garansi.length ? `<h3 class="h3">Garansi Produk</h3><div class="warranty">${ctx.D.garansi.map((x) => `<div><b>${ctx.esc(x.durasi)}</b><span>${ctx.esc(x.item)}</span>${x.ket ? `<em>${ctx.esc(x.ket)}</em>` : ""}</div>`).join("")}</div>` : ""}
      <p class="fine">Datasheet resmi pabrikan dapat dibuka melalui tombol "Datasheet" pada setiap produk (memerlukan koneksi internet). Garansi mengikuti ketentuan resmi pabrikan.</p>
    </section>`;
  }

  function produksi() {
    const o = ctx.rek(),
      r = o.hasil,
      pv = o.komponen.pv || { qty: 0, wp: 0 };
    const cak = r.cakupan;
    return `<section class="sheet" id="produksi">${ctx.kepala(ctx.NO.produksi, "Proyeksi Produksi Energi", `Lokasi ${ctx.D.survey && ctx.D.survey.koordinat ? ctx.D.survey.koordinat : ctx.esc(ctx.D.proyek.alamat || "")}`)}
      <div class="kpis">
        ${ctx.kpi("bolt", ctx.kWh(r.produksiDasar), "produksi per tahun")}
        ${ctx.kpi("sun", ctx.kWh(((r.produksiBulanDasar / 30) * 365) / 12), "rata-rata per bulan")}
        ${ctx.kpi("clock", ctx.num(ctx.A.jamEfektif, 2) + " jam", "jam matahari efektif / hari")}
        ${ctx.kpi("home", cak != null ? ctx.pct(cak) : "-", "kebutuhan listrik tertutup PLTS")}
      </div>
      ${ctx.multi ? `<div class="tw"><table class="tbl num"><thead><tr><th>Opsi</th><th>Sistem</th><th>Kapasitas</th><th>Produksi / tahun</th><th>Kebutuhan tertutup</th></tr></thead><tbody>${ctx.D.opsi.map((x) => `<tr class="${x.id === ctx.D.rekomendasi ? "rec-row" : ""}"><td><b>${ctx.esc(x.label)}</b></td><td>${ctx.esc(ctx.D.namaSistem[x.jenis])}</td><td>${ctx.num(x.kWp, 2)} kWp</td><td>${ctx.kWh(x.hasil.produksiDasar)}</td><td>${x.hasil.cakupan != null ? ctx.pct(x.hasil.cakupan) : "-"}</td></tr>`).join("")}</tbody></table></div>` : ""}
      <div class="two w60">
        <div>
          <h3 class="h3">Cara Perhitungan${ctx.multi ? ` <small>${ctx.esc(o.label)}</small>` : ""}</h3>
          <div class="calc">
            <div><small>Kapasitas</small><code>${ctx.num(pv.qty)} panel × ${ctx.num(pv.wp)} Wp</code><b>${ctx.num(o.kWp, 2)} kWp</b></div>
            <div><small>Produksi tahunan</small><code>${ctx.num(o.kWp, 2)} kWp × ${ctx.num(ctx.A.jamEfektif, 2)} jam × 365 hari</code><b>${ctx.kWh(r.produksiDasar)}</b></div>
            <div><small>Nilai energi</small><code>${ctx.kWh(r.produksiDasar / 12)} × Rp ${ctx.num(ctx.D.pln.tarif, 0)}/kWh</code><b>${ctx.rp((r.produksiDasar / 12) * ctx.D.pln.tarif)}/bln</b></div>
            <div><small>Degradasi panel</small><code>Tahun 1: ${ctx.num(o.degradasiTahun1, 1)}% · berikutnya ${ctx.num(o.degradasiTahunan, 1)}%/tahun</code><b>${ctx.kWh(r.produksiTahun1)} th-1</b></div>
          </div>
          <p class="note">Estimasi produksi memakai data radiasi matahari ${o.produksiImg ? "<b>PVWatts®</b> (National Renewable Energy Laboratory, AS) " : ""}untuk koordinat lokasi, orientasi ${ctx.D.survey && ctx.D.survey.orientasi ? ctx.esc(ctx.D.survey.orientasi) : "atap"}, dan kemiringan panel ${ctx.D.survey && ctx.D.survey.kemiringan ? ctx.esc(ctx.D.survey.kemiringan) : ""}.</p>
          ${cak != null ? `<div class="card cov"><div class="gauge" style="--p:${Math.round(cak * 100)}"><div><b>${ctx.pct(cak)}</b><span>dari ±${ctx.num(r.kwhBulan, 0)} kWh/bln</span></div></div><p>Sisa kebutuhan tetap disuplai PLN, sehingga seluruh energi PLTS terpakai langsung${o.bateraiKWh ? " atau disimpan di baterai" : ""} — tidak ada energi yang terbuang.</p></div>` : ""}
        </div>
        ${o.produksiImg ? `<figure class="card pvw"><img src="${o.produksiImg}" alt="Hasil simulasi PVWatts"><figcaption>Laporan simulasi PVWatts® untuk lokasi ini</figcaption></figure>` : ""}
      </div>
    </section>`;
  }

  Object.assign(ctx, { garansiKomp, spesifikasi, produksi });
}

if (typeof module !== "undefined" && module.exports)
  module.exports = initProposalSectionsProductsProduction;
