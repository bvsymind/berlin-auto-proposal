// Extract survey values from report text.
// Dependencies and shared state are provided through ctx.
function initParsersSurveyText(ctx) {
  // Ambil isian dari teks laporan survey. Hasil: { key: nilai }
  function bacaTeksSurvey(teks) {
    const baris = String(teks || "")
      .split(/\r?\n/)
      .map((s) => s.replace(/\t/g, " | ").trim())
      .filter(Boolean);
    const hasil = {};
    for (const [key, , pola, tipe] of ctx.FIELD) {
      // putaran 1: hanya baris "Label : nilai" / sel tabel; putaran 2: lebih longgar
      for (const ketat of [true, false]) {
        if (key in hasil || (!ketat && /teks|panjang/.test(tipe))) break;
        for (let i = 0; i < baris.length; i++) {
          const b = baris[i];
          if (!pola.test(b)) continue;
          if (ketat) {
            const m0 = b.match(pola),
              sisa = b.slice(m0.index + m0[0].length);
            if (sisa.trim() && !/^\s*(\([^)]*\))?\s*[:|=]/.test(sisa)) continue;
          }
          // label harus di awal baris / sel (bukan di tengah kalimat panjang)
          const m = b.match(pola);
          const sebelum = b.slice(0, m.index);
          if (
            sebelum &&
            !/(^|\|)\s*(\d+[.)]\s*)?$/.test(sebelum) &&
            !/^\s*\d+[.)]\s*$/.test(sebelum)
          )
            continue;
          if (tipe === "panjang") {
            let v = ctx.bersih(b.slice(m.index + m[0].length));
            for (let j = i + 1; j < baris.length && j <= i + 6; j++) {
              if (ctx.SEMUA_LABEL.test(baris[j]) && /[:|]/.test(baris[j])) break;
              if (/^[^a-z]*[A-Z]{4,}[^a-z]*$/.test(baris[j])) break; // judul bagian berikutnya (huruf kapital semua)
              v += (v ? "\n" : "") + ctx.bersih(baris[j]);
            }
            if (v.trim()) {
              hasil[key] = v.trim().slice(0, 1200);
              break;
            }
            continue;
          }
          const v = ctx.ubah(tipe, ctx.nilaiSetelahLabel(baris, i, pola));
          if (v != null && v !== "") {
            hasil[key] = v;
            break;
          }
        }
      }
    }
    // pola bebas (tanpa label)
    if (!hasil.koordinat) {
      const m = teks.match(/-\d{1,2}[.,]\d{4,}\s*[,;]\s*1\d{2}[.,]\d{4,}/);
      if (m) hasil.koordinat = m[0];
    }
    if (!hasil.daya) {
      const m = teks.match(/\b(\d{1,3}(?:[.,]\d{3})+|\d{3,6})\s*VA\b/);
      if (m) hasil.daya = ctx.angka(m[1]) / 1000;
    }
    if (!hasil.golongan) {
      const m = teks.match(/\b([RBIPS])-?([1-4])\s*\/\s*([\d.,]+\s*k?VA|TR|TM|TT)/i);
      if (m) hasil.golongan = `${m[1].toUpperCase()}-${m[2]}`;
    }
    return hasil;
  }

  Object.assign(ctx, { bacaTeksSurvey });
}

if (typeof module !== "undefined" && module.exports) module.exports = initParsersSurveyText;
