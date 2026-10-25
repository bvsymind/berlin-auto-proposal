// =====================================================================
//  PENGATURAN PERUSAHAAN & ASUMSI DEFAULT — boleh diedit dengan Notepad
//  Simpan file, lalu muat ulang (F5) halaman Generator Proposal.
//  Sumber data: Company Profile & proposal final Berlin Energi.
// =====================================================================
window.PENGATURAN = {
  perusahaan: {
    nama: "BERLIN ENERGI",
    badanUsaha: "PT Berlin Energi",
    tagline: "Jadikan Atapmu Sebagai Sumber Cuanmu",
    berdiri: 2013,
    website: "www.berlinenergi.com",
    email: "info@berlinenergi.com",
    telepon: "(+62) 21 5971 1800",
    whatsapp: "6281220819684", // nomor WhatsApp sales (format internasional tanpa +) — untuk tombol WhatsApp
    kontakSales: "Natalia", // nama yang tampil di kontak proposal
    teleponSales: "(+62) 812 2081 9684",
    instagram: "berlinenergi",
    tiktok: "berlin_energi",
    alamat: "Infinity Bizpark Blok C9, Jl. Raya Pasar Kemis KM 06, Tangerang, Banten 15560",
    penandatangan: "Berlin Energi",
    jabatan: "PT Berlin Energi",
    grup: "TRANG", // logo grup yang tampil di sampul (kosongkan "" untuk menyembunyikan)
    bank: { nama: "BCA", nomor: "692 0200 999", atasNama: "Berlin Energi, PT" },
    // Link Company Profile lengkap (Google Drive, "Anyone with the link can view") — tampil sebagai tombol di proposal
    linkCompanyProfile: ""
  },

  // Direktori WhatsApp sales PIC. Nama harus sama dengan kolom "Marketing/PIC (Berlin)" di sheet DB LHS.
  // Nomor yang diketik di dashboard juga diingat otomatis di komputer ini.
  daftarSales: [
    // { nama: "Bu Ayu", wa: "62812xxxxxxx" },
    // { nama: "Bu Anastasia", wa: "62812xxxxxxx" },
  ],

  // Format tanggal bila membaca BOQ teks/PDF lama (workbook Berlin dibaca langsung dari Excel)
  formatTanggalBOQ: "DMY",

  // Tarif PLN non-subsidi (Rp/kWh). PERBARUI setiap ada Tarif Adjustment PLN.
  // Untuk workbook Berlin, tarif diambil dari LHS (tagihan ÷ kWh) — tabel ini hanya cadangan.
  tarifPLN: [
    { kode: "R-1/1300", label: "R-1 Rumah Tangga 1.300 VA", tarif: 1444.7 },
    { kode: "R-1/2200", label: "R-1 Rumah Tangga 2.200 VA", tarif: 1444.7 },
    { kode: "R-2", label: "R-2 Rumah Tangga 3.500–5.500 VA", tarif: 1699.53 },
    { kode: "R-3", label: "R-3 Rumah Tangga ≥ 6.600 VA", tarif: 1699.53 },
    { kode: "B-2", label: "B-2 Bisnis 6.600 VA–200 kVA", tarif: 1444.7 },
    { kode: "B-3", label: "B-3 Bisnis > 200 kVA (TM)", tarif: 1114.74 },
    { kode: "I-3", label: "I-3 Industri > 200 kVA (TM)", tarif: 1114.74 },
    { kode: "I-4", label: "I-4 Industri ≥ 30 MVA (TT)", tarif: 996.74 },
    { kode: "P-1", label: "P-1 Kantor Pemerintah 6.600 VA–200 kVA", tarif: 1699.53 },
    { kode: "P-3", label: "P-3 Penerangan Jalan Umum", tarif: 1699.53 },
    { kode: "S-3", label: "S-3 Sosial > 200 kVA", tarif: 1114.74 },
    { kode: "LAIN", label: "Lainnya / isi manual", tarif: 1444.7 }
  ],

  // Asumsi default = metode sheet "Savings" di workbook Berlin.
  asumsi: {
    metode: "bulanan", // "bulanan" = sama dengan sheet Savings (per bulan, kenaikan tarif tahunan bertambah linear)
    jamEfektif: 3.4, // jam produksi efektif/hari — ditimpa PSH dari LHS (produksi PVWatts ÷ kWp ÷ 365)
    kenaikanTarif: 3, // % per tahun (sheet Savings: Rate Hike)
    horizonTahun: 25,
    pemakaianSendiri: 100, // % energi PLTS terpakai sendiri (tanpa ekspor; Permen ESDM 2/2024)
    biayaPerawatanPersen: 0,
    bebanBackupKW: 2, // beban kritis yang di-backup saat PLN padam (hybrid) — sesuaikan per pelanggan
    faktorEmisi: 0.884, // kg CO2/kWh (sheet ENVIRONMENTAL IMPACT: 0,934 − 0,05)
    serapanPohon: 21.77, // kg CO2 per pohon per tahun (sheet ENVIRONMENTAL IMPACT)
    emisiMobil: 0.17, // kg CO2 per km mobil bensin
    emisiBensin: 2.31, // kg CO2 per liter bensin
    whPerKmEV: 153, // Wh per km mobil listrik (sheet ENVIRONMENTAL IMPACT)
    kmPerLiter: 11.5, // km per liter mobil bensin (sheet ENVIRONMENTAL IMPACT)
    rekeningMinimumJam: 40,
    luasPerPanel: 2.7,
    diskonNPV: 8
  },

  segmen: {
    rumah: { label: "Rumah Tinggal", kata: "rumah" },
    kantor: { label: "Kantor", kata: "kantor" },
    pabrik: { label: "Pabrik / Industri", kata: "pabrik" },
    gudang: { label: "Gudang", kata: "gudang" },
    sekolah: { label: "Sekolah / Kampus", kata: "sekolah" },
    ibadah: { label: "Rumah Ibadah", kata: "rumah ibadah" },
    hotel: { label: "Hotel / Villa", kata: "hotel" },
    toko: { label: "Toko / Ruko", kata: "toko" },
    rs: { label: "Klinik / Rumah Sakit", kata: "fasilitas kesehatan" },
    lain: { label: "Bangunan Komersial", kata: "bangunan" }
  },

  namaSistem: {
    hybrid: "PLTS Hybrid On-Grid",
    hybridoff: "PLTS Hybrid Off-Grid",
    ongrid: "PLTS On-Grid",
    offgrid: "PLTS Off-Grid"
  },

  // Alasan rekomendasi otomatis. {kata}=segmen, {backupJam}, {bebanBackup}, {bep}, {roi}, {hemat25}, {horizon}
  alasan: {
    hybrid: [
      [
        "Listrik Tetap Menyala Saat PLN Padam",
        "Baterai LiFePO4 mengambil alih secara otomatis. Dengan cadangan ~{backupJam} jam untuk beban penting {bebanBackup} kW, aktivitas {kata} tetap berjalan."
      ],
      [
        "Hemat Tagihan Sejak Bulan Pertama",
        "Energi matahari dipakai langsung di siang hari, kelebihannya disimpan di baterai untuk malam hari."
      ],
      [
        "Investasi yang Kembali",
        "Balik modal ~{bep} tahun dengan total penghematan ~{hemat25} selama {horizon} tahun."
      ],
      ["Siap Dikembangkan", "Kapasitas baterai dapat ditambah kapan saja tanpa mengganti inverter."]
    ],
    ongrid: [
      [
        "Balik Modal Tercepat",
        "Tanpa baterai, investasi lebih ringan sehingga BEP tercapai dalam ~{bep} tahun."
      ],
      ["Imbal Hasil Tinggi", "ROI ~{roi} selama {horizon} tahun."],
      [
        "Perawatan Minimal",
        "Tidak ada baterai yang perlu diganti; cukup pembersihan panel berkala."
      ],
      ["Monitoring Real-time", "Produksi energi dapat dipantau langsung dari aplikasi di ponsel."]
    ],
    hybridoff: [
      [
        "Listrik Tetap Menyala Saat PLN Padam",
        "Baterai LiFePO4 mengambil alih secara otomatis; cadangan ~{backupJam} jam untuk beban penting {bebanBackup} kW."
      ],
      [
        "Mengutamakan Energi Surya",
        "Beban rumah dilayani dari panel surya dan baterai lebih dulu; PLN hanya menjadi sumber cadangan."
      ],
      [
        "Tanpa Ekspor ke PLN",
        "Sistem off-grid tidak mengirim listrik ke jaringan PLN, sehingga tidak memerlukan meter ekspor-impor."
      ],
      [
        "Investasi yang Kembali",
        "Balik modal ~{bep} tahun dengan total penghematan ~{hemat25} selama {horizon} tahun."
      ]
    ],
    offgrid: [
      [
        "Mandiri Energi Penuh",
        "Tidak bergantung pada jaringan PLN — cocok untuk lokasi tanpa listrik atau sering padam."
      ],
      ["Cadangan Energi Baterai", "Cadangan ~{backupJam} jam untuk beban {bebanBackup} kW."],
      ["Bebas Tagihan & BBM", "Menggantikan genset dan biaya bahan bakar."]
    ]
  },

  kapanLain: {
    hybrid: [
      "Pemadaman listrik di lokasi cukup sering atau berdampak besar pada aktivitas",
      "Ingin memiliki cadangan listrik otomatis untuk beban penting"
    ],
    ongrid: [
      "Prioritas utama adalah BEP tercepat dan ROI tertinggi",
      "Anggaran investasi terbatas",
      "Lokasi jarang mengalami pemadaman"
    ],
    hybridoff: [
      "Ingin memaksimalkan pemakaian energi surya dan baterai dengan PLN sebagai cadangan",
      "Kapasitas inverter per unit lebih kecil dan dapat dipasang paralel"
    ],
    offgrid: ["Lokasi belum terjangkau jaringan PLN", "Ingin mandiri energi sepenuhnya"]
  },

  // Perbandingan fitur per jenis sistem (ya / tidak / sebagian + keterangan)
  fitur: [
    {
      nama: "Backup saat PLN padam",
      hybrid: ["ya", "Otomatis"],
      ongrid: ["tidak", "PLTS ikut mati"],
      offgrid: ["ya", "Selalu dari baterai"]
    },
    {
      nama: "Stabilisasi tegangan",
      hybrid: ["ya", "Level UPS"],
      ongrid: ["sebagian", "Mengikuti PLN"],
      offgrid: ["ya", "Inverter"]
    },
    { nama: "Monitoring aplikasi", hybrid: ["ya", ""], ongrid: ["ya", ""], offgrid: ["ya", ""] },
    {
      nama: "Dapat ditambah baterai",
      hybrid: ["ya", ""],
      ongrid: ["tidak", "Perlu ganti inverter"],
      offgrid: ["ya", ""]
    }
  ],

  // "Mengapa Berlin Energi" — dari Company Profile
  mengapaKami: [
    [
      "Berpengalaman Sejak 2013",
      "Desain, pengadaan, dan instalasi PLTS untuk rumah, gedung komersial, hingga industri skala megawatt."
    ],
    [
      "Konsultasi & Survey Gratis",
      "Setiap desain berangkat dari survey lapangan: kondisi atap, bayangan, kelistrikan, dan pola pemakaian."
    ],
    [
      "Produk Tier-1 Bergaransi",
      "Panel surya Tier-1 (Trina, JA Solar, Jinko) bergaransi 12 tahun; inverter & baterai bergaransi resmi."
    ],
    [
      "Keselamatan Utama",
      "Instalasi dan operasional selalu mengutamakan keselamatan kerja dan standar kelistrikan."
    ],
    [
      "Harga Kompetitif & Transparan",
      "Rincian biaya, asumsi perhitungan, dan estimasi penghematan disampaikan terbuka."
    ],
    ["Layanan Purna Jual", "Maintenance dan dukungan teknis setelah sistem beroperasi."]
  ],

  // Catatan penawaran (dari Quotation Berlin Energi)
  catatanPenawaran: [
    "Berlaku untuk instalasi di wilayah Jakarta, Bogor, Depok, Tangerang, dan Bekasi. Di luar wilayah tersebut belum termasuk biaya perjalanan dan akomodasi.",
    "Harga berlaku maksimal 15 (lima belas) hari kalender sejak tanggal penawaran.",
    "Barang yang sudah dipesan tidak dapat dibatalkan atau dikembalikan.",
    "Harga sudah termasuk pengurusan izin SLO (Sertifikat Laik Operasi)."
  ],
  masaBerlakuHari: 15,

  termin: [
    { persen: 50, ket: "Down Payment (DP)" },
    { persen: 35, ket: "Material tiba di lokasi" },
    { persen: 10, ket: "Berita Acara Serah Terima (BAST)" },
    { persen: 5, ket: "Terbit Sertifikat Laik Operasi (SLO)" }
  ],

  // Garansi selain produk (mis. { item: "Jasa Instalasi", durasi: "1 Tahun" }) — garansi produk diambil dari LHS
  garansiTambahan: [],

  // Tahapan proyek. Isi "durasi" bila ingin menampilkan estimasi waktu (kosong = tidak ditampilkan).
  timeline: [
    { tahap: "Persetujuan & Down Payment", durasi: "" },
    { tahap: "Pengadaan Material", durasi: "" },
    { tahap: "Instalasi & Commissioning", durasi: "" },
    { tahap: "Serah Terima (BAST)", durasi: "" },
    { tahap: "Penerbitan SLO", durasi: "" }
  ],

  catatanPenutup:
    "Seluruh angka penghematan merupakan estimasi berdasarkan data survey dan asumsi pada bagian Lampiran."
};
