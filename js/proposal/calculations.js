// Recalculate all options using the shared calculation engine.
// Dependencies and shared state are provided through ctx.
function initProposalCalculations(ctx) {
  // ---------------------------- PERHITUNGAN ----------------------------
  function hitungSemua() {
    ctx.D.opsi.forEach((o) => {
      o.hasil = ctx.K.hitung(
        {
          investasi: o.investasi,
          kWp: o.kWp,
          jenis: o.jenis,
          bateraiKWh: o.bateraiKWh,
          dod: o.dod,
          degradasiTahun1: o.degradasiTahun1,
          degradasiTahunan: o.degradasiTahunan,
          biayaGantiBaterai: o.biayaGantiBaterai,
          tahunGantiBaterai: o.tahunGantiBaterai
        },
        ctx.D.pln,
        ctx.A
      );
    });
  }
  const rek = () => ctx.D.opsi.find((o) => o.id === ctx.D.rekomendasi) || ctx.D.opsi[0];
  const multi = ctx.D.opsi.length > 1;

  Object.assign(ctx, { hitungSemua, rek, multi });
}

if (typeof module !== "undefined" && module.exports) module.exports = initProposalCalculations;
