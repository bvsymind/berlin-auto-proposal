// Read report files and spreadsheet survey responses.
// Dependencies and shared state are provided through ctx.
function initParsersSurveyFiles(ctx) {
  function teksDariBarisExcel(rows) {
    rows = rows.filter((r) => r.some((c) => c !== "" && c != null));
    if (!rows.length) return "";
    // Ekspor Google Form: baris 1 = pertanyaan, baris berikut = jawaban → pakai jawaban terakhir
    const kepala = rows[0].map((c) => String(c ?? "").trim());
    const lebar = kepala.filter(Boolean).length;
    if (
      rows.length >= 2 &&
      lebar >= 5 &&
      kepala.filter((c) => ctx.SEMUA_LABEL.test(c)).length >= 3
    ) {
      const isi = rows[rows.length - 1];
      return kepala
        .map((k, i) => (k && isi[i] !== "" && isi[i] != null ? `${k} : ${isi[i]}` : ""))
        .filter(Boolean)
        .join("\n");
    }
    // Formulir biasa: Label | Nilai per baris
    return rows
      .map((r) =>
        r
          .map((c) => String(c ?? "").trim())
          .filter(Boolean)
          .join(" | ")
      )
      .join("\n");
  }

  // Membaca satu file laporan survey → { teks, foto[], sumber }
  async function bacaFileSurvey(file) {
    const nama = file.name.toLowerCase();
    if (/\.(jpe?g|png|webp|gif|bmp)$/.test(nama) || /^image\//.test(file.type)) {
      const src = await ctx.fotoDariBlob(file);
      if (!src)
        throw new Error("Foto tidak bisa dibaca (format HEIC belum didukung — ubah ke JPG)");
      return {
        teks: "",
        foto: [
          {
            src,
            ket: file.name
              .replace(/\.[^.]+$/, "")
              .replace(/[_-]+/g, " ")
              .replace(/^(img|dsc|pxl|photo|foto)\s*\d+.*$/i, "Foto lokasi")
          }
        ],
        sumber: file.name
      };
    }
    const buf = await file.arrayBuffer();
    if (nama.endsWith(".pdf")) {
      const teks = await ctx.PB.teksDariPDF(new Uint8Array(buf.slice(0)));
      let foto = [];
      try {
        foto = await ctx.fotoDariPDF(new Uint8Array(buf.slice(0)));
      } catch (e) {
        console.warn(e);
      }
      return { teks, foto, sumber: file.name };
    }
    if (nama.endsWith(".docx")) {
      const r = await ctx.bacaDocx(buf);
      return Object.assign(r, { sumber: file.name });
    }
    if (/\.(xlsx|xlsm|xls|csv|ods)$/.test(nama)) {
      const { rows } = ctx.PB.barisDariExcel(buf);
      return { teks: teksDariBarisExcel(rows), foto: [], sumber: file.name };
    }
    if (nama.endsWith(".txt")) return { teks: await file.text(), foto: [], sumber: file.name };
    if (nama.endsWith(".doc"))
      throw new Error("Format .doc lama belum didukung — simpan ulang sebagai .docx atau PDF");
    throw new Error("Format belum didukung: " + file.name);
  }

  Object.assign(ctx, { teksDariBarisExcel, bacaFileSurvey });
}

if (typeof module !== "undefined" && module.exports) module.exports = initParsersSurveyFiles;
