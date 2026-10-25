// Survey field definitions, labels and normalization.
// Dependencies and shared state are provided through ctx.
function initParsersSurveyFields(ctx) {
  const PB = ctx.root.ParserBOQ;

  // key, label (tampil di proposal), pola label di laporan, tipe nilai
  const FIELD = [
    [
      "tanggalSurvey",
      "Tanggal Survey",
      /tanggal\s*survey|tgl\.?\s*survey|survey\s*date|waktu\s*survey|hari\s*\/?\s*tanggal/i,
      "tanggal"
    ],
    [
      "surveyor",
      "Surveyor",
      /surveyor|petugas\s*survey|disurvey\s*oleh|tim\s*survey|nama\s*teknisi/i,
      "teks"
    ],
    [
      "lokasi",
      "Nama Lokasi / Proyek",
      /nama\s*(proyek|project|lokasi|gedung|bangunan|perusahaan|instansi|usaha)|project\s*name/i,
      "teks"
    ],
    [
      "pic",
      "Nama Pelanggan / PIC",
      /nama\s*(pelanggan|customer|klien|client|pemilik|pic)|customer\s*name|contact\s*person|\bpic\b/i,
      "teks"
    ],
    [
      "telepon",
      "Telepon Pelanggan",
      /(no\.?\s*)?(telepon|telp|hp|wa|whatsapp|handphone)\b/i,
      "teks"
    ],
    ["alamat", "Alamat", /alamat|address|lokasi\s*survey/i, "teks"],
    [
      "koordinat",
      "Koordinat",
      /koordinat|coordinate|lat(itude)?\s*[,/]|titik\s*lokasi|gps/i,
      "koordinat"
    ],
    [
      "peruntukan",
      "Peruntukan Bangunan",
      /peruntukan|jenis\s*bangunan|fungsi\s*bangunan|tipe\s*bangunan|building\s*type/i,
      "teks"
    ],
    [
      "idPelanggan",
      "ID Pelanggan PLN",
      /id\s*pel(anggan)?|idpel|nomor\s*pelanggan|no\.?\s*pelanggan|no\.?\s*meter/i,
      "id"
    ],
    ["golongan", "Golongan Tarif", /golongan(\s*tarif)?|tarif\s*pln|jenis\s*tarif/i, "golongan"],
    [
      "daya",
      "Daya Terpasang PLN",
      /daya(\s*(terpasang|pln|listrik|kontrak))?|kapasitas\s*pln|power\s*capacity/i,
      "daya"
    ],
    [
      "tagihan",
      "Tagihan Listrik / Bulan",
      /tagihan|rekening\s*listrik|biaya\s*listrik|electricity\s*bill/i,
      "rupiah"
    ],
    ["pemakaian", "Pemakaian Listrik", /pemakaian|konsumsi(\s*listrik)?|consumption/i, "kwh"],
    [
      "pemadaman",
      "Frekuensi Pemadaman",
      /pemadaman|listrik\s*padam|frekuensi\s*padam|black\s*out/i,
      "teks"
    ],
    ["genset", "Genset", /genset|generator/i, "teks"],
    [
      "bebanKritis",
      "Beban Kritis / Backup",
      /beban\s*(kritis|backup|penting|prioritas|cadangan)/i,
      "kw"
    ],
    ["jamOperasi", "Jam Operasional", /jam\s*operasi(onal)?|jam\s*kerja|waktu\s*operasi/i, "teks"],
    [
      "jenisAtap",
      "Jenis / Material Atap",
      /(jenis|material|tipe|bahan)\s*atap|roof\s*type|penutup\s*atap/i,
      "teks"
    ],
    [
      "strukturAtap",
      "Struktur / Rangka Atap",
      /(struktur|rangka|konstruksi)\s*(atap)?|kondisi\s*atap/i,
      "teks"
    ],
    [
      "luasAtap",
      "Luas Area Tersedia",
      /luas\s*(atap|area|lahan|bidang)|area\s*(tersedia|pemasangan)|available\s*area/i,
      "m2"
    ],
    [
      "orientasi",
      "Orientasi / Arah Atap",
      /orientasi|arah\s*(atap|hadap|panel)|azimuth|menghadap/i,
      "teks"
    ],
    ["kemiringan", "Kemiringan Atap", /kemiringan|sudut\s*atap|tilt|pitch/i, "teks"],
    ["sekitar", "Kondisi Sekitar Atap", /kondisi\s*(di\s*)?sekitar(\s*atap)?/i, "teks"],
    ["bayangan", "Bayangan (Shading)", /bayangan|shading|naungan|halangan/i, "teks"],
    ["tinggi", "Tinggi Bangunan / Lantai", /tinggi\s*bangunan|jumlah\s*lantai|ketinggian/i, "teks"],
    [
      "panelListrik",
      "Panel Listrik / MDP",
      /\bmdp\b|panel\s*(listrik|utama|induk)|\bsdp\b/i,
      "teks"
    ],
    [
      "jarak",
      "Jarak Panel Surya ke Inverter / Panel",
      /jarak|panjang\s*kabel|cable\s*length/i,
      "teks"
    ],
    [
      "lokasiInverter",
      "Lokasi Inverter / Baterai",
      /lokasi\s*(inverter|baterai|battery|peralatan)|ruang\s*(inverter|panel)/i,
      "teks"
    ],
    [
      "grounding",
      "Grounding / Penangkal Petir",
      /grounding|pentanahan|penangkal\s*petir|arde/i,
      "teks"
    ],
    ["akses", "Akses Lokasi", /akses(\s*(lokasi|atap|material))?/i, "teks"],
    [
      "kebutuhan",
      "Kebutuhan / Keinginan Pelanggan",
      /kebutuhan\s*pelanggan|keinginan\s*pelanggan|permintaan|tujuan\s*(pemasangan|pelanggan)/i,
      "teks"
    ],
    [
      "catatan",
      "Catatan Surveyor",
      /catatan(\s*(surveyor|survey|teknis|tambahan|lapangan))?|kesimpulan(\s*survey)?|rekomendasi\s*(survey|surveyor|teknis)?|keterangan\s*tambahan|notes?\b/i,
      "panjang"
    ]
  ];
  const LABEL = Object.fromEntries(FIELD.map((f) => [f[0], f[1]]));
  const SEMUA_LABEL = new RegExp(FIELD.map((f) => f[2].source).join("|"), "i");

  const bersih = (s) =>
    String(s || "")
      .replace(/\s+/g, " ")
      .replace(/^(?:[\s:=|.]|[-–—](?=\s))+/, "")
      .replace(/[\s|]+$/, "")
      .trim();
  const angka = (s) => PB.angka(s);

  function nilaiSetelahLabel(baris, i, pola) {
    const m = baris[i].match(pola);
    let v = bersih(baris[i].slice(m.index + m[0].length).replace(/^\s*\(.*?\)/, ""));
    // label diikuti kata penjelas mis. "Daya PLN (VA) : 5500"
    if (!v || /^[(\[]?[a-z²/ ]{0,8}[)\]]?$/i.test(v)) {
      for (let j = i + 1; j < Math.min(baris.length, i + 3); j++) {
        const b = bersih(baris[j]);
        if (!b) continue;
        if (SEMUA_LABEL.test(b) && /[:|]/.test(b)) break;
        v = (v && /\S/.test(v) ? v + " " : "") + b;
        break;
      }
    }
    return bersih(v);
  }

  function ubah(tipe, v, golonganKode) {
    if (!v) return null;
    switch (tipe) {
      case "tanggal": {
        const t = PB.tanggal(v, "DMY");
        return t || v;
      }
      case "id": {
        const m = v.replace(/\s/g, "").match(/\d{8,13}/);
        return m ? m[0] : null;
      }
      case "golongan": {
        const m = v.toUpperCase().match(/\b([RBIPS])\s*-?\s*([1-4])\b/);
        return m ? `${m[1]}-${m[2]}` : v;
      }
      case "daya": {
        const m = v.match(/([\d.,]+)\s*(k?va|kw|watt)?/i);
        if (!m) return null;
        let n = angka(m[1]);
        const sat = (m[2] || "").toLowerCase();
        if (!isFinite(n) || !n) return null;
        if (sat === "kva" || sat === "kw") return n;
        if (sat === "va" || sat === "watt" || n >= 450) return n / 1000;
        return n;
      }
      case "rupiah": {
        const semua = [...v.matchAll(/(?:rp\.?\s*)?([\d][\d.,]{3,})(\s*(jt|juta|rb|ribu))?/gi)]
          .map((m) => {
            let n = angka(m[1]);
            const s = (m[3] || "").toLowerCase();
            if (s === "jt" || s === "juta") n *= 1e6;
            else if (s === "rb" || s === "ribu") n *= 1e3;
            return n;
          })
          .filter((n) => n >= 10000);
        if (!semua.length) {
          const m = v.match(/([\d.,]+)\s*(jt|juta)/i);
          return m ? angka(m[1]) * 1e6 : null;
        }
        return Math.round(semua.reduce((a, b) => a + b, 0) / semua.length);
      }
      case "kwh": {
        const m = v.match(/([\d.,]+)\s*kwh/i);
        return m ? angka(m[1]) : null;
      }
      case "kw": {
        const m = v.match(/([\d.,]+)\s*(kw|kva|watt|w)\b/i);
        if (!m) return v;
        const n = angka(m[1]);
        return /^w/i.test(m[2]) ? n / 1000 : n;
      }
      case "m2": {
        const m = v.match(/([\d.,]+)\s*(m2|m²|meter\s*persegi|sqm)?/i);
        return m && isFinite(angka(m[1])) ? angka(m[1]) : null;
      }
      case "koordinat": {
        const m = v.match(/-?\d{1,3}[.,]\d{3,}\s*[,;/ ]\s*-?\d{1,3}[.,]\d{3,}/);
        return m ? m[0].replace(/\s+/g, " ") : v;
      }
      default:
        return v.length > 300 ? v.slice(0, 300) + "…" : v;
    }
  }

  Object.assign(ctx, { PB, FIELD, LABEL, SEMUA_LABEL, bersih, angka, nilaiSetelahLabel, ubah });
}

if (typeof module !== "undefined" && module.exports) module.exports = initParsersSurveyFields;
