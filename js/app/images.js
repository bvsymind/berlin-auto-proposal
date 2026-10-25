// Image cropping, cover selection and resizing.
// Dependencies and shared state are provided through ctx.
function initAppImages(ctx) {
  // Ambil area foto udara dari gambar teknik (buang tabel & kop gambar yang berlatar putih)
  function potongFotoUdara(src) {
    return new Promise((res, rej) => {
      const img = new Image();
      img.onload = () => {
        const W = img.width,
          H = img.height,
          w = 256,
          h = Math.round((H * w) / W);
        const c = document.createElement("canvas");
        c.width = w;
        c.height = h;
        const ctx = c.getContext("2d");
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, w, h);
        const d = ctx.getImageData(0, 0, w, h).data;
        const foto = (x, y) => {
          const i = (y * w + x) * 4;
          return Math.min(d[i], d[i + 1], d[i + 2]) < 232;
        };
        const rata = (a) =>
          a.map((v, i) => {
            const s0 = Math.max(0, i - 2),
              s1 = Math.min(a.length, i + 3);
            let t = 0;
            for (let k = s0; k < s1; k++) t += a[k];
            return t / (s1 - s0);
          });
        // rentang terpanjang di atas ambang 0,5; celah pendek (≤ 8 px) di tengah area foto digabung
        const runTerpanjang = (arr) => {
          const on = rata(arr).map((v) => v > 0.5);
          for (let i = 0; i < on.length;) {
            if (on[i]) {
              i++;
              continue;
            }
            let j = i;
            while (j < on.length && !on[j]) j++;
            if (i > 0 && j < on.length && j - i <= 8) for (let k = i; k < j; k++) on[k] = true;
            i = j;
          }
          let best = [0, 0, 0],
            s0 = -1;
          on.concat([false]).forEach((v, i) => {
            if (v && s0 < 0) s0 = i;
            if (!v && s0 >= 0) {
              if (i - s0 > best[0]) best = [i - s0, s0, i];
              s0 = -1;
            }
          });
          return best;
        };
        const kol = [];
        for (let x = 0; x < w; x++) {
          let n = 0;
          for (let y = 0; y < h; y++) n += foto(x, y);
          kol.push(n / h);
        }
        const [, x0, x1] = runTerpanjang(kol);
        const bar = [];
        for (let y = 0; y < h; y++) {
          let n = 0;
          for (let x = x0; x < x1; x++) n += foto(x, y);
          bar.push(n / Math.max(1, x1 - x0));
        }
        const [, y0, y1] = runTerpanjang(bar);
        const luas = ((x1 - x0) * (y1 - y0)) / (w * h);
        if (luas < 0.15) return res({ src, rasio: H / W, utuh: true }); // tidak ada area foto udara → gambar teknik utuh
        const sx = (x0 * W) / w,
          sy = (y0 * H) / h,
          sw = ((x1 - x0) * W) / w,
          sh = ((y1 - y0) * H) / h;
        const k = Math.min(1, 1400 / sw),
          o = document.createElement("canvas");
        o.width = Math.round(sw * k);
        o.height = Math.round(sh * k);
        o.getContext("2d").drawImage(img, sx, sy, sw, sh, 0, 0, o.width, o.height);
        res({ src: o.toDataURL("image/jpeg", 0.85), rasio: sh / sw });
      };
      img.onerror = rej;
      img.src = src;
    });
  }
  function pilihSampulOtomatis() {
    if (ctx.S.proyek.foto && !ctx.S.proyek._fotoOtomatis) return; // sampul pilihan manual tidak ditimpa
    // urutan: foto udara + layout PV (hasil potong) → foto drone/atap survey → gambar teknik utuh
    const adaFoto = (x) => x.layoutSampul && !x.layoutSampul.utuh;
    const o =
      ctx.S.opsi.find((x) => x.id === ctx.S.rekomendasi && adaFoto(x)) || ctx.S.opsi.find(adaFoto);
    if (o) {
      ctx.S.proyek.foto = o.layoutSampul.src;
      ctx.S.proyek.fotoRasio = o.layoutSampul.rasio;
      ctx.S.proyek._fotoOtomatis = true;
      return;
    }
    const udara =
      ctx.S.survey.foto.find((f) => /drone|atap/i.test(f.ket)) ||
      ctx.S.survey.foto.find((f) => /satelit/i.test(f.ket));
    if (udara) {
      ctx.S.proyek.foto = udara.src;
      ctx.S.proyek.fotoRasio = 0;
      ctx.S.proyek._fotoOtomatis = true;
      return;
    }
    const g =
      ctx.S.opsi.find((x) => x.id === ctx.S.rekomendasi && x.layoutSampul) ||
      ctx.S.opsi.find((x) => x.layoutSampul);
    if (g) {
      ctx.S.proyek.foto = g.layoutSampul.src;
      ctx.S.proyek.fotoRasio = g.layoutSampul.rasio;
      ctx.S.proyek._fotoOtomatis = true;
    }
  }
  function rasioGambar(src) {
    return new Promise((r) => {
      const i = new Image();
      i.onload = () => r(i.height / i.width);
      i.onerror = () => r(0);
      i.src = src;
    });
  }

  Object.assign(ctx, { potongFotoUdara, pilihSampulOtomatis, rasioGambar });
}
