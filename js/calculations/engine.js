// =====================================================================
//  MESIN PERHITUNGAN — produksi energi, penghematan, BEP, ROI, IRR,
//  dampak lingkungan, dan backup baterai.
//  Ditulis sebagai satu fungsi agar bisa ikut ditanam di file proposal
//  (simulasi interaktif di sisi pelanggan memakai rumus yang sama).
// =====================================================================
function KalkulasiFactory() {
  // o: { investasi, kWp, jenis, bateraiKWh, dod, degradasiTahun1, degradasiTahunan, biayaGantiBaterai, tahunGantiBaterai }
  // p: { tagihan, kva, tarif, pascabayar }
  // a: asumsi (lihat PENGATURAN.asumsi)
  function hitung(o, p, a) {
    const H = Math.max(1, Math.round(a.horizonTahun || 25));
    const e = (a.kenaikanTarif || 0) / 100;
    const d1 = (o.degradasiTahun1 ?? 1) / 100,
      dn = (o.degradasiTahunan ?? 0.4) / 100;
    const self = (a.pemakaianSendiri ?? 100) / 100;

    // --- Kondisi listrik sebelum PLTS ---
    const minimum = p.pascabayar ? (p.kva || 0) * (a.rekeningMinimumJam || 40) * p.tarif : 0;
    const biayaEnergi = Math.max(0, (p.tagihan || 0) - minimum);
    const kwhBulan = p.tarif ? biayaEnergi / p.tarif : 0; // konsumsi yang bisa digantikan PLTS
    const kwhTahun = kwhBulan * 12;

    // --- Produksi ---
    const produksiDasar = o.kWp * a.jamEfektif * 365; // tanpa degradasi
    const tahun = [];
    let kum = -o.investasi,
      totalHemat = 0,
      totalProduksi = 0,
      bep = null,
      dibatasi = false;
    // Metode "bulanan" = sheet Savings workbook Berlin Energi:
    //  hemat bulan-m = tarif × produksi/bulan × faktor degradasi(m) × (1 + kenaikan × (tahun−1))
    //  degradasi turun linear per bulan (1%/12 di tahun 1, lalu 0,4%/12), kenaikan tarif bertambah linear tiap 12 bulan.
    const bulan = [];
    let bepBulan = null;
    if (a.metode === "bulanan") {
      const prodBulan = produksiDasar / 12,
        capBulan = kwhBulan > 0 ? kwhBulan : Infinity;
      let kumB = -o.investasi;
      for (let y = 1; y <= H; y++) {
        let prodY = 0,
          terpakaiY = 0,
          hematY = 0;
        const naik = e * (y - 1),
          tarif = p.tarif * (1 + naik);
        for (let k = 1; k <= 12; k++) {
          const m = (y - 1) * 12 + k;
          const deg = m <= 12 ? 1 - (d1 * m) / 12 : 1 - d1 - (dn * (m - 12)) / 12;
          const prod = prodBulan * deg;
          let pakai = prod * self;
          if (pakai > capBulan) {
            pakai = capBulan;
            dibatasi = true;
          }
          const h = pakai * tarif;
          prodY += prod;
          terpakaiY += pakai;
          hematY += h;
          kumB += h;
          if (bepBulan === null && kumB >= 0) bepBulan = m;
          bulan.push({ bulan: m, hemat: h, kumulatif: kumB });
        }
        const rawat = ((o.investasi * (a.biayaPerawatanPersen || 0)) / 100) * (1 + naik);
        const ganti = o.biayaGantiBaterai && y === o.tahunGantiBaterai ? o.biayaGantiBaterai : 0;
        const bersih = hematY - rawat - ganti;
        if (rawat || ganti) kumB -= rawat + ganti;
        kum += bersih;
        totalHemat += bersih;
        totalProduksi += prodY;
        tahun.push({
          tahun: y,
          tarif,
          produksi: prodY,
          terpakai: terpakaiY,
          hemat: hematY,
          rawat,
          ganti,
          bersih,
          kumulatif: kum
        });
      }
      if (bepBulan !== null) bep = bepBulan / 12;
    }
    for (let y = 1; a.metode !== "bulanan" && y <= H; y++) {
      const prod = produksiDasar * (1 - d1) * Math.pow(1 - dn, y - 1);
      const tarif = p.tarif * Math.pow(1 + e, y - 1);
      let terpakai = prod * self;
      if (kwhTahun > 0 && terpakai > kwhTahun) {
        terpakai = kwhTahun;
        dibatasi = true;
      }
      let hemat = terpakai * tarif;
      const rawat = ((o.investasi * (a.biayaPerawatanPersen || 0)) / 100) * Math.pow(1 + e, y - 1);
      const ganti = o.biayaGantiBaterai && y === o.tahunGantiBaterai ? o.biayaGantiBaterai : 0;
      const bersih = hemat - rawat - ganti;
      const sebelum = kum;
      kum += bersih;
      totalHemat += bersih;
      totalProduksi += prod;
      if (bep === null && kum >= 0) bep = y - 1 + (bersih > 0 ? -sebelum / bersih : 0);
      tahun.push({
        tahun: y,
        tarif,
        produksi: prod,
        terpakai,
        hemat,
        rawat,
        ganti,
        bersih,
        kumulatif: kum
      });
    }

    // --- IRR (bisection) & NPV ---
    const arus = [-o.investasi].concat(tahun.map((t) => t.bersih));
    const npvPada = (r) => arus.reduce((s, c, i) => s + c / Math.pow(1 + r, i), 0);
    let irr = null;
    if (npvPada(0) > 0) {
      let lo = 0,
        hi = 3;
      for (let i = 0; i < 100; i++) {
        const m = (lo + hi) / 2;
        if (npvPada(m) > 0) lo = m;
        else hi = m;
      }
      irr = (lo + hi) / 2;
    }
    const npv = npvPada((a.diskonNPV || 8) / 100);

    const t1 = tahun[0];
    const hematBulan1 = bulan.length ? bulan[0].hemat : t1.hemat / 12;
    // posisi kas pada bulan tertentu (untuk "Investment Timeline")
    const kasBulan = (m) =>
      bulan.length ? (bulan[Math.min(m, bulan.length) - 1] || {}).kumulatif : null;
    const tagihanSesudah = Math.max(minimum, (p.tagihan || 0) - hematBulan1);
    const co2Tahun1 =
      ((a.metode === "bulanan" ? produksiDasar : t1.produksi) * a.faktorEmisi) / 1000; // ton
    const co2Total = (totalProduksi * a.faktorEmisi) / 1000; // ton
    const backupJam =
      o.bateraiKWh && a.bebanBackupKW ? (o.bateraiKWh * (o.dod || 80)) / 100 / a.bebanBackupKW : 0;

    return {
      horizon: H,
      minimum,
      biayaEnergi,
      kwhBulan,
      kwhHari: kwhBulan / 30,
      produksiDasar,
      produksiBulanDasar: o.kWp * a.jamEfektif * 30,
      produksiTahun1: t1.produksi,
      tahun,
      bep,
      dibatasi,
      cakupan: kwhTahun ? Math.min(1, (t1.produksi * self) / kwhTahun) : null, // % konsumsi yang tergantikan
      hematBulan1,
      hematTahun1: t1.bersih,
      tagihanSesudah,
      persenHemat: p.tagihan ? hematBulan1 / p.tagihan : 0,
      totalHemat,
      totalProduksi,
      hemat10: tahun.slice(0, 10).reduce((s, t) => s + t.bersih, 0),
      netProfit: totalHemat - o.investasi,
      roi: o.investasi ? (totalHemat - o.investasi) / o.investasi : 0,
      kelipatan: o.investasi ? totalHemat / o.investasi : 0,
      irr,
      npv,
      biayaPerWp: o.kWp ? o.investasi / (o.kWp * 1000) : 0,
      co2Tahun1,
      co2Total,
      pohon: (co2Total * 1000) / (a.serapanPohon * H),
      pohonTahunan: (co2Tahun1 * 1000) / a.serapanPohon, // pohon untuk menyerap CO₂ satu tahun
      bulan,
      bepBulan,
      kasBulan,
      kmMobil: (co2Total * 1000) / a.emisiMobil,
      literBensin: (co2Total * 1000) / a.emisiBensin,
      backupJam
    };
  }

  // Terbilang Rupiah
  function terbilang(n) {
    n = Math.floor(Math.abs(n));
    const s = [
      "",
      "Satu",
      "Dua",
      "Tiga",
      "Empat",
      "Lima",
      "Enam",
      "Tujuh",
      "Delapan",
      "Sembilan",
      "Sepuluh",
      "Sebelas"
    ];
    const f = (x) =>
      x < 12
        ? s[x]
        : x < 20
          ? f(x - 10) + " Belas"
          : x < 100
            ? f(Math.floor(x / 10)) + " Puluh " + f(x % 10)
            : x < 200
              ? "Seratus " + f(x - 100)
              : x < 1000
                ? f(Math.floor(x / 100)) + " Ratus " + f(x % 100)
                : x < 2000
                  ? "Seribu " + f(x - 1000)
                  : x < 1e6
                    ? f(Math.floor(x / 1000)) + " Ribu " + f(x % 1000)
                    : x < 1e9
                      ? f(Math.floor(x / 1e6)) + " Juta " + f(x % 1e6)
                      : x < 1e12
                        ? f(Math.floor(x / 1e9)) + " Miliar " + f(x % 1e9)
                        : f(Math.floor(x / 1e12)) + " Triliun " + f(x % 1e12);
    return (f(n).replace(/\s+/g, " ").trim() || "Nol") + " Rupiah";
  }

  // Format angka gaya Indonesia
  const rp = (v, d = 0) => "Rp " + Math.round(v).toLocaleString("id-ID");
  const num = (v, d = 0) =>
    (v ?? 0).toLocaleString("id-ID", { minimumFractionDigits: d, maximumFractionDigits: d });
  function rpSingkat(v) {
    const a = Math.abs(v),
      t = v < 0 ? "-" : "";
    if (a >= 1e12) return t + "Rp " + num(a / 1e12, 2) + " T";
    if (a >= 1e9) return t + "Rp " + num(a / 1e9, 2) + " M";
    if (a >= 1e6) return t + "Rp " + num(a / 1e6, a >= 1e8 ? 0 : 1) + " Jt";
    return t + rp(a);
  }

  return { hitung, terbilang, rp, num, rpSingkat };
}
if (typeof module !== "undefined" && module.exports) module.exports = KalkulasiFactory;
else window.Kalkulasi = KalkulasiFactory();
