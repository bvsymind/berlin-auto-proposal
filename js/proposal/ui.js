// Shared UI fragments, section navigation and WhatsApp links.
// Dependencies and shared state are provided through ctx.
function initProposalUi(ctx) {
  // ---------------------------- POTONGAN UI ----------------------------
  const kepala = (no, judul, sub = "") =>
    `<header class="sh"><span class="no">${String(no).padStart(2, "0")}</span><div><h2>${ctx.esc(judul)}</h2>${sub ? `<p>${ctx.esc(sub)}</p>` : ""}</div><img class="sh-logo" src="${ctx.D.aset.logo}" alt=""></header>`;
  const kpi = (ikon, nilai, label, kelas = "", angka = null, fmt = "") =>
    `<div class="kpi ${kelas}"><div class="ki">${ctx.IC[ikon]}</div><div class="kv"${angka != null ? ` data-count="${angka}" data-fmt="${fmt}"` : ""}>${nilai}</div><div class="kl">${label}</div></div>`;
  const tanda = (v) =>
    v === "ya"
      ? `<span class="tg ok">${ctx.IC.check}</span>`
      : v === "tidak"
        ? `<span class="tg no">${ctx.IC.x}</span>`
        : `<span class="tg wr">${ctx.IC.warn}</span>`;
  const SALES = ctx.D.sales && ctx.D.sales.nama ? ctx.D.sales : null; // nomor WA sales boleh kosong → pakai nomor perusahaan
  const noWA = (SALES && SALES.wa) || ctx.P.whatsapp || "";
  const waTampil = (n) => {
    const d = String(n || "").replace(/\D/g, "");
    if (!d) return "";
    const lokal = d.replace(/^62/, "");
    return "+62 " + lokal.replace(/^(\d{3})(\d{4})(\d+)$/, "$1-$2-$3");
  };
  const linkWA = (teks) => `https://wa.me/${noWA}?text=${encodeURIComponent(teks)}`;
  const kv = (rows) =>
    `<div class="tw"><table class="tbl kv">${rows
      .filter((r) => r && r[1] !== "" && r[1] != null)
      .map((r) => `<tr><th>${ctx.esc(r[0])}</th><td>${r[2] ? r[1] : ctx.esc(r[1])}</td></tr>`)
      .join("")}</table></div>`;
  const namaKomp = (o, k) => {
    const c = o.komponen[k];
    return c ? c.nama || c.uraian : "";
  };
  const judulSistem = (o) =>
    `${ctx.D.namaSistem[o.jenis]} ${ctx.num(o.kWp, 2)} kWp${o.bateraiKWh ? " · " + ctx.num(o.bateraiKWh, 2) + " kWh" : ""}`;
  const arahMataAngin = (deg) => {
    const d = +deg;
    if (!isFinite(d)) return "";
    const n = [
      "Utara",
      "Timur Laut",
      "Timur",
      "Tenggara",
      "Selatan",
      "Barat Daya",
      "Barat",
      "Barat Laut"
    ];
    return n[Math.round((((d % 360) + 360) % 360) / 45) % 8];
  };

  // daftar bagian (untuk nomor, daftar isi, navigasi)
  function daftarBagian() {
    const L = [["ringkasan", "Ringkasan Proposal", "Sistem, investasi & penghematan"]];
    if (ctx.D.survey)
      L.push(["survey", "Hasil Survey Lokasi", "Data lokasi, kelistrikan & dokumentasi"]);
    L.push(["desain", "Desain Sistem", "Diagram, layout & konfigurasi"]);
    L.push([
      "spesifikasi",
      "Spesifikasi & Garansi Produk",
      "Panel surya, inverter, baterai & datasheet"
    ]);
    L.push(["produksi", "Proyeksi Produksi Energi", "Estimasi energi yang dihasilkan"]);
    L.push(["finansial", "Analisis Finansial", "Penghematan, BEP & ROI"]);
    if (ctx.multi)
      L.push(["perbandingan", "Perbandingan & Rekomendasi", "Opsi sistem secara berdampingan"]);
    L.push(["lingkungan", "Dampak Lingkungan", "Kontribusi untuk bumi yang lebih bersih"]);
    L.push(["penawaran", "Penawaran Harga", "Quotation & rincian pekerjaan"]);
    L.push(["garansi", "Pembayaran & Tahapan Proyek", "Termin, rekening & alur kerja"]);
    L.push(["tentang", `Tentang ${titleCase(ctx.P.nama)}`, "Profil, keunggulan & portofolio"]);
    L.push(["penutup", "Penutup & Persetujuan", "Langkah selanjutnya"]);
    L.push([
      "lampiran",
      "Lampiran",
      ctx.D.tampilkanRincian ? "Datasheet, asumsi & rincian BOQ" : "Datasheet & asumsi perhitungan"
    ]);
    return L;
  }
  const titleCase = (s) =>
    String(s || "")
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());
  let NO = {};

  Object.assign(ctx, {
    kepala,
    kpi,
    tanda,
    SALES,
    noWA,
    waTampil,
    linkWA,
    kv,
    namaKomp,
    judulSistem,
    arahMataAngin,
    daftarBagian,
    titleCase
  });

  Object.defineProperty(ctx, "NO", {
    get: () => NO,
    set: (value) => {
      NO = value;
    }
  });
}

if (typeof module !== "undefined" && module.exports) module.exports = initProposalUi;
