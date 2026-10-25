// Convert parsed BOQ and Berlin workbook data into proposal options.
// Dependencies and shared state are provided through ctx.
function initAppImportsOptions(ctx) {
  // ---------------------------- BOQ → OPSI ----------------------------
  function opsiDariBOQ(h) {
    const k = ctx.PB.deteksiKomponen(h.item);
    const id = "o" + Math.random().toString(36).slice(2, 7);
    const komp = {};
    if (k.pv)
      komp.pv = {
        qty: k.pv.qty,
        wp: k.pv.wp,
        uraian: k.pv.item.uraian,
        produkId: (ctx.PB.cocokkanProduk(ctx.KAT, "pv", k.pv) || {}).id || ""
      };
    if (k.inverter)
      komp.inverter = {
        qty: k.inverter.qty,
        kw: k.inverter.kw,
        uraian: k.inverter.item.uraian,
        produkId: (ctx.PB.cocokkanProduk(ctx.KAT, "inverter", k.inverter) || {}).id || ""
      };
    if (k.baterai)
      komp.baterai = {
        qty: k.baterai.qty,
        kwh: k.baterai.kwh,
        uraian: k.baterai.item.uraian,
        produkId: (ctx.PB.cocokkanProduk(ctx.KAT, "baterai", k.baterai) || {}).id || ""
      };
    const per = [];
    if (!k.pv) per.push("Modul PV tidak terdeteksi — isi jumlah & Wp di bagian Komponen.");
    if (!k.inverter) per.push("Inverter tidak terdeteksi.");
    ["pv", "inverter", "baterai"].forEach((x) => {
      if (komp[x] && !komp[x].produkId)
        per.push(
          `${x === "pv" ? "Modul PV" : x === "inverter" ? "Inverter" : "Baterai"} "${komp[x].uraian}" belum ada di katalog — spesifikasi memakai teks BOQ.`
        );
    });
    return {
      id,
      label: h.labelOpsi || "",
      judul: h.judulOpsi || "",
      jenis: k.jenis,
      nomor: h.nomor,
      sumber: h.sumber,
      item: h.item,
      subtotal: h.subtotal,
      diskon: h.diskon,
      ppn: h.ppn,
      total: h.total,
      terbilang: h.terbilang,
      garansiBOQ: h.garansi,
      termin: h.termin,
      bank: h.bank,
      kontakBOQ: h.kontak,
      peringatan: h.peringatan.concat(per),
      teksMentah: h.teksMentah,
      peruntukan: h.peruntukan,
      komponen: komp,
      luas: k.luasMounting,
      urlQuotation: "",
      keunggulan: {},
      biayaGantiBaterai: 0,
      tahunGantiBaterai: 0,
      _h: h
    };
  }

  // ---------------------------- WORKBOOK BERLIN (LHS + BOQ) → OPSI ----------------------------
  const cocokKatalog = (kat, model) => {
    const m = String(model || "").toUpperCase();
    return (
      (
        ctx.KAT.find(
          (p) =>
            p.kategori === kat && (p.cocok || []).some((c) => m.includes(String(c).toUpperCase()))
        ) || {}
      ).id || ""
    );
  };
  const tanpaDetail = (arr) => (arr || []).filter((s) => !/^detail$/i.test(s[0]));
  function opsiDariBerlin(h) {
    const L = h.lhs,
      B = h.boq,
      kp = L.komponen,
      R = B.ringkas,
      sav = h.sav || {};
    // jenis sistem dari "Jenis Inverter" di LHS (lebih akurat daripada judul)
    const teksJenis = kp.inverter && kp.inverter.jenisInv ? kp.inverter.jenisInv : L.judul || "";
    const hyb = /hybrid/i.test(teksJenis),
      off = /off\s*-?\s*grid/i.test(teksJenis);
    const jenis = hyb && off ? "hybridoff" : hyb ? "hybrid" : off ? "offgrid" : "ongrid";
    const komp = {};
    if (kp.pv)
      komp.pv = Object.assign({}, kp.pv, {
        uraian: `${kp.pv.merek} ${kp.pv.model}`.trim(),
        produkId: cocokKatalog("pv", kp.pv.model),
        spek: tanpaDetail(L.spek.pv)
      });
    if (kp.inverter) {
      const q = kp.inverter.qty || 1;
      komp.inverter = Object.assign({}, kp.inverter, {
        qty: q,
        kw: kp.inverter.kwTotal
          ? kp.inverter.kwTotal / q
          : (ctx.PB.angka(kp.inverter.dayaTeks) || 0) / 1000,
        fase: (String(kp.inverter.dayaTeks || "").match(/\d\s*fasa/i) || [""])[0].replace(
          /\s+/,
          " "
        ),
        uraian: `${kp.inverter.merek} ${kp.inverter.model}`.trim(),
        produkId: cocokKatalog("inverter", kp.inverter.model),
        spek: tanpaDetail(L.spek.inverter)
      });
    }
    if (kp.baterai) {
      const q = kp.baterai.qty || 1;
      komp.baterai = Object.assign({}, kp.baterai, {
        qty: q,
        kwh: (kp.baterai.whTotal ? kp.baterai.whTotal / q : kp.baterai.wh) / 1000,
        uraian: `${kp.baterai.merek} ${kp.baterai.model}`.trim(),
        produkId: cocokKatalog("baterai", kp.baterai.model),
        spek: tanpaDetail(L.spek.baterai)
      });
    }
    const per = h.peringatan.slice();
    // judul disusun dari konfigurasi (judul di LHS kadang belum diperbarui antar opsi)
    const wp = komp.pv ? komp.pv.qty * komp.pv.wp : 0,
      wh = komp.baterai ? komp.baterai.qty * komp.baterai.kwh * 1000 : 0;
    const angkaID = (v) => String(Math.round(v * 10) / 10).replace(".", ",");
    const judul = `PLTS ${{ hybrid: "Hybrid", hybridoff: "Hybrid Off-Grid", ongrid: "On-Grid", offgrid: "Off-Grid" }[jenis]} - ${angkaID(wp)}Wp${wh ? ` - ${angkaID(wh)}Wh` : ""}`;
    const nums = (s) =>
      (String(s || "").match(/\d+(?:[.,]\d+)?/g) || []).map((x) => parseFloat(x.replace(",", ".")));
    if (L.judul && JSON.stringify(nums(L.judul)) !== JSON.stringify(nums(judul)))
      per.push(
        `Judul sistem di LHS "${L.judul}" tidak sesuai konfigurasi (${angkaID(wp)} Wp${wh ? `, ${angkaID(wh)} Wh` : ""}) — proposal memakai "${judul}".`
      );
    ["pv", "inverter", "baterai"].forEach((x) => {
      if (komp[x] && !komp[x].datasheet)
        per.push(
          `Link datasheet ${x === "pv" ? "panel surya" : x} tidak ditemukan di LHS (bagian Lampiran).`
        );
    });
    if (!B.item.length) per.push("Tidak ada baris BOQ yang memiliki Qty dan Total Price.");
    const berat = (L.konfig.pv || []).find((x) => /berat/i.test(x[0]));
    return {
      id: "o" + Math.random().toString(36).slice(2, 7),
      label: "",
      judul,
      jenis,
      nomor: L.nomor,
      sumber: h.sumber,
      berlin: true,
      item: B.item,
      subtotal: R.subtotal || B.jumlah,
      diskon: R.diskon || 0,
      ppn: R.ppn || 0,
      total: R.grandTotal || R.total || B.jumlah,
      quo: h.quo,
      material: L.material || [],
      peringatan: per,
      komponen: komp,
      luas: kp.pv ? kp.pv.luas : 0,
      beratPV: berat ? ctx.PB.angka(berat[1]) : 0,
      degradasiTahun1: isFinite(sav.degradasiTahun1) ? sav.degradasiTahun1 * 100 : null,
      degradasiTahunan: isFinite(sav.degradasiTahunan) ? sav.degradasiTahunan * 100 : null,
      layout: null,
      produksiImg: null,
      urlQuotation: "",
      keunggulan: {},
      biayaGantiBaterai: 0,
      tahunGantiBaterai: 0
    };
  }

  Object.assign(ctx, { opsiDariBOQ, cocokKatalog, tanpaDetail, opsiDariBerlin });
}
