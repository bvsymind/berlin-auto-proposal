// Public BOQ parser interface.
// Dependencies and shared state are provided through ctx.
function initParsersBoqApi(ctx) {
  const API = {
    angka: ctx.angka,
    tanggal: ctx.tanggal,
    tanggalIndo: ctx.tanggalIndo,
    pecahCustomer: ctx.pecahCustomer,
    itemDariTeks: ctx.itemDariTeks,
    itemDariBaris: ctx.itemDariBaris,
    bacaTeks: ctx.bacaTeks,
    deteksiKomponen: ctx.deteksiKomponen,
    cocokkanProduk: ctx.cocokkanProduk,
    bacaFile: ctx.bacaFile,
    teksDariPDF: ctx.teksDariPDF,
    barisDariExcel: ctx.barisDariExcel,
    BULAN: ctx.BULAN
  };

  Object.assign(ctx, { API });
}

if (typeof module !== "undefined" && module.exports) module.exports = initParsersBoqApi;
