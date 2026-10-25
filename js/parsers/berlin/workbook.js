// Coordinate Berlin workbook parsing and warnings.
// Dependencies and shared state are provided through ctx.
function initParsersBerlinWorkbook(ctx) {
  async function bacaWorkbook(file) {
    const buf = await file.arrayBuffer();
    const wb = ctx.root.XLSX.read(buf, { type: "array", cellDates: true });
    const nL = ctx.namaSheet(wb, /^\s*lhs\s*$/i) || ctx.namaSheet(wb, /lhs/i, /^db/i);
    const nB = ctx.namaSheet(wb, /bmi|quotation|boq/i, /^db/i);
    if (!nL || !nB) return null; // bukan workbook Berlin
    const gL = ctx.grid(wb.Sheets[nL]),
      gB = ctx.grid(wb.Sheets[nB]);
    const lhs = ctx.bacaLHS(gL),
      boq = ctx.bacaBOQ(gB),
      quo = ctx.bacaQuotation(gB);
    // DB LHS: baris rekap form survey → nama Marketing/PIC (sales) & lama pengerjaan
    const nD = ctx.namaSheet(wb, /^db\s*lhs$/i);
    const db = nD ? ctx.bacaDB(ctx.grid(wb.Sheets[nD]), lhs.nomor) : {};
    const nS = ctx.namaSheet(wb, /^savings$/i);
    const sav = nS ? ctx.bacaSavings(ctx.grid(wb.Sheets[nS])) : {};
    const per = [];
    const R = boq.ringkas;
    if (R.diskon && Math.abs(R.diskon) < 1) R.diskon = 0; // sisa pembulatan Excel
    if (R.subtotal && Math.abs(boq.jumlah - R.subtotal) > 1)
      per.push(
        `Jumlah item BOQ (${Math.round(boq.jumlah).toLocaleString("id-ID")}) ≠ Sub Total (${Math.round(R.subtotal).toLocaleString("id-ID")}) — ada baris berharga tanpa Qty?`
      );
    if (quo) ctx.cocokkanQuotation(quo, boq, R, per);
    return {
      sumber: `${file.name} (sheet: ${nL} + ${nB})`,
      lhs,
      boq,
      quo,
      sav,
      db,
      peringatan: per
    };
  }

  Object.assign(ctx, { bacaWorkbook });
}

if (typeof module !== "undefined" && module.exports) module.exports = initParsersBerlinWorkbook;
