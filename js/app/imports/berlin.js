// Apply Berlin survey/workbook data and retrieve linked photos.
// Dependencies and shared state are provided through ctx.
function initAppImportsBerlin(ctx) {
  const JENIS_BANGUNAN = {
    residential: "Rumah tinggal (residensial)",
    residensial: "Rumah tinggal (residensial)",
    commercial: "Komersial",
    komersial: "Komersial",
    industrial: "Industri",
    industri: "Industri"
  };
  function terapkanBerlin(h, o) {
    const L = h.lhs,
      p = ctx.S.proyek,
      pl = ctx.S.pln,
      sv = ctx.S.survey,
      sav = h.sav || {};
    if (L.client) p.lokasi = L.client;
    if (L.lokasi) p.alamat = L.lokasi;
    p.pic = L.pemberiInfo && L.pemberiInfo !== L.client ? L.pemberiInfo : "";
    p.nomor = L.nomor || p.nomor;
    p.segmen = ctx.cariSegmen(`${L.jenisBangunan} ${L.judul}`);
    p.tanggal = ctx.hariIni();
    p.berlaku = ctx.tambahHari(p.tanggal, ctx.ST.masaBerlakuHari || 15);
    // kelistrikan
    const g = String(L.golongan || "")
      .toUpperCase()
      .match(/([RBIPS])\s*-?\s*(\d)/);
    if (g) {
      const kode = `${g[1]}-${g[2]}`;
      const t =
        ctx.ST.tarifPLN.find((t) => t.kode === kode) ||
        ctx.ST.tarifPLN.find((t) => t.kode.startsWith(kode));
      pl.golongan = t ? t.kode : "LAIN";
    }
    const dayaTeks = String(L.daya || ""),
      va = ctx.PB.angka(dayaTeks.split("/")[0]);
    if (va) pl.kva = va >= 100 ? va / 1000 : va;
    pl.fase = (dayaTeks.match(/\d\s*fasa/i) || [""])[0].replace(/\s+/, " ");
    const idnum = String(L.idPLN || "")
      .replace(/[\s.-]/g, "")
      .match(/^\d{8,13}$/);
    pl.idPelanggan = idnum ? String(L.idPLN).trim() : ""; // format asli (mis. 5366-1007-1014) dipertahankan pl.idCatatan = idnum || !L.idPLN ? "" : "Tidak tersedia saat survey";
    pl.kwh = L.kwh || 0;
    pl.tagihan = L.tagihan || pl.tagihan;
    pl.tarif = L.tarif || (L.tagihan && L.kwh ? L.tagihan / L.kwh : pl.tarif);
    pl.pascabayar = false;
    ctx.S._golonganManual = true;
    // asumsi = sheet Savings
    ctx.S.asumsi.metode = "bulanan";
    const kWp = o.komponen.pv ? (o.komponen.pv.qty * o.komponen.pv.wp) / 1000 : 0;
    if (L.psh > 0) {
      ctx.S.asumsi.jamEfektif = L.psh;
      ctx.S._pshSumber = "lhs";
    } else if (L.produksiTahunan && kWp) {
      ctx.S.asumsi.jamEfektif = L.produksiTahunan / kWp / 365;
      ctx.S._pshSumber = "lhs";
    } else if (ctx.S._pshSumber === "lhs") ctx.S._pshSumber = ""; // workbook ini tanpa proyeksi → PSH diisi manual
    // sales PIC dari DB LHS; nomor WA dari direktori bila sudah pernah diisi
    const db = h.db || {};
    if (ctx.S.sales.kunci) {
      /* mitra: Sales PIC selalu dirinya sendiri */
    } else if (db.pic && ctx.kunciNama(db.pic) !== ctx.kunciNama(ctx.S.sales.nama))
      ctx.S.sales = {
        nama: db.pic,
        wa: ctx.normWA(db.wa) || ctx.direktoriSales()[ctx.kunciNama(db.pic)] || ""
      };
    else if (db.pic && !ctx.S.sales.wa)
      ctx.S.sales.wa = ctx.normWA(db.wa) || ctx.direktoriSales()[ctx.kunciNama(db.pic)] || "";
    if (db.lamaHari > 0)
      ctx.S.timelineTeks = ctx.S.timelineTeks
        .split("\n")
        .map((l) =>
          /instalasi|commissioning/i.test(l)
            ? `${l.split("|")[0].trim()} | ± ${db.lamaHari} hari kerja`
            : l
        )
        .join("\n");
    if (isFinite(sav.kenaikanTarif))
      ctx.S.asumsi.kenaikanTarif = +(sav.kenaikanTarif * 100).toFixed(2);
    // data survey (LHS)
    const ori = +L.orientasi;
    const arah =
      isFinite(ori) && L.orientasi !== ""
        ? [
            "Utara",
            "Timur Laut",
            "Timur",
            "Tenggara",
            "Selatan",
            "Barat Daya",
            "Barat",
            "Barat Laut"
          ][Math.round((((ori % 360) + 360) % 360) / 45) % 8]
        : "";
    const jb = String(L.jenisBangunan || "");
    Object.assign(sv.isian, {
      tanggalSurvey: L.tanggal || "",
      surveyor: L.surveyor || "",
      peruntukan: JENIS_BANGUNAN[jb.toLowerCase()] || jb,
      tinggi: String(L.lantai || "").replace(/tingkat/i, "lantai"),
      koordinat: L.koordinat || "",
      orientasi:
        L.orientasi !== "" && L.orientasi != null
          ? isFinite(ori)
            ? `${ori}° (menghadap ${arah.toLowerCase()})`
            : String(L.orientasi)
          : "",
      kemiringan:
        L.kemiringan !== "" && L.kemiringan != null
          ? isFinite(+L.kemiringan)
            ? `${L.kemiringan}°`
            : String(L.kemiringan)
          : "",
      sekitar: L.sekitar || "",
      catatan: L.catatan || ""
    });
    Object.keys(sv.isian).forEach((k) => {
      if (sv.isian[k] === "") delete sv.isian[k];
    });
    if (!sv.sumber.includes(h.sumber)) sv.sumber.push(h.sumber);
  }
  async function unduhFotoDrive(f) {
    const url = f.id ? `https://lh3.googleusercontent.com/d/${f.id}=w1800` : f.url;
    // gagal jaringan / dibatasi Google (429) → tunggu sebentar lalu coba sekali lagi
    const ambil = () =>
      fetch(url, { mode: "cors" }).catch((e) => ({ ok: false, status: e.message }));
    let r = await ambil();
    if (!r.ok) {
      await new Promise((t) => setTimeout(t, 2000));
      r = await ambil();
    }
    if (!r.ok) throw new Error("HTTP " + r.status);
    const b = await r.blob();
    if (!/^image\//.test(b.type)) throw new Error("bukan gambar");
    const src = await ctx.PS.fotoDariBlob(b, 1600);
    if (!src) throw new Error("gambar terlalu kecil");
    return src;
  }
  // Workbook opsi A/B/C untuk pelanggan yang sama biasanya memakai No. LHS yang sama.
  // Opsi lama hanya DIGANTI bila nama file sama (unggah ulang/revisi) atau sistemnya identik
  // (judul + total sama). Selain itu selalu ditambahkan sebagai opsi baru.
  const intiNamaFile = (n) =>
    String(n || "")
      .replace(/\s*\(sheet:.*$/, "")
      .replace(/\.(xlsx|xlsm|xls)$/i, "")
      .replace(/[_\s-]*rev\s*\d+$/i, "")
      .trim()
      .toLowerCase();
  const labelDariNama = (n) => {
    const m = String(n || "").match(/(?:^|[^a-z])(?:opsi|option|opt)[\s_-]*([a-z]|\d)(?![a-z])/i);
    return m
      ? "Opsi " + (/\d/.test(m[1]) ? String.fromCharCode(64 + +m[1]) : m[1].toUpperCase())
      : "";
  };
  async function terimaBerlin(h, status, namaFile) {
    const o = ctx.opsiDariBerlin(h);
    o.namaFile = namaFile;
    const lama = ctx.S.opsi.findIndex(
      (x) =>
        (x.namaFile && intiNamaFile(x.namaFile) === intiNamaFile(namaFile)) ||
        (x.berlin &&
          x.nomor === o.nomor &&
          x.judul === o.judul &&
          Math.abs((x.total || 0) - (o.total || 0)) < 1)
    );
    if (lama >= 0) {
      const L = ctx.S.opsi[lama];
      Object.assign(o, { id: L.id, label: L.label, keunggulan: L.keunggulan });
      ctx.S.opsi[lama] = o;
    } else {
      const dipakai = new Set(ctx.S.opsi.map((x) => x.label));
      let lb = labelDariNama(namaFile);
      if (!lb || dipakai.has(lb)) {
        let i = 0;
        do {
          lb = "Opsi " + String.fromCharCode(65 + i++);
        } while (dipakai.has(lb));
      }
      o.label = lb;
      ctx.S.opsi.push(o);
    }
    ctx.S.opsi.sort((a, b) => a.label.localeCompare(b.label));
    terapkanBerlin(h, o);
    ctx.pilihRekomendasiOtomatis();
    // foto dari link Google Drive di LHS
    const foto = h.lhs.foto || [],
      gagal = [];
    ctx.S.survey.foto = ctx.S.survey.foto.filter((f) => !foto.some((x) => x.url === f.url));
    for (let i = 0; i < foto.length; i++) {
      const f = foto[i];
      status.textContent = `Mengunduh foto dari Google Drive ${i + 1}/${foto.length}: ${f.ket}…`;
      try {
        const src = await unduhFotoDrive(f);
        if (f.peran === "layout") o.layout = src;
        else if (f.peran === "produksi") o.produksiImg = src;
        else if (!ctx.S.survey.foto.some((x) => x.src === src))
          ctx.S.survey.foto.push({ src, ket: f.ket, tampil: true, url: f.url }); // foto identik tidak diulang
      } catch (e) {
        console.warn(f, e);
        gagal.push(f.ket);
      }
    }
    if (gagal.length)
      o.peringatan.push(
        `${gagal.length} foto gagal diunduh dari Google Drive (${gagal.join(", ")}) — pastikan internet aktif & file dibagikan "Anyone with the link".`
      );
    // sampul otomatis = foto drone dengan gambar layout PV (dipotong dari gambar teknik)
    if (o.layout) {
      try {
        o.layoutSampul = await ctx.potongFotoUdara(o.layout);
      } catch (e) {
        console.warn(e);
      }
    }
    ctx.pilihSampulOtomatis();
    return o;
  }

  Object.assign(ctx, {
    JENIS_BANGUNAN,
    terapkanBerlin,
    unduhFotoDrive,
    intiNamaFile,
    labelDariNama,
    terimaBerlin
  });
}
