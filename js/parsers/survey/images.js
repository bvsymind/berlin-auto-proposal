// Resize images and extract photos from PDF.
// Dependencies and shared state are provided through ctx.
function initParsersSurveyImages(ctx) {
  // ------------------------- EKSTRAKSI FILE -------------------------
  function dataURLKecil(sumber, w0, h0, maks = 1400) {
    const w = Math.min(maks, w0),
      h = Math.round((h0 * w) / w0);
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    c.getContext("2d").drawImage(sumber, 0, 0, w, h);
    return c.toDataURL("image/jpeg", 0.78);
  }
  function fotoDariBlob(blob, maks = 1400) {
    return new Promise((res, rej) => {
      const img = new Image();
      img.onload = () => {
        try {
          res(
            img.width < 200 || img.height < 150
              ? null
              : dataURLKecil(img, img.width, img.height, maks)
          );
        } catch (e) {
          rej(e);
        }
        URL.revokeObjectURL(img.src);
      };
      img.onerror = () => {
        URL.revokeObjectURL(img.src);
        res(null);
      };
      img.src = URL.createObjectURL(blob);
    });
  }

  async function fotoDariPDF(buffer) {
    const lib = ctx.root.pdfjsLib,
      out = [];
    const pdf = await lib.getDocument({ data: buffer }).promise;
    for (let p = 1; p <= pdf.numPages && out.length < 40; p++) {
      const page = await pdf.getPage(p);
      const ops = await page.getOperatorList();
      const nama = [];
      ops.fnArray.forEach((fn, i) => {
        if (fn === lib.OPS.paintImageXObject || fn === lib.OPS.paintJpegXObject)
          nama.push(ops.argsArray[i][0]);
      });
      for (const n of [...new Set(nama)]) {
        try {
          const img = await new Promise((r) => {
            const o = n.startsWith("g_") ? page.commonObjs : page.objs;
            o.get(n, r);
          });
          if (!img || img.width < 200 || img.height < 150) continue;
          let src;
          if (img.bitmap) src = dataURLKecil(img.bitmap, img.width, img.height);
          else if (img.data) {
            const c = document.createElement("canvas");
            c.width = img.width;
            c.height = img.height;
            const ctx = c.getContext("2d"),
              id = ctx.createImageData(img.width, img.height),
              d = img.data,
              px = img.width * img.height;
            if (img.kind === 3) id.data.set(d.subarray(0, px * 4));
            else if (img.kind === 2)
              for (let k = 0, j = 0; k < px; k++) {
                id.data[j++] = d[k * 3];
                id.data[j++] = d[k * 3 + 1];
                id.data[j++] = d[k * 3 + 2];
                id.data[j++] = 255;
              }
            else continue;
            ctx.putImageData(id, 0, 0);
            src = dataURLKecil(c, img.width, img.height);
          }
          if (src) out.push({ src, ket: `Foto survey ${out.length + 1}` });
        } catch (e) {
          console.warn("Foto PDF dilewati", e);
        }
      }
    }
    return out;
  }

  Object.assign(ctx, { dataURLKecil, fotoDariBlob, fotoDariPDF });
}

if (typeof module !== "undefined" && module.exports) module.exports = initParsersSurveyImages;
