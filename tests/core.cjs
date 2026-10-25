const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { berlinWorkbook } = require("./workbook.cjs");

const root = path.resolve(process.env.APP_ROOT || path.join(__dirname, ".."));
const recording = process.argv.includes("--record");
const fixturePath = path.join(__dirname, "fixtures", "core.json");
const fixture = recording ? {} : JSON.parse(fs.readFileSync(fixturePath, "utf8"));
const results = {};
const resolve = (current, legacy) =>
  path.join(root, fs.existsSync(path.join(root, current)) ? current : legacy);
const digest = (value) => crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex");
function check(name, value) {
  results[name] = digest(value);
  if (!recording) assert.equal(results[name], fixture[name], name);
  console.log(`PASS ${name}`);
}

async function main() {
  const window = {};
  vm.runInNewContext(fs.readFileSync(path.join(root, "data/pengaturan.js"), "utf8"), { window });
  vm.runInNewContext(fs.readFileSync(path.join(root, "data/produk.js"), "utf8"), { window });
  globalThis.XLSX = require(resolve("vendor/xlsx.full.min.js", "lib/xlsx.full.min.js"));
  const PB = (globalThis.ParserBOQ = require(resolve("js/parsers/boq.js", "js/parser.js")));
  const PS = require(resolve("js/parsers/survey.js", "js/survey.js"));
  const Berlin = require(resolve("js/parsers/berlin.js", "js/berlin.js"));
  const K = require(resolve("js/calculations/engine.js", "js/kalkulasi.js"))();
  const { asumsi } = window.PENGATURAN;
  check(
    "number parsing",
    [
      null,
      undefined,
      0,
      55.25,
      "",
      "Rp 55.770.000",
      "55,770,000",
      "209.76",
      "1.234,5",
      "1,234.5",
      "(100.000)",
      "-500",
      "20 kWp",
      "1.482",
      "3,4"
    ].map((v) => PB.angka(v))
  );
  check(
    "date parsing",
    [
      "2026-10-19",
      "19/10/2026",
      "10/19/2026",
      "03/04/26",
      "19 Oktober 2026",
      "15 May 2026",
      "invalid",
      ""
    ].flatMap((s) =>
      ["DMY", "MDY"].map((f) => [PB.tanggal(s, f), PB.tanggalIndo(PB.tanggal(s, f))])
    )
  );
  check(
    "customer parsing",
    [
      "Pak Johnny, Cibubur",
      "Ir. Budi, S.T., Jakarta",
      "PT Contoh | Jl. Contoh 1",
      "Bu Uji",
      ""
    ].map((s) => PB.pecahCustomer(s))
  );
  const text =
    "QUOTATION\nNo. BE/2026/001\nInvoice Date: 19/10/2026\nCUSTOMER: Pak Uji, Jakarta\nContext Notes: Opsi A - Hybrid | Rumah\nNo Code Uraian Qty Unit Harga Total\n1 PV Panel Surya 550Wp 10 unit 2,000,000 20,000,000\n2 INV Inverter Hybrid 5kW 1 unit 10,000,000 10,000,000\nSubtotal 30,000,000\nTOTAL 30,000,000";
  check("legacy BOQ text", PB.bacaTeks(text, { formatTanggal: "DMY" }));
  const rows = [
    ["No", "Code", "Uraian", "Qty", "Unit", "Harga", "Total"],
    [1, "PV", "Panel Surya 550Wp", 10, "unit", 2000000, 20000000],
    [2, "INV", "Inverter Hybrid 5kW", 1, "unit", 10000000, 10000000],
    [3, "BAT", "Baterai LiFePO4 5.12kWh", 2, "unit", 20000000, 40000000]
  ];
  const items = PB.itemDariBaris(rows);
  const components = PB.deteksiKomponen(items);
  check("worksheet items and components", {
    items,
    components,
    products: ["pv", "inverter", "baterai"].map((k) =>
      PB.cocokkanProduk(window.PRODUK, k, components[k])
    )
  });
  const report =
    "Nama Pelanggan: Pak Uji\nAlamat: Jl. Contoh 1\nDaya Listrik: 6600 VA\nGolongan Tarif: R3\nTagihan Listrik: Rp 2.000.000\nLuas Atap: 120 m2\nKemiringan Atap: 25\nTanggal Survey: 19 Oktober 2026\nJenis Atap: Genteng\nCatatan: Uji & teks <khusus>";
  check("survey text", PS.bacaTeksSurvey(report));
  check("survey spreadsheet", [
    PS.teksDariBarisExcel([
      ["Nama Pelanggan", "Alamat", "Daya Listrik", "Luas Atap", "Jenis Atap"],
      ["A", "Jl. Lama", 3500, 60, "Seng"],
      ["B", "Jl. Baru", 6600, 120, "Genteng"]
    ]),
    PS.teksDariBarisExcel([
      ["Nama Pelanggan", "Pak Uji"],
      ["Luas Atap", 120]
    ])
  ]);
  const { name, buffer: bytes } = berlinWorkbook();
  const file = {
    name,
    arrayBuffer: async () =>
      bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength)
  };
  const workbook = await Berlin.bacaWorkbook(file);
  assert.equal(workbook.lhs.komponen.pv.qty, 10);
  assert.equal(workbook.lhs.komponen.baterai.whTotal, 10240);
  assert.equal(workbook.boq.jumlah, 80000000);
  assert.equal(workbook.quo.tot.total, workbook.boq.ringkas.grandTotal);
  assert.deepEqual(workbook.peringatan, []);
  check("synthetic Berlin workbook", workbook);
  for (const jenis of ["ongrid", "hybrid", "hybridoff", "offgrid"]) {
    for (const metode of ["bulanan", "tahunan"]) {
      for (const pascabayar of [false, true]) {
        const input = {
          investasi: 125000000,
          kWp: 9.45,
          jenis,
          bateraiKWh: jenis === "ongrid" ? 0 : 10.24,
          dod: 90,
          degradasiTahun1: 1,
          degradasiTahunan: 0.4,
          biayaGantiBaterai: 25000000,
          tahunGantiBaterai: 12
        };
        check(
          `calculation ${jenis} ${metode} ${pascabayar}`,
          K.hitung(
            input,
            { tagihan: 2500000, kva: 13.2, tarif: 1699.53, pascabayar },
            { ...asumsi, metode, biayaPerawatanPersen: 1 }
          )
        );
      }
    }
  }
  check(
    "calculation boundaries",
    [0, 100000000000].map((investasi) =>
      K.hitung(
        { investasi, kWp: 0, jenis: "ongrid", bateraiKWh: 0 },
        { tagihan: 0, kva: 0, tarif: 0 },
        { ...asumsi, horizonTahun: 1 }
      )
    )
  );
  check(
    "number and currency formatting",
    [0, 12.5, -3500000, 125000000, 1500000000, 2e12].map((v) => [
      K.rp(v),
      K.num(v, 2),
      K.rpSingkat(v),
      K.terbilang(v)
    ])
  );
  if (recording) fs.writeFileSync(fixturePath, JSON.stringify(results, null, 2) + "\n");
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
