// Preview scheduling, validation and output file names.
// Dependencies and shared state are provided through ctx.
function initAppPreview(ctx) {
  // ---------------------------- PREVIEW & EKSPOR ----------------------------
  let tPrev = null;
  function jadwalPreview() {
    clearTimeout(tPrev);
    tPrev = setTimeout(preview, 350);
    ctx.simpanLokal();
  }
  function preview() {
    const fr = ctx.$("#preview");
    if (!ctx.S.opsi.length) {
      fr.srcdoc = kosong();
      return;
    }
    let y = 0;
    try {
      y = fr.contentWindow.scrollY;
    } catch (e) {}
    const D = ctx.rakit();
    syncTeksOtomatis();
    fr.onload = () => {
      try {
        fr.contentWindow.scrollTo(0, y);
      } catch (e) {}
    };
    fr.srcdoc = buatHTMLProposal(D);
    cekKesehatan(D);
  }
  function kosong() {
    return `<!doctype html><html><body style="margin:0;display:grid;place-items:center;height:100vh;font:15px Poppins,Segoe UI,sans-serif;color:#64748B;background:#F1F5F9;text-align:center">
    <div><img src="${window.ASSETS.logo}" style="height:54px;margin-bottom:18px"><div style="font-size:20px;color:#030F27;font-weight:600">Pratinjau proposal tampil di sini</div><p>Mulai dengan mengunggah file BOQ / quotation (PDF atau Excel) di panel kiri.</p></div></body></html>`;
  }
  function syncTeksOtomatis() {
    const a = ctx.$("#f_alasan"),
      p = ctx.$("#f_penutup");
    if (a && !ctx.S.manualAlasan && document.activeElement !== a) a.value = ctx.S.alasanTeks;
    if (p && !ctx.S.manualPenutup && document.activeElement !== p) p.value = ctx.S.penutupTeks;
  }
  function cekKesehatan(D) {
    const box = ctx.$("#health"),
      L = [];
    if (!ctx.S.pln.tagihan)
      L.push(["warn", "Isi tagihan listrik rata-rata per bulan agar BEP dan penghematan akurat."]);
    if (!ctx.S.sales.nama)
      L.push(["warn", "Nama sales PIC belum diisi (bagian 2) — tidak ditemukan di sheet DB LHS."]);
    else if (!ctx.S.sales.wa)
      L.push([
        "warn",
        `Nomor WhatsApp sales ${ctx.S.sales.nama} belum diisi (bagian 2). Sementara tombol WhatsApp memakai nomor perusahaan.`
      ]);
    if (ctx.S.opsi.length && ctx.S._pshSumber !== "lhs")
      L.push([
        "info",
        `LHS tidak melampirkan proyeksi produksi (PVWatts/Helioscope) — produksi dihitung dari PSH ${ctx.K.num(ctx.S.asumsi.jamEfektif, 2)} jam/hari (ubah di bagian 2).`
      ]);
    ctx.S.opsi.forEach((o) =>
      ["pv", "inverter", "baterai"].forEach((x) => {
        const c = ctx.komponenFinal(o, x);
        if (c && !(c.garansi || (c.produk && (c.produk.garansiProduk || c.produk.garansi))))
          L.push([
            "warn",
            `${o.label}: garansi ${x === "pv" ? "panel surya" : x} belum ada — isi di bagian Komponen.`
          ]);
      })
    );
    if (!ctx.S.pln.idPelanggan && !ctx.S.pln.idCatatan)
      L.push(["info", "ID pelanggan PLN belum diisi (opsional)."]);
    ctx.S.opsi.forEach((o) => {
      if (o.berlin && !o.layout)
        L.push(["info", `${o.label}: gambar layout panel (LHS bagian IV/V) tidak tersedia.`]);
    });
    if (!ctx.S.proyek.foto)
      L.push(["info", "Sampul memakai foto standar — foto drone/layout tidak tersedia di LHS."]);
    D.opsi.forEach((o) => {
      if (!o.kWp) L.push(["warn", `${o.label}: kapasitas PV 0 — periksa komponen.`]);
      if (o.hasil === undefined) {
        const h = ctx.K.hitung(o, D.pln, D.asumsi);
        if (h.dibatasi)
          L.push([
            "info",
            `${o.label}: produksi PLTS melebihi kebutuhan listrik — penghematan dibatasi pada pemakaian.`
          ]);
        if (h.bep == null)
          L.push(["warn", `${o.label}: belum balik modal dalam ${D.asumsi.horizonTahun} tahun.`]);
      }
    });
    ctx.S.opsi.forEach((o) => o.peringatan.forEach((p) => L.push(["warn", `${o.label}: ${p}`])));
    const kosongPT = Object.entries(ctx.ST.perusahaan)
      .filter(([, v]) => /\[ISI/.test(typeof v === "string" ? v : JSON.stringify(v)))
      .map(([k]) => k);
    if (kosongPT.length)
      L.push([
        "warn",
        `Data perusahaan belum lengkap (${kosongPT.join(", ")}) — lengkapi di data/pengaturan.js.`
      ]);
    const sv = ctx.S.survey || {},
      luasAtap = +(sv.isian || {}).luasAtap,
      byg = (sv.isian || {}).bayangan || "";
    if (!sv.sumber || !sv.sumber.length)
      L.push([
        "info",
        "Laporan survey belum diunggah — data atap & foto lokasi akan tampil di proposal."
      ]);
    if (luasAtap)
      D.opsi.forEach((o) => {
        if (o.luas > luasAtap)
          L.push([
            "warn",
            `${o.label}: butuh ~${ctx.K.num(o.luas, 0)} m², area tersedia menurut survey hanya ${ctx.K.num(luasAtap, 0)} m².`
          ]);
      });
    if (
      /ada|banyak|signifikan|sebagian|pohon|gedung/i.test(byg) &&
      !/tidak\s*ada|minim|tanpa/i.test(byg)
    )
      L.push([
        "info",
        `Survey mencatat bayangan: "${byg}" — pertimbangkan menurunkan jam produksi efektif.`
      ]);
    box.innerHTML = L.length
      ? L.map(
          (l) => `<div class="hl ${l[0]}">${l[0] === "warn" ? "⚠" : "ℹ"} ${ctx.esc(l[1])}</div>`
        ).join("")
      : `<div class="hl ok">✓ Semua data lengkap — proposal siap diunduh.</div>`;
    ctx.$("#healthCount").textContent = L.filter((l) => l[0] === "warn").length || "";
  }
  function namaFile(ext) {
    const p = ctx.S.proyek;
    const o = ctx.S.opsi.find((x) => x.id === ctx.S.rekomendasi) || ctx.S.opsi[0];
    const ref = (p.nomor || "").split("/")[3] || p.lokasi || "Pelanggan";
    const sistem =
      ctx.S.opsi.length > 1
        ? `PLTS ${ctx.S.opsi.length} Opsi`
        : o && o.judul
          ? o.judul.replace(/\s*-\s*/g, " ")
          : "PLTS";
    return (
      `PROPOSAL ${sistem} - ${ref} - ${p.tanggal || ""}`
        .replace(/[\\/:*?"<>|]/g, "")
        .replace(/\s+/g, " ") + `.${ext}`
    );
  }

  Object.assign(ctx, { jadwalPreview, preview, kosong, syncTeksOtomatis, cekKesehatan, namaFile });

  Object.defineProperty(ctx, "tPrev", {
    get: () => tPrev,
    set: (value) => {
      tPrev = value;
    }
  });
}
