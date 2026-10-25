// Synthetic test data only: no customer workbooks or exported proposals are required.
const XLSX = require("../vendor/xlsx.full.min.js");

function berlinWorkbook() {
  const book = XLSX.utils.book_new();
  const field = (label, value) => ["", label, "", "", "", value];
  const lhs = [
    ["Nama Client"],
    ["Pelanggan Uji"],
    ["Lokasi"],
    ["Jl. Pengujian 1, Kota Uji"],
    ["Tanggal"],
    ["2026-10-19"],
    ["No", "UJI/2026/001"],
    ["Surveyor"],
    ["Surveyor Uji"],
    ["Notes"],
    ["Data sintetis untuk pengujian otomatis."],
    ["PLTS Hybrid - 5500Wp - 10240Wh"],
    ["", "I. Informasi Bangunan"],
    field("Jenis Bangunan", "Residential"),
    field("Lantai", 2),
    field("Orientasi", 90),
    field("Kemiringan", 25),
    field("Kondisi Sekitar", "Tanpa bayangan"),
    ["", "II. Informasi Beban"],
    field("Golongan", "R-3"),
    field("Daya Listrik", "13200 VA / 3 Fasa"),
    field("Pemakaian Listrik", 1200),
    field("Tagihan Listrik", 2000000),
    field("Tarif", 1699.53),
    ["", "IV. Proyeksi Produksi"],
    ["", 6825.5],
    ["", 3.4],
    [],
    [],
    [],
    ["", "VI. Spesifikasi"],
    field("Spesifikasi", ""),
    field("Panel Surya", ""),
    field("Produser", "Merek Uji"),
    field("Model", "PV-550"),
    field("Jenis", "Monocrystalline"),
    field("Rating Daya", 550),
    field("Garansi", 12),
    field("Inverter", ""),
    field("Produser", "Merek Uji"),
    field("Model", "INV-5K"),
    field("Jenis", "Hybrid"),
    field("Rating Daya", "5000 W"),
    field("Garansi", 5),
    field("Baterai", ""),
    field("Produser", "Merek Uji"),
    field("Model", "BAT-5120"),
    field("Jenis", "LiFePO4"),
    field("Kapasitas", 5120),
    field("Cycle", 6000),
    field("Garansi", 5),
    field("Konfigurasi", ""),
    field("Panel Surya", ""),
    field("Total Panel", 10),
    field("Luas", 27),
    field("Inverter", ""),
    field("Total Inverter", 1),
    field("Total Daya", 5000),
    field("Baterai", ""),
    field("Total Baterai", 2),
    field("Total Kapasitas", 10240),
    field("Material Instalasi", ""),
    field("Kabel DC", "")
  ];
  const boq = [
    ["No", "Items", "Specification", "Brand", "Qty", "Unit", "Unit Price", "Total Price"],
    ["A", "PV Module"],
    [1, "Panel Surya", "550Wp", "Merek Uji", 10, "unit", 2000000, 20000000],
    ["B", "Inverter"],
    [2, "Inverter Hybrid", "5kW", "Merek Uji", 1, "unit", 15000000, 15000000],
    ["C", "Battery"],
    [3, "Baterai LiFePO4", "5.12kWh", "Merek Uji", 2, "unit", 20000000, 40000000],
    ["D", "Jasa Instalasi"],
    [4, "Instalasi PLTS", "Paket", "Lokal", 1, "lot", 5000000, 5000000],
    ["Sub Total", "", "", "", "", "", "", 80000000],
    ["Discount", "", "", "", "", "", "", 0],
    ["PPN", "", "", "", "", "", "", 0],
    ["Grand Total", "", "", "", "", "", "", 80000000],
    [],
    ["Product", "Desc", "Unit Price", "Qty", "Unit", "Total"],
    ["Solar Panel", "550Wp", 2000000, 10, "unit", 20000000],
    ["Inverter", "Hybrid 5kW", 15000000, 1, "unit", 15000000],
    ["Battery", "LiFePO4", 20000000, 2, "unit", 40000000],
    ["Jasa", "Instalasi", 5000000, 1, "lot", 5000000],
    ["", "", "", "", "Sub Total", 80000000],
    ["", "", "", "", "Discount", 0],
    ["", "", "", "", "PPN", 0],
    ["", "", "", "", "Total", 80000000]
  ];
  const sheets = {
    LHS: lhs,
    BMI: boq,
    Savings: [
      ["Rate Hike", 0.03],
      ["PV Degradation", 0.004],
      ["1st Year Degradation", 0.01],
      ["Results / Year", 6825.5],
      ["Price", 80000000]
    ],
    "DB LHS": [
      ["Nomor Induk LHS", "Marketing/PIC (Berlin)", "Lama Pengerjaan", "WA Sales"],
      ["UJI/2026/001", "Sales Uji", 14, ""]
    ]
  };
  for (const [name, rows] of Object.entries(sheets)) {
    XLSX.utils.book_append_sheet(book, XLSX.utils.aoa_to_sheet(rows), name);
  }
  return {
    name: "workbook-uji.xlsx",
    mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    buffer: Buffer.from(XLSX.write(book, { type: "buffer", bookType: "xlsx" }))
  };
}

module.exports = { berlinWorkbook };
