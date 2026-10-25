// Read savings assumptions and sales directory worksheet.
// Dependencies and shared state are provided through ctx.
function initParsersBerlinSavings(ctx) {
  // ---------------------------- SAVINGS ----------------------------
  function bacaSavings(g) {
    const v = (re) => {
      const p = ctx.cari(g, re, 6);
      if (!p) return NaN;
      for (let c = p.c + 1; c < p.c + 4; c++) {
        const x = ctx.sel(g, p.r, c);
        if (typeof x === "number") return x;
      }
      return NaN;
    };
    return {
      kenaikanTarif: v(/^rate\s*hike/i),
      degradasiTahunan: v(/^pv\s*degradation/i),
      degradasiTahun1: v(/^1st\s*year\s*degradation/i),
      produksiTahunan: v(/^results\s*\/\s*year/i),
      harga: v(/^\s*price\s*:?$/i)
    };
  }

  function bacaDB(g, nomor) {
    if (!g.length || !nomor) return {};
    const hdr = g[0].map((c) => ctx.S(c).toLowerCase());
    const kol = (re) => hdr.findIndex((h) => re.test(h));
    const kNo = kol(/nomor\s*induk\s*lhs|^no\.?\s*lhs/),
      kPic = kol(/marketing|pic\s*\(berlin\)|sales/),
      kLama = kol(/lama\s*pengerjaan/),
      kWa = kol(/(wa|whatsapp|telepon|hp)\s*(sales|marketing|pic)/);
    if (kNo < 0) return {};
    const norm = (t) => ctx.S(t).toLowerCase().replace(/\s+/g, "");
    const row = g
      .slice(1)
      .reverse()
      .find((r) => norm(r[kNo]) === norm(nomor)); // entri terbaru
    if (!row) return {};
    const pic = kPic >= 0 ? ctx.S(row[kPic]).split(/[;,]/)[0].trim() : "";
    return {
      pic,
      lamaHari: kLama >= 0 ? ctx.N(row[kLama]) || 0 : 0,
      wa: kWa >= 0 ? ctx.S(row[kWa]) : ""
    };
  }

  function namaSheet(wb, re, kecuali) {
    return wb.SheetNames.find((n) => re.test(n) && !(kecuali && kecuali.test(n)));
  }

  Object.assign(ctx, { bacaSavings, bacaDB, namaSheet });
}

if (typeof module !== "undefined" && module.exports) module.exports = initParsersBerlinSavings;
