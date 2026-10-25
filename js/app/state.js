// Default project state, local persistence, dates and sales directory.
// Dependencies and shared state are provided through ctx.
function initAppState(ctx) {
  const ST = window.PENGATURAN,
    KAT = window.PRODUK || [],
    PB = window.ParserBOQ,
    PS = window.ParserSurvey,
    PBE = window.ParserBerlin,
    K = window.Kalkulasi;
  if (window.pdfjsLib) {
    try {
      pdfjsLib.GlobalWorkerOptions.workerSrc = "vendor/pdf.worker.min.js";
    } catch (e) {}
  }
  const $ = (s) => document.querySelector(s),
    $$ = (s) => [...document.querySelectorAll(s)];
  const esc = (s) =>
    String(s ?? "").replace(
      /[&<>"']/g,
      (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]
    );
  const clone = (o) => JSON.parse(JSON.stringify(o));
  const KUNCI = "berlin-energi-proposal-v2";

  // ---------------------------- STATE ----------------------------
  const baru = () => ({
    proyek: {
      lokasi: "",
      pic: "",
      alamat: "",
      nomor: "",
      segmen: "lain",
      tanggal: hariIni(),
      berlaku: tambahHari(hariIni(), ST.masaBerlakuHari || 15),
      foto: null
    },
    pln: {
      idPelanggan: "",
      idCatatan: "",
      golongan: "R-3",
      kva: 0,
      fase: "",
      kwh: 0,
      tagihan: 0,
      tarif: tarifDari("R-3"),
      pascabayar: false
    },
    asumsi: clone(ST.asumsi),
    opsi: [],
    rekomendasi: null,
    alasanTeks: "",
    penutupTeks: "",
    manualAlasan: false,
    manualPenutup: false,
    kontak: { nama: ST.perusahaan.penandatangan, telepon: ST.perusahaan.telepon },
    tampilkanRincian: true,
    cetakItem: true,
    sales: { nama: "", wa: "" },
    timelineTeks: ST.timeline.map((t) => `${t.tahap} | ${t.durasi}`).join("\n"),
    opsiAktif: 0,
    survey: surveyBaru()
  });
  function surveyBaru() {
    return { isian: {}, foto: [], sumber: [], tampil: true };
  }
  function hariIni() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }
  function tambahHari(iso, n) {
    const d = new Date(iso + "T12:00:00");
    d.setDate(d.getDate() + n);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }
  function tarifDari(kode) {
    const t = ST.tarifPLN.find((t) => t.kode === kode);
    return t ? t.tarif : 1444.7;
  }
  let S;
  try {
    S = JSON.parse(localStorage.getItem(KUNCI)) || baru();
  } catch (e) {
    S = baru();
  }
  if (!S.survey) S.survey = surveyBaru();
  if (!S.sales) S.sales = { nama: "", wa: "" };
  // ---- direktori WhatsApp sales (pengaturan.js + yang pernah diketik di dashboard) ----
  const KUNCI_SALES = "berlin-energi-sales";
  const kunciNama = (n) =>
    String(n || "")
      .toLowerCase()
      .replace(/^(bu|ibu|bpk|pak|bapak|mas|mbak)\.?\s+/, "")
      .replace(/\s+/g, " ")
      .trim();
  function direktoriSales() {
    let d = {};
    (ST.daftarSales || []).concat((window.AKSES && window.AKSES.pengguna) || []).forEach((x) => {
      if (x && x.nama && x.wa) d[kunciNama(x.nama)] = x.wa;
    });
    try {
      Object.assign(d, JSON.parse(localStorage.getItem(KUNCI_SALES)) || {});
    } catch (e) {}
    return d;
  }
  function ingatSales(nama, wa) {
    if (!nama || !wa) return;
    try {
      const d = JSON.parse(localStorage.getItem(KUNCI_SALES)) || {};
      d[kunciNama(nama)] = wa;
      localStorage.setItem(KUNCI_SALES, JSON.stringify(d));
    } catch (e) {}
  }
  const normWA = (v) => {
    let d = String(v || "").replace(/\D/g, "");
    if (d.startsWith("0")) d = "62" + d.slice(1);
    else if (d.startsWith("8")) d = "62" + d;
    return d;
  };
  // foto survey bisa melebihi kuota penyimpanan browser → simpan tanpa foto bila perlu
  const simpanLokal = () => {
    try {
      localStorage.setItem(KUNCI, JSON.stringify(S));
    } catch (e) {
      try {
        localStorage.setItem(
          KUNCI,
          JSON.stringify(
            Object.assign({}, S, {
              survey: Object.assign({}, S.survey, { foto: [] }),
              proyek: Object.assign({}, S.proyek, { foto: null })
            })
          )
        );
      } catch (e2) {}
    }
  };

  Object.assign(ctx, {
    ST,
    KAT,
    PB,
    PS,
    PBE,
    K,
    $,
    $$,
    esc,
    clone,
    KUNCI,
    baru,
    surveyBaru,
    hariIni,
    tambahHari,
    tarifDari,
    KUNCI_SALES,
    kunciNama,
    direktoriSales,
    ingatSales,
    normWA,
    simpanLokal
  });

  Object.defineProperty(ctx, "S", {
    get: () => S,
    set: (value) => {
      S = value;
    }
  });
}
