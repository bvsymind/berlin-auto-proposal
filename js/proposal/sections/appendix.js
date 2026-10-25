// Grouped BOQ detail and technical appendices.
// Dependencies and shared state are provided through ctx.
function initProposalSectionsAppendix(ctx) {
  function kelompokItem(o) {
    const kat = [];
    o.item.forEach((it) => {
      let g = kat.find((k) => k.nama === (it.kategori || "Lain-lain"));
      if (!g) kat.push((g = { nama: it.kategori || "Lain-lain", item: [], total: 0 }));
      g.item.push(it);
      g.total += it.total;
    });
    return kat;
  }
  function rincianBOQ() {
    if (!ctx.D.tampilkanRincian) return "";
    const ada = ctx.D.opsi.filter((o) => o.item.length);
    if (!ada.length) return "";
    return `<section class="sheet" id="rincian-boq">${ctx.kepala(ctx.NO.lampiran, "Lampiran — Rincian BOQ", "Hanya item dengan kuantitas & harga · harga sebelum diskon dan PPN")}
      ${ada
        .map((o) => {
          const kat = kelompokItem(o);
          return `${ctx.multi ? `<h3 class="h3">${ctx.esc(o.label)} — ${ctx.esc(ctx.judulSistem(o))}</h3>` : ""}
        <div class="tw"><table class="tbl num sm boq"><thead><tr><th>No</th><th>Uraian</th><th>Merek</th><th>Qty</th><th>Harga Satuan</th><th>Jumlah</th></tr></thead>
        ${kat
          .map(
            (
              k,
              ki
            ) => `<tbody><tr class="cat"><td>${String.fromCharCode(65 + ki)}</td><td colspan="4">${ctx.esc(k.nama)}</td><td>${ctx.rp(k.total)}</td></tr>
          ${k.item.map((it, i) => `<tr><td>${i + 1}</td><td>${ctx.esc(it.nama)}${it.spek ? `<small>${ctx.esc(it.spek)}</small>` : ""}</td><td>${ctx.esc(it.merek || "")}</td><td>${ctx.num(it.qty, it.qty % 1 ? 2 : 0)} ${ctx.esc(it.satuan)}</td><td>${ctx.rp(it.harga)}</td><td>${ctx.rp(it.total)}</td></tr>`).join("")}</tbody>`
          )
          .join("")}
        <tbody class="tot"><tr><td colspan="5">Sub Total</td><td>${ctx.rp(o.subtotal)}</td></tr>${o.diskon ? `<tr class="disc"><td colspan="5">Diskon</td><td>− ${ctx.rp(o.diskon)}</td></tr>` : ""}${o.ppn ? `<tr><td colspan="5">PPN 11%</td><td>${ctx.rp(o.ppn)}</td></tr>` : ""}<tr class="grand"><td colspan="5">TOTAL</td><td>${ctx.rp(o.investasi)}</td></tr></tbody></table></div>`;
        })
        .join("")}
    </section>`;
  }
  function lampiran() {
    const daftar = [];
    ctx.D.opsi.forEach((o) =>
      ["pv", "inverter", "baterai"].forEach((k) => {
        const c = o.komponen[k];
        if (c && c.datasheet && !daftar.some((d) => d[2] === c.datasheet))
          daftar.push([
            `Datasheet ${k === "pv" ? "panel surya" : k}`,
            `${c.merek || ""} ${c.model || c.nama || ""}`,
            c.datasheet
          ]);
      })
    );
    if (ctx.P.linkCompanyProfile)
      daftar.push(["Company Profile", ctx.P.badanUsaha || ctx.P.nama, ctx.P.linkCompanyProfile]);
    const asum = [
      [
        "Metode perhitungan",
        ctx.A.metode === "bulanan"
          ? "Bulanan (300 bulan), sama dengan kalkulasi internal kami"
          : "Tahunan"
      ],
      ["Jam matahari efektif", ctx.num(ctx.A.jamEfektif, 2) + " jam/hari"],
      ["Tarif listrik", `Rp ${ctx.num(ctx.D.pln.tarif, 2)}/kWh (tagihan ÷ pemakaian)`],
      ["Kenaikan tarif PLN", ctx.num(ctx.A.kenaikanTarif, 1) + "% per tahun"],
      [
        "Degradasi panel",
        `${ctx.num(ctx.rek().degradasiTahun1, 1)}% tahun pertama, ${ctx.num(ctx.rek().degradasiTahunan, 1)}%/tahun berikutnya`
      ],
      [
        "Energi PLTS terpakai sendiri",
        ctx.num(ctx.A.pemakaianSendiri, 0) + "% (tanpa ekspor ke PLN, Permen ESDM No. 2/2024)"
      ],
      ["Periode analisis", ctx.A.horizonTahun + " tahun"],
      [
        "Faktor emisi",
        ctx.num(ctx.A.faktorEmisi, 3) +
          " kg CO₂/kWh · serapan pohon " +
          ctx.num(ctx.A.serapanPohon, 1) +
          " kg CO₂/tahun"
      ]
    ];
    return `<section class="sheet" id="lampiran">${ctx.kepala(ctx.NO.lampiran, "Lampiran", "Dokumen pendukung & asumsi")}
      ${daftar.length ? `<div class="att">${daftar.map((d) => `<a href="${ctx.esc(d[2])}" target="_blank" rel="noopener">${ctx.IC.doc}<span><small>${ctx.esc(d[0])}</small>${ctx.esc(d[1])}</span><em>Buka ${ctx.IC.ext}</em></a>`).join("")}</div>` : ""}
      <h3 class="h3">Asumsi Perhitungan</h3>
      ${ctx.kv(asum)}
      <p class="fine">Perhitungan bersifat estimasi berdasarkan data survey dan asumsi di atas. Produksi aktual dipengaruhi cuaca, kebersihan panel, bayangan, dan pola pemakaian listrik.</p>
    </section>`;
  }

  Object.assign(ctx, { kelompokItem, rincianBOQ, lampiran });
}

if (typeof module !== "undefined" && module.exports) module.exports = initProposalSectionsAppendix;
