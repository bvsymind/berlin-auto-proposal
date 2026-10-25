// BOQ numbers, dates and customer names.
// Dependencies and shared state are provided through ctx.
function initParsersBoqCommon(ctx) {
  const BULAN = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember"
  ];
  const BULAN_EN = [
    "jan",
    "feb",
    "mar",
    "apr",
    "mei|may",
    "jun",
    "jul",
    "agu|aug",
    "sep",
    "okt|oct",
    "nov",
    "des|dec"
  ];
  const SATUAN =
    "unit|units|pcs|pc|lot|ls|m2|m²|m|mtr|meter|set|roll|buah|bh|titik|kg|paket|pkt|keping|lembar|lbr|btg|batang|ea|kwp|wp";

  // "55,770,000" → 55770000 | "1.482" → 1482 | "209.76" → 209.76 | "1.234,5" → 1234.5
  function angka(s) {
    if (s === null || s === undefined) return NaN;
    if (typeof s === "number") return s;
    let t = String(s)
      .replace(/rp\.?/gi, "")
      .replace(/[\s()\-]/g, "")
      .replace(/[^\d.,]/g, "");
    if (!t) return NaN;
    const koma = (t.match(/,/g) || []).length,
      titik = (t.match(/\./g) || []).length;
    if (koma && titik) {
      // pemisah desimal = yang muncul paling akhir
      if (t.lastIndexOf(",") > t.lastIndexOf(".")) t = t.replace(/\./g, "").replace(",", ".");
      else t = t.replace(/,/g, "");
    } else if (koma) {
      t = koma > 1 || /,\d{3}$/.test(t) ? t.replace(/,/g, "") : t.replace(",", ".");
    } else if (titik) {
      t = titik > 1 || /\.\d{3}$/.test(t) ? t.replace(/\./g, "") : t;
    }
    return parseFloat(t);
  }

  // Mengubah teks tanggal menjadi "YYYY-MM-DD"
  function tanggal(s, format) {
    if (!s) return "";
    s = String(s).trim();
    let m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m) return `${m[1]}-${m[2]}-${m[3]}`;
    m = s.match(/(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})/);
    if (m) {
      let a = +m[1],
        b = +m[2],
        y = +m[3];
      if (y < 100) y += 2000;
      let d, mo;
      if (a > 12) {
        d = a;
        mo = b;
      } else if (b > 12) {
        mo = a;
        d = b;
      } else if (format === "DMY") {
        d = a;
        mo = b;
      } else {
        mo = a;
        d = b;
      }
      return `${y}-${String(mo).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    }
    m = s.match(/(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/);
    if (m) {
      const idx = BULAN_EN.findIndex((p) => new RegExp("^(" + p + ")", "i").test(m[2]));
      if (idx >= 0) return `${m[3]}-${String(idx + 1).padStart(2, "0")}-${m[1].padStart(2, "0")}`;
    }
    return "";
  }

  function tanggalIndo(iso) {
    if (!iso) return "";
    const [y, m, d] = iso.split("-").map(Number);
    return `${String(d).padStart(2, "0")} ${BULAN[m - 1]} ${y}`;
  }

  // Gelar akademik/pangkat seperti "S.T.", "M.H.", "Ir.", "Dr."
  const GELAR = /^(?:[A-Z][a-zA-Z]{0,3}\.){1,3}(?:[A-Z][a-zA-Z]{0,3})?\.?$/;

  function pecahCustomer(teks) {
    teks = (teks || "").replace(/\s+/g, " ").trim();
    let [nama, ...alamat] = teks.split("|");
    alamat = alamat.join(",").trim();
    nama = nama.trim().replace(/,\s*$/, "");
    const seg = nama
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    let lokasi = "",
      pic = nama;
    if (seg.length > 1) {
      const terakhir = seg[seg.length - 1];
      if (!GELAR.test(terakhir)) {
        lokasi = terakhir;
        pic = seg.slice(0, -1).join(", ");
      }
    }
    if (!lokasi) {
      lokasi = nama;
      pic = "";
    }
    return { lokasi, pic, alamat };
  }

  Object.assign(ctx, {
    BULAN,
    BULAN_EN,
    SATUAN,
    angka,
    tanggal,
    tanggalIndo,
    GELAR,
    pecahCustomer
  });
}

if (typeof module !== "undefined" && module.exports) module.exports = initParsersBoqCommon;
