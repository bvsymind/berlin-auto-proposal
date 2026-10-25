// Read line items from extracted text or worksheet rows.
// Dependencies and shared state are provided through ctx.
function initParsersBoqItems(ctx) {
  // -------------------------------------------------------------------
  // Item BOQ dari teks: "1 Inverter Hybrid 20K LV 2 unit ( 55,770,000) 111,540,000"
  // -------------------------------------------------------------------
  function itemDariTeks(bagian) {
    const re = new RegExp(
      "(?:^|\\s)(\\d{1,3})\\s+(.+?)\\s+(\\d+(?:[.,]\\d+)?)\\s+(" +
        ctx.SATUAN +
        ")\\.?\\s+" +
        "\\(?\\s*(?:Rp\\.?\\s*)?([\\d.,]{3,})\\s*\\)?\\s+(?:Rp\\.?\\s*)?([\\d.,]{3,})",
      "gi"
    );
    const items = [];
    let m;
    while ((m = re.exec(bagian))) {
      items.push({
        no: +m[1],
        uraian: m[2].trim(),
        qty: ctx.angka(m[3]),
        satuan: m[4].toLowerCase(),
        harga: ctx.angka(m[5]),
        total: ctx.angka(m[6])
      });
    }
    return items;
  }

  // -------------------------------------------------------------------
  // Item BOQ dari baris Excel (array of array), berdasarkan judul kolom
  // -------------------------------------------------------------------
  function itemDariBaris(rows) {
    const cari = (row, re) => row.findIndex((c) => re.test(String(c ?? "").trim()));
    for (let h = 0; h < rows.length; h++) {
      const r = rows[h].map((c) => String(c ?? "").trim());
      const iQty = cari(r, /^(qty|quantity|jumlah|vol(ume)?|kuantitas)$/i);
      const iTot = r
        .map((c, i) =>
          /^(total( price| harga)?|jumlah harga|amount|sub ?total)$/i.test(c) ? i : -1
        )
        .filter((i) => i >= 0)
        .pop();
      if (iQty < 0 || iTot === undefined) continue;
      let iDesc = cari(
        r,
        /^(code|desc(ription)?|uraian|item|product|produk|nama barang|deskripsi|material|pekerjaan)$/i
      );
      const iUnit = cari(r, /^(unit|satuan|sat)$/i);
      const iHarga = cari(r, /^(price|harga( satuan)?|unit price|harga satuan)$/i);
      const iNo = cari(r, /^(no\.?|#)$/i);
      if (iDesc < 0) iDesc = iNo >= 0 ? iNo + 1 : 0;
      const items = [];
      for (let k = h + 1; k < rows.length; k++) {
        const row = rows[k];
        const teks = row.map((c) => String(c ?? "")).join(" ");
        if (/sub\s*total|t\s*o\s*t\s*a\s*l|terbilang/i.test(teks) && !ctx.angka(row[iQty])) break;
        const desc = String(row[iDesc] ?? "").trim();
        const qty = ctx.angka(row[iQty]),
          total = ctx.angka(row[iTot]);
        if (!desc || !(qty > 0) || !(total > 0)) continue;
        // Jika kolom deskripsi di sebelah kiri juga berisi teks (mis. "Komponen Utama"), gabungkan
        items.push({
          no: items.length + 1,
          uraian: desc.replace(/\s+/g, " "),
          qty,
          satuan:
            iUnit >= 0
              ? String(row[iUnit] ?? "")
                  .trim()
                  .toLowerCase()
              : "",
          harga: iHarga >= 0 ? ctx.angka(row[iHarga]) : total / qty,
          total
        });
      }
      if (items.length) return items;
    }
    return [];
  }

  Object.assign(ctx, { itemDariTeks, itemDariBaris });
}

if (typeof module !== "undefined" && module.exports) module.exports = initParsersBoqItems;
