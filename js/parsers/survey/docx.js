// Extract report text and images from Word files.
// Dependencies and shared state are provided through ctx.
function initParsersSurveyDocx(ctx) {
  async function bacaDocx(buffer) {
    const zip = ctx.root.XLSX.CFB.read(new Uint8Array(buffer), { type: "array" });
    const ambil = (path) => {
      const e = ctx.root.XLSX.CFB.find(zip, "/" + path);
      return e && e.content;
    };
    const dok = ambil("word/document.xml");
    if (!dok) throw new Error("Isi dokumen Word tidak ditemukan");
    const xml = new TextDecoder("utf-8").decode(
      dok instanceof Uint8Array ? dok : new Uint8Array(dok)
    );
    const teks = xml
      .replace(/<w:tab\/>/g, "\t")
      .replace(/<w:br[^>]*\/>/g, "\n")
      .replace(/<\/w:tc>/g, " | ")
      .replace(/<\/w:tr>/g, "\n")
      .replace(/<\/w:p>/g, "\n")
      .replace(/<[^>]+>/g, "")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
      .split("\n")
      .map((s) =>
        s
          .replace(/(\s*\|\s*)+$/, "")
          .replace(/^\s*\|\s*/, "")
          .trim()
      )
      .filter(Boolean)
      .join("\n");
    const foto = [];
    zip.FullPaths.forEach((p, i) => {
      if (/word\/media\/.+\.(jpe?g|png|webp|gif|bmp)$/i.test(p))
        foto.push({ path: p, content: zip.FileIndex[i].content });
    });
    const urut = foto.sort((a, b) => a.path.localeCompare(b.path, undefined, { numeric: true }));
    const out = [];
    for (const f of urut.slice(0, 40)) {
      const ext = f.path.split(".").pop().toLowerCase().replace("jpg", "jpeg");
      const src = await ctx.fotoDariBlob(new Blob([f.content], { type: "image/" + ext }));
      if (src) out.push({ src, ket: "Foto survey" });
    }
    return { teks, foto: out };
  }

  Object.assign(ctx, { bacaDocx });
}

if (typeof module !== "undefined" && module.exports) module.exports = initParsersSurveyDocx;
