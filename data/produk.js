// =====================================================================
//  KATALOG PRODUK — keunggulan & angka teknis tambahan untuk proposal.
//  Spesifikasi utama (model, daya, dimensi, garansi) dan link datasheet
//  diambil langsung dari sheet LHS. Katalog ini hanya MELENGKAPI:
//    • keunggulan  → poin-poin di halaman Spesifikasi
//    • dod / degradasi → dipakai di perhitungan backup & produksi
//  Pencocokan: model di LHS mengandung salah satu teks di "cocok".
//  Tambah produk baru dengan menyalin satu blok { ... }.
// =====================================================================
window.PRODUK = [
  // ---------------------------- PANEL SURYA ----------------------------
  {
    id: "trina-vertex-n-630",
    kategori: "pv",
    nama: "Trina Solar Vertex N 630 Wp",
    merek: "Trina Solar",
    wp: 630,
    cocok: ["TSM-NE19RC", "TSM-NEG19RC", "VERTEX N"],
    degradasiTahun1: 1.0,
    degradasiTahunan: 0.4,
    garansiProduk: 12,
    garansiPerforma: 30,
    datasheet: "https://drive.google.com/file/d/1TVruEKkPQ-SbOrmArAkmY_YQ7Rji-brH/view",
    keunggulan: [
      "Sel N-type i-TOPCon, efisiensi modul hingga 23,3%",
      "Bifacial dual glass: tambahan daya 10–20% dari sisi belakang",
      "Degradasi rendah: 1% tahun pertama, 0,4%/tahun berikutnya",
      "Garansi produk 12 tahun, garansi daya 30 tahun",
      "Tahan amonia, garam, pasir, PID, LID & LeTID"
    ]
  },

  // ---------------------------- INVERTER ----------------------------
  {
    id: "deye-sun-sg05lp3",
    kategori: "inverter",
    jenis: "hybrid",
    nama: "Deye Hybrid 3 Fasa (SG05LP3)",
    merek: "Deye",
    cocok: ["SG05LP3", "SG04LP3"],
    keunggulan: [
      "Output 3 fasa, mendukung beban tidak seimbang 100% di tiap fasa",
      "Baterai tegangan rendah 48 V dengan isolasi transformator",
      "6 periode waktu pengisian/pengosongan baterai yang dapat diatur",
      "Dapat dihubungkan DC & AC coupling serta genset",
      "Monitoring jarak jauh lewat aplikasi"
    ]
  },

  {
    id: "deye-sun-lp1-hybrid",
    kategori: "inverter",
    jenis: "hybrid",
    nama: "Deye Hybrid 1 Fasa (SG0xLP1)",
    merek: "Deye",
    cocok: ["SG05LP1", "SG04LP1", "SG03LP1", "SG02LP1", "SG01LP1"],
    keunggulan: [
      "Inverter hybrid 1 fasa untuk baterai tegangan rendah 48 V",
      "Bekerja bersama PLN dan berpindah ke baterai saat PLN padam",
      "Jadwal pengisian/pengosongan baterai dapat diatur",
      "Monitoring jarak jauh lewat aplikasi"
    ]
  },
  {
    id: "deye-sun-og-offgrid",
    kategori: "inverter",
    jenis: "offgrid",
    nama: "Deye Off-Grid 1 Fasa (OG)",
    merek: "Deye",
    cocok: ["OG01LP1", "OG03LP1", "-OG0"],
    keunggulan: [
      "Inverter off-grid 1 fasa untuk baterai tegangan rendah 48 V",
      "Beban dilayani dari panel surya & baterai, PLN sebagai cadangan",
      "Tidak mengekspor listrik ke jaringan PLN",
      "Monitoring jarak jauh lewat aplikasi"
    ]
  },

  // ---------------------------- BATERAI ----------------------------
  {
    id: "deye-se-f",
    kategori: "baterai",
    nama: "Deye SE-F LiFePO4",
    merek: "Deye",
    cocok: ["SE-F5", "SE-F12", "SE-F16"],
    garansiProduk: 10, // tahun — dipakai bila LHS kosong. CEK datasheet/kebijakan garansi Deye terbaru
    keunggulan: [
      "Lithium Iron Phosphate (LFP) — aman & berumur panjang",
      "BMS terintegrasi dengan proteksi lengkap",
      "Berkomunikasi langsung dengan inverter Deye",
      "Kapasitas dapat ditambah dengan pemasangan paralel"
    ]
  },
  {
    id: "deye-se-g",
    kategori: "baterai",
    nama: "Deye SE-G LiFePO4",
    merek: "Deye",
    cocok: ["SE-G10", "SE-G5"],
    dod: 90, // % — Recommend Depth of Discharge (datasheet Deye SE-G)
    keunggulan: [
      "Lithium Iron Phosphate (LFP) bebas kobalt — aman & berumur panjang",
      "6.000 siklus pada 90% DOD, garansi 10 tahun",
      "BMS cerdas terintegrasi dengan proteksi lengkap",
      "Modular: dapat ditambah hingga 64 unit paralel",
      "Pemantauan & pembaruan firmware jarak jauh"
    ]
  }
];
