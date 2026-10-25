// Select a recommended option using the existing calculation rules.
// Dependencies and shared state are provided through ctx.
function initAppRecommendation(ctx) {
  // Hasil kalkulasi satu opsi (bentuk data dari rakit())
  const hasilOpsi = (o, D) =>
    ctx.K.hitung(
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
      D.pln,
      D.asumsi
    );
  const bulanBEP = (r) =>
    r.bepBulan != null ? r.bepBulan : r.bep != null ? Math.round(r.bep * 12) : Infinity;
  // Rekomendasi otomatis dari kacamata pelanggan: di antara opsi yang balik modalnya paling lama 12 bulan
  // di atas opsi tercepat, pilih yang keuntungan bersih jangka panjangnya terbesar. Pilihan manual tidak ditimpa.
  function pilihRekomendasiOtomatis() {
    if (!ctx.S.opsi.length) {
      ctx.S.rekomendasi = null;
      return;
    }
    if (ctx.S._rekManual && ctx.S.opsi.some((o) => o.id === ctx.S.rekomendasi)) return;
    ctx.S.rekomendasi = ctx.S.opsi[0].id;
    if (ctx.S.opsi.length < 2) return;
    try {
      const D = ctx.rakit(),
        h = D.opsi.map((o) => ({ id: o.id, r: hasilOpsi(o, D) }));
      const tercepat = Math.min(...h.map((x) => bulanBEP(x.r)));
      const kandidat = isFinite(tercepat) ? h.filter((x) => bulanBEP(x.r) <= tercepat + 12) : h;
      ctx.S.rekomendasi = kandidat.reduce((a, b) => (b.r.netProfit > a.r.netProfit ? b : a)).id;
    } catch (e) {
      console.warn("rekomendasi otomatis", e);
    }
  }

  Object.assign(ctx, { hasilOpsi, bulanBEP, pilihRekomendasiOtomatis });
}
