// Read PDF and spreadsheet files.
// Dependencies and shared state are provided through ctx.
function initParsersBoqFiles(ctx) {
  // -------------------------------------------------------------------
  // Ekstraksi teks dari file (browser)
  // -------------------------------------------------------------------
  async function teksDariPDF(buffer) {
    const pdf = await ctx.root.pdfjsLib.getDocument({ data: buffer }).promise;
    let out = [];
    for (let p = 1; p <= pdf.numPages; p++) {
      const page = await pdf.getPage(p);
      const c = await page.getTextContent();
      const baris = [];
      for (const it of c.items) {
        if (!it.str || !it.str.trim()) continue;
        const y = it.transform[5],
          x = it.transform[4];
        let b = baris.find((b) => Math.abs(b.y - y) < 3);
        if (!b) {
          b = { y, isi: [] };
          baris.push(b);
        }
        b.isi.push({ x, s: it.str });
      }
      baris.sort((a, b) => b.y - a.y);
      out.push(
        baris
          .map((b) =>
            b.isi
              .sort((a, c) => a.x - c.x)
              .map((i) => i.s)
              .join(" ")
          )
          .join("\n")
      );
    }
    return out.join("\n");
  }

  function barisDariExcel(buffer) {
    const wb = ctx.root.XLSX.read(buffer, { type: "array", cellDates: true });
    // pilih sheet yang paling mirip quotation
    let terbaik = wb.SheetNames[0],
      skor = -1;
    for (const n of wb.SheetNames) {
      const rows = ctx.root.XLSX.utils.sheet_to_json(wb.Sheets[n], {
        header: 1,
        raw: true,
        defval: ""
      });
      const t = rows
        .slice(0, 80)
        .map((r) => r.join(" "))
        .join(" ");
      const s =
        (/quot|penawaran|boq|bill of/i.test(n + t) ? 3 : 0) +
        (/qty/i.test(t) ? 2 : 0) +
        (/total/i.test(t) ? 1 : 0);
      if (s > skor) {
        skor = s;
        terbaik = n;
      }
    }
    const rows = ctx.root.XLSX.utils
      .sheet_to_json(wb.Sheets[terbaik], { header: 1, raw: true, defval: "" })
      .map((r) =>
        r.map((c) =>
          c instanceof Date
            ? `${c.getFullYear()}-${String(c.getMonth() + 1).padStart(2, "0")}-${String(c.getDate()).padStart(2, "0")}`
            : c
        )
      );
    return { rows, sheet: terbaik };
  }

  async function bacaFile(file, opsi = {}) {
    const buf = await file.arrayBuffer();
    const nama = file.name.toLowerCase();
    if (nama.endsWith(".pdf")) {
      const teks = await teksDariPDF(new Uint8Array(buf));
      return Object.assign(ctx.bacaTeks(teks, opsi), { sumber: file.name, teksMentah: teks });
    }
    if (/\.(xlsx|xlsm|xls|csv|ods)$/.test(nama)) {
      const { rows, sheet } = barisDariExcel(buf);
      const teks = rows
        .map((r) => r.filter((c) => c !== "" && c !== null).join(" "))
        .filter(Boolean)
        .join("\n");
      const itemExcel = ctx.itemDariBaris(rows);
      return Object.assign(ctx.bacaTeks(teks, Object.assign({}, opsi, { itemExcel })), {
        sumber: `${file.name} (sheet: ${sheet})`,
        teksMentah: teks
      });
    }
    throw new Error("Format file belum didukung: " + file.name + " (gunakan PDF, XLSX, atau CSV)");
  }

  Object.assign(ctx, { teksDariPDF, barisDariExcel, bacaFile });
}

if (typeof module !== "undefined" && module.exports) module.exports = initParsersBoqFiles;
