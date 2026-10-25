// Read and reconcile the summarized quotation.
// Dependencies and shared state are provided through ctx.
function initParsersBerlinQuotation(ctx) {
  // blok "QUOTATION" ringkas (Product / Desc / Unit price / Qty / Unit / Total) di sheet yang sama
  function bacaQuotation(g) {
    const p = ctx.cari(g, /^product$/i, 80);
    if (!p) return null;
    const hdr = g[p.r].map((c) => ctx.S(c).toLowerCase());
    const col = (n) => hdr.findIndex((c, i) => i >= p.c && c === n);
    const K = {
      prod: p.c,
      desc: col("desc"),
      harga: col("unit price"),
      qty: col("qty"),
      unit: col("unit"),
      total: col("total")
    };
    const rows = [],
      tot = {};
    for (let r = p.r + 1; r < Math.min(g.length, p.r + 25); r++) {
      const lbU = ctx.S(ctx.sel(g, r, K.unit)).toLowerCase();
      if (/^sub\s*total/.test(lbU)) {
        for (let k = r; k < r + 6; k++) {
          const lb = ctx.S(ctx.sel(g, k, K.unit)).toLowerCase(),
            v = ctx.N(ctx.sel(g, k, K.total));
          if (/^sub\s*total/.test(lb)) tot.subtotal = v;
          else if (/^discount/.test(lb)) tot.diskon = v;
          else if (/^ppn|^vat/.test(lb)) tot.ppn = v;
          else if (/^total\/watt/.test(lb)) tot.perWatt = v;
          else if (/^total$/.test(lb)) tot.total = v;
        }
        break;
      }
      const pr = ctx.S(ctx.sel(g, r, K.prod)),
        t = ctx.N(ctx.sel(g, r, K.total));
      if (pr && t > 0)
        rows.push({
          produk: pr,
          desc: ctx.S(ctx.sel(g, r, K.desc)),
          harga: ctx.N(ctx.sel(g, r, K.harga)),
          qty: ctx.N(ctx.sel(g, r, K.qty)),
          satuan: ctx.S(ctx.sel(g, r, K.unit)),
          total: t
        });
    }
    const q = { rows, tot };
    const tg = ctx.cari(g, /^invoice\s*date/i, 80);
    if (tg) q.tanggal = ctx.S(ctx.kanan(g, tg, 1, 2));
    return rows.length ? q : null;
  }

  // Blok QUOTATION adalah ringkasan BOQ per kelompok. Bila satu baris tidak sama dengan jumlah
  // kelompoknya di BOQ (mis. qty terhitung ganda), baris itu disamakan dengan BOQ dan diberi catatan,
  // agar total di halaman Penawaran selalu = Grand Total BOQ (yang juga dipakai sheet Savings).
  const PETA_QUO = [
    [/^solar\s*panel|panel\s*surya|pv\s*module/i, /pv\s*module/i],
    [/^inverter/i, /^inverter/i],
    [/^batt?ery|baterai/i, /^batt?ery/i],
    [/monitoring/i, /monitoring/i],
    [/mounting/i, /mounting/i],
    [/^jasa|service|manhour/i, /manhour|jasa|service/i]
  ];
  function cocokkanQuotation(quo, boq, R, per) {
    const g = {};
    boq.item.forEach((i) => (g[i.kategori] = (g[i.kategori] || 0) + i.total));
    const terpakai = new Set(),
      sisa = [];
    quo.rows.forEach((q) => {
      const m = PETA_QUO.find((m) => m[0].test(q.produk));
      if (!m) {
        sisa.push(q);
        return;
      }
      q._boq = Object.keys(g)
        .filter((k) => m[1].test(k))
        .reduce((s, k) => {
          terpakai.add(k);
          return s + g[k];
        }, 0);
    });
    const lain = Object.keys(g)
      .filter((k) => !terpakai.has(k))
      .reduce((s, k) => s + g[k], 0);
    if (sisa.length === 1) sisa[0]._boq = lain;
    quo.rows.forEach((q) => {
      if (q._boq == null || Math.abs(q._boq - q.total) < 1) return;
      per.push(
        `PERLU DIPERBAIKI DI WORKBOOK — "${q.produk}": blok Quotation ${q.qty} × ${Math.round(q.harga).toLocaleString("id-ID")} = ${Math.round(q.total).toLocaleString("id-ID")}, sedangkan BOQ = ${Math.round(q._boq).toLocaleString("id-ID")}. Samakan Qty/harga di sheet BMI, simpan, lalu unggah ulang file yang sama. Sementara ini proposal memakai angka BOQ agar rincian, total, dan BEP tetap konsisten.`
      );
      q.total = q._boq;
      q.harga = q._boq / (q.qty || 1);
      if (q.qty !== 1 && Math.abs(q.harga - Math.round(q.harga)) > 0.01) {
        q.qty = 1;
        q.harga = q._boq;
        q.satuan = "Set";
      }
    });
    const jml = quo.rows.reduce((s, q) => s + q.total, 0);
    if (R.subtotal && Math.abs(jml - R.subtotal) > 1)
      per.push(
        `Jumlah blok Quotation (${Math.round(jml).toLocaleString("id-ID")}) ≠ Sub Total BOQ (${Math.round(R.subtotal).toLocaleString("id-ID")}).`
      );
  }

  Object.assign(ctx, { bacaQuotation, PETA_QUO, cocokkanQuotation });
}

if (typeof module !== "undefined" && module.exports) module.exports = initParsersBerlinQuotation;
