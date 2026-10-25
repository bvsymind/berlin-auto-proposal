// Receive survey files and prepare survey data for proposals.
// Dependencies and shared state are provided through ctx.
function initAppImportsSurvey(ctx) {
  // ---------------------------- LAPORAN SURVEY ----------------------------
  async function terimaSurvey(files) {
    const status = ctx.$("#svStatus"),
      sv = ctx.S.survey,
      log = [];
    for (const f of files) {
      status.innerHTML = log.concat(`Membaca ${ctx.esc(f.name)}…`).join("<br>");
      try {
        const r = await ctx.PS.bacaFileSurvey(f);
        const isi = r.teks ? ctx.PS.bacaTeksSurvey(r.teks) : {};
        // isian baru tidak menimpa yang sudah diisi/diedit
        Object.entries(isi).forEach(([k, v]) => {
          if (sv.isian[k] == null || sv.isian[k] === "") sv.isian[k] = v;
        });
        r.foto.forEach((ft) => sv.foto.push({ src: ft.src, ket: ft.ket, tampil: true }));
        if (!sv.sumber.includes(f.name)) sv.sumber.push(f.name);
        terapkanSurvey(isi);
        log.push(
          `✓ ${ctx.esc(f.name)}: ${Object.keys(isi).length} isian, ${r.foto.length} foto terbaca`
        );
      } catch (e) {
        console.error(e);
        log.push(`✗ Gagal membaca ${ctx.esc(f.name)}: ${ctx.esc(e.message)}`);
      }
    }
    status.innerHTML = log.join("<br>");
    ctx.S.manualPenutup = false;
    ctx.renderForm();
    ctx.jadwalPreview();
  }
  // isi data pelanggan & PLN dari survey (hanya bila masih kosong)
  function terapkanSurvey(v) {
    const p = ctx.S.proyek,
      pl = ctx.S.pln;
    if (v.lokasi && !p.lokasi) p.lokasi = v.lokasi;
    if (v.pic && !p.pic) p.pic = v.pic;
    if (v.alamat && !p.alamat) p.alamat = v.alamat;
    if ((v.peruntukan || v.lokasi) && p.segmen === "lain")
      p.segmen = ctx.cariSegmen(v.peruntukan || v.lokasi);
    if (v.idPelanggan && !pl.idPelanggan) pl.idPelanggan = v.idPelanggan;
    if (typeof v.daya === "number" && !pl.kva) pl.kva = Math.round(v.daya * 100) / 100;
    if (v.golongan) {
      const g = String(v.golongan).toUpperCase(),
        kva = pl.kva || v.daya || 0;
      const kode = g === "R-1" ? (kva && kva <= 1.3 ? "R-1/1300" : "R-1/2200") : g;
      const t =
        ctx.ST.tarifPLN.find((t) => t.kode === kode) ||
        ctx.ST.tarifPLN.find((t) => t.kode.startsWith(g));
      if (t && !ctx.S._golonganManual) {
        pl.golongan = t.kode;
        pl.tarif = t.tarif;
      }
    }
    if (typeof v.tagihan === "number" && !pl.tagihan) pl.tagihan = v.tagihan;
    if (!pl.tagihan && typeof v.pemakaian === "number")
      pl.tagihan = Math.round((v.pemakaian * pl.tarif) / 1000) * 1000;
    if (typeof v.bebanKritis === "number" && v.bebanKritis > 0)
      ctx.S.asumsi.bebanBackupKW = v.bebanKritis;
  }
  const SV_SATUAN = { daya: " kVA", luasAtap: " m²", pemakaian: " kWh/bulan", bebanKritis: " kW" };
  // isian yang sudah tampil di bagian lain proposal (sampul / Analisis Konsumsi) atau bersifat pribadi
  const SV_TIDAK_TAMPIL = [
    "lokasi",
    "pic",
    "telepon",
    "alamat",
    "idPelanggan",
    "golongan",
    "daya",
    "tagihan",
    "pemakaian",
    "catatan",
    "surveyor"
  ];
  function surveyUntukProposal() {
    const sv = ctx.S.survey;
    if (!sv || !sv.tampil) return null;
    const fmt = (k, v) =>
      k === "tanggalSurvey" && /^\d{4}-\d{2}-\d{2}$/.test(v)
        ? ctx.PB.tanggalIndo(v)
        : typeof v === "number"
          ? ctx.K.num(v, v % 1 ? 2 : 0) + (SV_SATUAN[k] || "")
          : String(v);
    const baris = ctx.PS.FIELD.filter(
      (f) => !SV_TIDAK_TAMPIL.includes(f[0]) && sv.isian[f[0]] != null && sv.isian[f[0]] !== ""
    ).map((f) => [f[1], fmt(f[0], sv.isian[f[0]])]);
    const foto = sv.foto.filter((f) => f.tampil).map((f) => ({ src: f.src, ket: f.ket }));
    const koord = String(sv.isian.koordinat || "").match(
      /(-?\d{1,3}[.,]\d+)\s*[,;/ ]\s*(-?\d{1,3}[.,]\d+)/
    );
    if (!baris.length && !foto.length && !sv.isian.catatan) return null;
    const I = sv.isian;
    return {
      baris,
      foto,
      catatan: I.catatan || "",
      peta: koord
        ? `https://www.google.com/maps?q=${koord[1].replace(",", ".")},${koord[2].replace(",", ".")}`
        : "",
      tanggal: /^\d{4}-\d{2}-\d{2}$/.test(I.tanggalSurvey || "") ? I.tanggalSurvey : "",
      tim: I.surveyor || "",
      koordinat: I.koordinat || "",
      orientasi: I.orientasi || "",
      kemiringan: I.kemiringan || ""
    };
  }

  Object.assign(ctx, {
    terimaSurvey,
    terapkanSurvey,
    SV_SATUAN,
    SV_TIDAK_TAMPIL,
    surveyUntukProposal
  });
}
