// Payment, warranties and company profile.
// Dependencies and shared state are provided through ctx.
function initProposalSectionsCompany(ctx) {
  function garansiBayar() {
    const g = ctx.D.garansi;
    return `<section class="sheet" id="garansi">${ctx.kepala(ctx.NO.garansi, "Pembayaran & Tahapan Proyek")}
      <h3 class="h3 m0">Termin Pembayaran</h3>
      <div class="pay">${ctx.D.termin.map((t, i) => `<div class="pay-i"><div class="pay-p"><b>${ctx.num(t.persen)}%</b></div><div><b>${ctx.esc(t.ket)}</b>${ctx.D.opsi.map((o) => `<span>${ctx.multi ? ctx.esc(o.label) + ": " : ""}${ctx.rp((o.investasi * t.persen) / 100)}</span>`).join("")}</div></div>`).join("")}</div>
      ${ctx.D.bank ? `<div class="bank">${ctx.IC.wallet}<div><small>Pembayaran melalui transfer ke rekening</small><b>${ctx.esc(ctx.D.bank.nama)} · ${ctx.esc(ctx.D.bank.nomor)}</b><span>a.n. ${ctx.esc(ctx.D.bank.atasNama)}</span></div></div>` : ""}
      <h3 class="h3">Tahapan Proyek</h3>
      <ol class="timeline">${ctx.D.timeline.map((t, i) => `<li><span>${i + 1}</span><b>${ctx.esc(t.tahap)}</b>${t.durasi ? `<em>${ctx.esc(t.durasi)}</em>` : ""}</li>`).join("")}</ol>
    </section>`;
  }

  function tentang() {
    const PF = ctx.D.portofolio || { proyek: [] },
      seg = ctx.D.proyek.segmen;
    const ik = ["award", "users", "shield", "tools", "wallet", "check"];
    // pilih proyek: utamakan segmen yang sama dengan pelanggan, lalu kapasitas terbesar
    const pr = PF.proyek.slice();
    const mirip = (p) =>
      seg === "rumah"
        ? /residensial/i.test(p.segmen)
        : seg === "pabrik" || seg === "gudang"
          ? /industri/i.test(p.segmen)
          : /komersial|pendidikan|kesehatan/i.test(p.segmen);
    const pilihan = pr
      .filter(mirip)
      .concat(pr.filter((p) => !mirip(p)))
      .slice(0, 6);
    const totalKWp = pr.reduce((s, p) => {
      const m = String(p.kapasitas).match(/^([\d.,]+)\s*kWp/i);
      return s + (m ? parseFloat(m[1].replace(/\./g, "").replace(",", ".")) : 0);
    }, 0);
    const tahun = ctx.P.berdiri
      ? new Date(ctx.D.proyek.tanggal || Date.now()).getFullYear() - ctx.P.berdiri
      : 0;
    return `<section class="sheet" id="tentang">${ctx.kepala(ctx.NO.tentang, `Tentang ${ctx.titleCase(ctx.P.nama)}`, ctx.P.badanUsaha || "")}
      <div class="about">
        <div><p class="lead">${ctx.esc(ctx.P.badanUsaha || ctx.P.nama)} adalah perusahaan yang bergerak di bidang <b>desain, pengadaan, dan instalasi Pembangkit Listrik Tenaga Surya</b> untuk rumah tinggal, gedung komersial, hingga industri${ctx.P.berdiri ? ` sejak ${ctx.P.berdiri}` : ""}.</p>
          <p class="vm"><b>Visi</b> Mempercepat adopsi energi surya yang berkelanjutan secara luas.</p>
          <p class="vm"><b>Misi</b> Menawarkan produk berkualitas dengan harga kompetitif, memberikan layanan purna jual yang optimal, dan selalu mengutamakan keselamatan dalam instalasi maupun operasional sistem PLTS.</p></div>
        <div class="stats">
          ${tahun > 0 ? `<div><b>${tahun}+</b><span>tahun pengalaman</span></div>` : ""}
          <div><b>${ctx.num(pr.length)}+</b><span>proyek terpilih</span></div>
          ${totalKWp ? `<div><b>${ctx.num(totalKWp / 1000, 1)} MWp</b><span>kapasitas terpasang (proyek terpilih)</span></div>` : ""}
          <div><b>${ctx.num((PF.klien || []).length)}+</b><span>klien korporasi</span></div>
        </div>
      </div>
      <h3 class="h3">Mengapa ${ctx.titleCase(ctx.P.nama)}?</h3>
      <div class="why">${ctx.D.mengapaKami.map((m, i) => `<div class="card"><div class="wi">${ctx.IC[ik[i % ik.length]]}</div><b>${ctx.esc(m[0])}</b><p>${ctx.esc(m[1])}</p></div>`).join("")}</div>
      ${
        pilihan.length
          ? `<h3 class="h3 brk">Portofolio Proyek</h3>
      <div class="porto">${pilihan.map((p) => `<figure><img src="${p.foto}" alt="${ctx.esc(p.nama)}" loading="lazy"><figcaption><b>${ctx.esc(p.nama)}</b><span>${ctx.esc(p.sistem)} · ${ctx.esc(p.kapasitas)}</span><em>${ctx.IC.pin} ${ctx.esc(p.lokasi)}</em></figcaption></figure>`).join("")}</div>`
          : ""
      }
      ${seg === "rumah" && (PF.residensial || []).length && pilihan.filter((p) => /residensial/i.test(p.segmen)).length < 2 ? `<h3 class="h3">Contoh Instalasi Residensial</h3><div class="gal g4">${PF.residensial.map((f) => `<figure><img src="${f.foto}" alt="" loading="lazy"><figcaption>${ctx.esc(f.ket)}</figcaption></figure>`).join("")}</div>` : ""}
      ${(PF.klien || []).length ? `<h3 class="h3">Dipercaya oleh</h3><div class="chips cl">${PF.klien.map((k) => `<span>${ctx.esc(k)}</span>`).join("")}</div>` : ""}
      ${(PF.mitra || []).length ? `<p class="note"><b>Mitra produk:</b> ${PF.mitra.map(ctx.esc).join(" · ")}</p>` : ""}
      ${(PF.bankMitra || []).length ? `<p class="note"><b>Bank mitra pembiayaan:</b> ${PF.bankMitra.map(ctx.esc).join(" · ")}</p>` : ""}
      ${ctx.P.linkCompanyProfile ? `<a class="btn ghost no-print-hide" href="${ctx.esc(ctx.P.linkCompanyProfile)}" target="_blank" rel="noopener">${ctx.IC.doc} Unduh Company Profile lengkap ${ctx.IC.ext}</a>` : ""}
    </section>`;
  }

  Object.assign(ctx, { garansiBayar, tentang });
}

if (typeof module !== "undefined" && module.exports) module.exports = initProposalSectionsCompany;
