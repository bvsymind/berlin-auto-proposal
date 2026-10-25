// Detect solar components and match product catalog entries.
// Dependencies and shared state are provided through ctx.
function initParsersBoqComponents(ctx) {
  // -------------------------------------------------------------------
  // Deteksi komponen utama dari item BOQ
  // -------------------------------------------------------------------
  function deteksiKomponen(items) {
    const k = { pv: null, inverter: null, baterai: null, luasMounting: 0 };
    for (const it of items) {
      const u = it.uraian;
      if (
        /(pv|solar)\s*(module|modul|panel)|panel\s*surya|modul\s*surya/i.test(u) &&
        /\d{3,4}\s*W\s*p?\b/i.test(u) &&
        !k.pv
      ) {
        k.pv = { item: it, wp: +u.match(/(\d{3,4})\s*W/i)[1], qty: it.qty };
      } else if (/inverter/i.test(u) && !/kabel|cable|switch|box/i.test(u) && !k.inverter) {
        const kw = u.match(/(\d+(?:[.,]\d+)?)\s*k(?:w|va)?\b/i);
        const jenis = /hybrid/i.test(u)
          ? "hybrid"
          : /off\s*-?\s*grid/i.test(u)
            ? "offgrid"
            : "ongrid";
        k.inverter = {
          item: it,
          kw: kw ? ctx.angka(kw[1]) : 0,
          qty: it.qty,
          jenis,
          fase: /3\s*p|3\s*phase|3\s*fase|three/i.test(u) ? 3 : /1\s*p\b|single/i.test(u) ? 1 : 0
        };
      } else if (
        /batt?er(y|ai)|battery|lifepo/i.test(u) &&
        /kwh|ah\b/i.test(u) &&
        !/cable|kabel|switch|busbar|rak|rack|box|breaket|bracket/i.test(u) &&
        !k.baterai
      ) {
        const kwh = u.match(/(\d+(?:[.,]\d+)?)\s*kwh/i);
        k.baterai = { item: it, kwh: kwh ? ctx.angka(kwh[1]) : 0, qty: it.qty };
      } else if (/mounting|bracket|breaket|rangka/i.test(u) && /m2|m²/i.test(it.satuan)) {
        k.luasMounting = it.qty;
      }
    }
    k.jenis = k.baterai
      ? k.inverter && k.inverter.jenis === "offgrid"
        ? "offgrid"
        : "hybrid"
      : k.inverter
        ? k.inverter.jenis
        : "ongrid";
    if (k.jenis === "hybrid" && k.inverter && k.inverter.jenis === "ongrid" && k.baterai)
      k.jenis = "hybrid";
    return k;
  }

  // Cocokkan komponen ke katalog produk
  function cocokkanProduk(katalog, kategori, info) {
    if (!info) return null;
    const teks = (info.item ? info.item.uraian : "").toLowerCase();
    let terbaik = null,
      skor = 0;
    for (const p of katalog.filter((p) => p.kategori === kategori)) {
      let s = 0;
      if (kategori === "pv" && p.wp === info.wp) s += 5;
      if (kategori === "inverter" && p.kw === info.kw) s += 3;
      if (kategori === "inverter" && p.jenis === info.jenis) s += 4;
      if (kategori === "inverter" && p.jenis !== info.jenis) s -= 10;
      if (kategori === "baterai" && Math.abs((p.kwh || 0) - (info.kwh || 0)) < 0.6) s += 5;
      (p.cocok || []).forEach((w) => {
        if (teks.includes(String(w).toLowerCase())) s += 1;
      });
      if (s > skor) {
        skor = s;
        terbaik = p;
      }
    }
    return skor >= 5 ? terbaik : null;
  }

  Object.assign(ctx, { deteksiKomponen, cocokkanProduk });
}

if (typeof module !== "undefined" && module.exports) module.exports = initParsersBoqComponents;
