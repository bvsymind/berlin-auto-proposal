// Read selling prices and quantities from the BOQ worksheet.
// Dependencies and shared state are provided through ctx.
function initParsersBerlinBoq(ctx) {
  // ---------------------------- BOQ (BMI, Costing & Quotation) ----------------------------
  function bacaBOQ(g) {
    let h = -1,
      K = {};
    for (let r = 0; r < Math.min(g.length, 30) && h < 0; r++) {
      const row = g[r].map((c) => ctx.S(c).toLowerCase());
      if (row.includes("items") && row.includes("qty") && row.some((c) => c === "total price")) {
        h = r;
        row.forEach((c, i) => {
          if (c === "no" && K.no == null) K.no = i;
          else if (c === "items") K.item = i;
          else if (c === "specification") K.spek = i;
          else if (c === "brand") K.merek = i;
          else if (c === "qty" && K.qty == null) K.qty = i;
          else if (c === "unit" && K.unit == null) K.unit = i;
          else if (c === "unit price") K.harga = i;
          else if (c === "total price") K.total = i;
        });
      }
    }
    if (h < 0)
      throw new Error("Header BOQ (Items / Qty / Unit Price / Total Price) tidak ditemukan");
    const item = [],
      ringkas = {};
    let kat = "",
      katNo = "";
    for (let r = h + 1; r < g.length; r++) {
      const no = ctx.S(ctx.sel(g, r, K.no));
      if (/^sub\s*total/i.test(no)) {
        for (let k = r; k < r + 8; k++) {
          const lb = ctx.S(ctx.sel(g, k, K.no)).toLowerCase(),
            v = ctx.N(ctx.sel(g, k, K.total));
          if (/^sub\s*total/.test(lb)) ringkas.subtotal = v;
          else if (/^discount|^diskon/.test(lb)) ringkas.diskon = v || 0;
          else if (/^vat|^ppn/.test(lb)) ringkas.ppn = v;
          else if (/^grand\s*total/.test(lb)) ringkas.grandTotal = v;
          else if (/^total$/.test(lb)) ringkas.total = v;
        }
        break;
      }
      const nama = ctx.S(ctx.sel(g, r, K.item));
      if (/^[A-Z]$/.test(no) && nama) {
        kat = nama;
        katNo = no;
        continue;
      }
      const qty = ctx.N(ctx.sel(g, r, K.qty)),
        tot = ctx.N(ctx.sel(g, r, K.total)),
        harga = ctx.N(ctx.sel(g, r, K.harga));
      if (!(qty > 0) || !(tot > 0)) continue; // hanya baris yang ada qty & harga
      const spek = ctx.S(ctx.sel(g, r, K.spek)),
        merek = ctx.S(ctx.sel(g, r, K.merek)).replace(/_/g, " ");
      item.push({
        kategori: kat,
        katNo,
        no: no && !isNaN(+no) ? String(+no) : "",
        nama: nama || spek,
        spek: nama ? spek : "",
        merek: /^(none|lokal|-)$/i.test(merek)
          ? merek.toLowerCase() === "lokal"
            ? "Lokal"
            : ""
          : merek,
        uraian: [nama || spek, nama && spek && spek !== nama ? spek : ""]
          .filter(Boolean)
          .join(" — "),
        qty,
        satuan: ctx.S(ctx.sel(g, r, K.unit)),
        harga: harga || tot / qty,
        total: tot
      });
    }
    const jumlah = item.reduce((s, i) => s + i.total, 0);
    return { item, ringkas, jumlah };
  }

  Object.assign(ctx, { bacaBOQ });
}

if (typeof module !== "undefined" && module.exports) module.exports = initParsersBerlinBoq;
