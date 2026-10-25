// Berlin worksheet label lookup and Google Drive links.
// Dependencies and shared state are provided through ctx.
function initParsersBerlinWorksheet(ctx) {
  const PB = ctx.root.ParserBOQ;
  const S = (v) => (v == null ? "" : String(v)).replace(/\s+/g, " ").trim();
  const N = (v) => (typeof v === "number" ? v : PB.angka(v));

  function grid(ws) {
    return ctx.root.XLSX.utils.sheet_to_json(ws, { header: 1, raw: true, defval: "" }).map((r) =>
      r.map((c) => {
        if (!(c instanceof Date)) return c;
        const d = new Date(c.getTime() + 12 * 3600e3);
        /* aman terhadap selisih zona waktu */ return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      })
    );
  }
  function cari(g, pola, maxKol = 40) {
    for (let r = 0; r < g.length; r++)
      for (let c = 0; c < Math.min(maxKol, (g[r] || []).length); c++)
        if (typeof g[r][c] === "string" && pola.test(g[r][c].trim())) return { r, c };
    return null;
  }
  const sel = (g, r, c) => (g[r] || [])[c];
  const kanan = (g, p, dari = 1, sampai = 12) => {
    if (!p) return "";
    for (let c = p.c + dari; c <= p.c + sampai; c++) {
      const v = sel(g, p.r, c);
      if (S(v) !== "") return v;
    }
    return "";
  };
  const bawah = (g, p) => (p ? sel(g, p.r + 1, p.c) : "");
  const urlDi = (v) => {
    const m = S(v).match(/https?:\/\/\S+/);
    return m ? m[0] : "";
  };
  // id Google Drive dari link open?id= / file/d/…
  function idDrive(u) {
    const m = String(u || "").match(/(?:id=|\/d\/)([\w-]{20,})/);
    return m ? m[1] : "";
  }

  Object.assign(ctx, { PB, S, N, grid, cari, sel, kanan, bawah, urlDi, idDrive });
}

if (typeof module !== "undefined" && module.exports) module.exports = initParsersBerlinWorksheet;
