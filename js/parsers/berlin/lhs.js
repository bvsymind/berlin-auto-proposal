// Read the Berlin LHS survey worksheet.
// Dependencies and shared state are provided through ctx.
function initParsersBerlinLhs(ctx) {
  // ---------------------------- LHS ----------------------------
  function bacaLHS(g) {
    const L = {};
    const lbl = (re) => ctx.cari(g, re);
    L.client = ctx.S(ctx.bawah(g, lbl(/^nama\s*client/i)));
    L.lokasi = ctx.S(ctx.bawah(g, lbl(/^lokasi\s*:?$/i)));
    L.tanggal = ctx.S(ctx.bawah(g, lbl(/^tanggal\s*:?$/i)));
    L.nomor = ctx.S(ctx.kanan(g, lbl(/^no\s*:?$/i), 1, 2));
    L.surveyor = ctx.S(ctx.bawah(g, lbl(/^surveyor/i)));
    L.checker = ctx.S(ctx.bawah(g, lbl(/^checker/i)));
    L.reviewer = ctx.S(ctx.bawah(g, lbl(/^reviewer/i)));
    const nt = lbl(/^notes?\s*:?$/i);
    L.catatan = ctx.S(String(ctx.bawah(g, nt) || "").replace(/https?:\/\/\S+/g, ""));
    const lf = lbl(/^link\s*:?$/i);
    L.linkForm = ctx.urlDi(ctx.kanan(g, lf, 1, 3));
    // judul sistem, mis. "PLTS Hybrid - 9450Wp - 10240Wh"
    for (const r of g)
      for (const c of r)
        if (typeof c === "string" && /^PLTS\s.+\d+\s*Wp/i.test(c.trim())) {
          L.judul = ctx.S(c);
          break;
        }

    // bagian I–III: pasangan label (kolom B) : nilai (kolom F) — disimpan apa adanya
    const bagian = [];
    let cur = null;
    for (let r = 0; r < g.length; r++) {
      const a = ctx.S(ctx.sel(g, r, 1));
      const m = a.match(/^([IVX]+)\.\s*(.+)$/);
      if (m) {
        cur = { no: m[1], judul: m[2], baris: [], r };
        bagian.push(cur);
        continue;
      }
      if (!cur || !a) continue;
      const v = ctx.kanan(g, { r, c: 1 }, 1, 4);
      cur.baris.push({ label: a, nilai: v, r });
    }
    L.bagian = bagian;
    const isi = (re) => {
      for (const b of bagian) for (const x of b.baris) if (re.test(x.label)) return x.nilai;
      return "";
    };
    L.jenisBangunan = ctx.S(isi(/jenis\s*bangunan|fungsi\s*bangunan/i));
    L.lantai = ctx.S(isi(/lantai|tingkat/i));
    L.koordinat = ctx.S(isi(/koordinat/i));
    L.orientasi = isi(/orientasi/i);
    L.kemiringan = isi(/kemiringan/i);
    L.sekitar = ctx.S(isi(/kondisi\s*disekitar|kondisi\s*sekitar|bayangan|shading/i));
    L.pemberiInfo = ctx.S(isi(/pelanggan\s*yang\s*memberikan/i));
    L.golongan = ctx.S(isi(/golongan/i));
    L.daya = ctx.S(isi(/daya\s*listrik|daya\s*terpasang/i));
    L.idPLN = ctx.S(isi(/id\s*pelanggan|no\s*id/i));
    L.kwh = ctx.N(isi(/pemakaian\s*listrik/i));
    L.tagihan = ctx.N(isi(/tagihan\s*listrik/i));
    L.tarif = ctx.N(isi(/^tarif/i));

    // gambar: baris berisi URL, keterangan di sel kanan ("<---satelit")
    const fotoBagian = (re) => bagian.find((b) => re.test(b.judul));
    L.foto = [];
    const ambilURL = (b, jenis) => {
      if (!b) return;
      const sampai = (bagian[bagian.indexOf(b) + 1] || { r: g.length }).r;
      for (let r = b.r + 1; r < sampai; r++) {
        if (/^lampiran/i.test(ctx.S(ctx.sel(g, r, 1)))) break; // link datasheet bukan foto
        const u = ctx.urlDi(ctx.sel(g, r, 1));
        if (!u) continue;
        let ket = "";
        for (let c = 2; c < 12; c++) {
          const t = ctx.S(ctx.sel(g, r, c));
          if (/<-+/.test(t)) {
            ket = t.replace(/<-+\s*/, "");
            break;
          }
        }
        L.foto.push({ url: u, id: ctx.idDrive(u), jenis, ket });
      }
    };
    ambilURL(fotoBagian(/informasi\s*beban|tagihan\s*listrik/i), "tagihan");
    ambilURL(fotoBagian(/diagram/i), "diagram");
    ambilURL(fotoBagian(/gambar\s*perencanaan/i), "perencanaan");
    const prod = fotoBagian(/proyeksi\s*produksi/i);
    if (prod) {
      for (let r = prod.r + 1; r < prod.r + 6; r++) {
        const v = ctx.sel(g, r, 1);
        if (ctx.urlDi(v))
          L.foto.push({
            url: ctx.urlDi(v),
            id: ctx.idDrive(ctx.urlDi(v)),
            jenis: "produksi",
            ket: "Proyeksi produksi (PVWatts®, NREL)"
          });
        else if (typeof v === "number") {
          if (v > 50 && !L.produksiTahunan) L.produksiTahunan = v;
          else if (v > 0 && v < 10) L.psh = v;
        }
      }
    }
    ambilURL(fotoBagian(/contoh\s*pemasangan/i), "contoh");
    ambilURL(fotoBagian(/contoh\s*monitoring/i), "monitoring");
    // keterangan default
    L.foto.forEach((f) => {
      const k = f.ket.toLowerCase();
      f.ket = /satelit/.test(k)
        ? "Citra satelit lokasi"
        : /atap\s*1/.test(k)
          ? "Foto atap (drone) — 1"
          : /atap\s*2/.test(k)
            ? "Foto atap (drone) — 2"
            : /konfigurasi/.test(k)
              ? "Konfigurasi & layout panel surya"
              : /panel\s*listrik/.test(k)
                ? "Panel listrik (MCB) eksisting"
                : /lokasi\s*inverter/.test(k)
                  ? "Rencana lokasi inverter & baterai"
                  : /kw\s*h?\s*meter|kwmeter/.test(k)
                    ? "kWh meter PLN"
                    : f.jenis === "diagram"
                      ? "Gambar teknik — layout & konfigurasi PLTS"
                      : f.jenis === "tagihan"
                        ? "Tagihan / beban listrik PLN"
                        : f.ket || "Dokumentasi survey";
      f.peran = /satelit/.test(k)
        ? "satelit"
        : /atap/.test(k)
          ? "atap"
          : /konfigurasi/.test(k) || f.jenis === "diagram"
            ? "layout"
            : f.jenis === "produksi"
              ? "produksi"
              : "survey";
    });
    // duplikat (diagram = konfigurasi panel biasanya file yang sama)
    const lihat = new Set();
    L.foto = L.foto.filter((f) => {
      const k = f.id || f.url;
      if (lihat.has(k)) return false;
      lihat.add(k);
      return true;
    });

    // Lampiran (datasheet): "Lampiran 1" lalu URL di baris bawahnya
    L.lampiran = {};
    for (let r = 0; r < g.length; r++) {
      const t = ctx.S(ctx.sel(g, r, 1));
      const m = t.match(/^lampiran\s*(\d+\w?)$/i);
      if (m) {
        for (let k = r + 1; k < r + 3; k++) {
          const u = ctx.urlDi(ctx.sel(g, k, 1));
          if (u) {
            L.lampiran[m[1]] = u;
            break;
          }
        }
      }
    }

    // Spesifikasi & konfigurasi (bagian VI)
    const vi = bagian.find((b) => /spesifikasi/i.test(b.judul));
    L.spek = {};
    L.konfig = {};
    L.material = [];
    if (vi) {
      let mode = "spek",
        grup = null;
      vi.baris.forEach((x) => {
        const lab = x.label,
          v = x.nilai;
        if (/^spesifikasi$/i.test(lab)) {
          mode = "spek";
          return;
        }
        if (/^konfigurasi$/i.test(lab)) {
          mode = "konfig";
          return;
        }
        if (/^material\s*instalasi$/i.test(lab)) {
          mode = "material";
          return;
        }
        if (mode === "material") {
          L.material.push(lab);
          return;
        }
        if (ctx.S(v) === "" && /^(panel\s*surya|inverter|baterai|battery)$/i.test(lab)) {
          grup = /panel/i.test(lab) ? "pv" : /inverter/i.test(lab) ? "inverter" : "baterai";
          return;
        }
        if (!grup || !/[0-9a-z]/i.test(ctx.S(v))) return; // kosong / " x  x " diabaikan
        const tgt = mode === "spek" ? L.spek : L.konfig;
        (tgt[grup] = tgt[grup] || []).push([lab, v]);
      });
    }
    const sp = (grup, re) => {
      const r = (L.spek[grup] || []).find((x) => re.test(x[0]));
      return r ? r[1] : "";
    };
    const kf = (grup, re) => {
      const r = (L.konfig[grup] || []).find((x) => re.test(x[0]));
      return r ? r[1] : "";
    };
    const lamp = (v) => {
      const m = ctx.S(v).match(/lampiran\s*(\d+\w?)/i);
      return m ? L.lampiran[m[1]] || "" : "";
    };
    L.komponen = {};
    if (L.spek.pv)
      L.komponen.pv = {
        merek: ctx.S(sp("pv", /produser/i)).replace(/_/g, " "),
        model: ctx.S(sp("pv", /model/i)),
        jenisSel: ctx.S(sp("pv", /jenis/i)),
        wp: ctx.N(sp("pv", /rating\s*daya/i)),
        garansi: ctx.N(sp("pv", /garansi|warranty/i)),
        qty: ctx.N(kf("pv", /total\s*panel/i)),
        luas: ctx.N(kf("pv", /luas/i)),
        datasheet: lamp(sp("pv", /detail/i))
      };
    if (L.spek.inverter)
      L.komponen.inverter = {
        merek: ctx.S(sp("inverter", /produser/i)).replace(/_/g, " "),
        model: ctx.S(sp("inverter", /model/i)),
        jenisInv: ctx.S(sp("inverter", /jenis/i)),
        dayaTeks: ctx.S(sp("inverter", /rating\s*daya/i)),
        garansi: ctx.N(sp("inverter", /garansi|warranty/i)),
        qty: ctx.N(kf("inverter", /total\s*inverter/i)) || 1,
        kwTotal: ctx.N(kf("inverter", /total\s*daya/i)) / 1000,
        datasheet: lamp(sp("inverter", /detail/i))
      };
    // baterai dianggap ada hanya bila jumlah & kapasitas total di Konfigurasi > 0 (opsi On-Grid biasanya 0 / kosong)
    const qBat = ctx.N(kf("baterai", /total\s*baterai/i)),
      whBat = ctx.N(kf("baterai", /total\s*kapasitas/i));
    const adaBat =
      L.spek.baterai &&
      !(qBat === 0 || whBat === 0) &&
      !(isNaN(qBat) && isNaN(whBat) && !ctx.N(sp("baterai", /kapasitas/i)));
    if (adaBat)
      L.komponen.baterai = {
        merek: ctx.S(sp("baterai", /produser/i)).replace(/_/g, " "),
        model: ctx.S(sp("baterai", /model/i)),
        jenisBat: ctx.S(sp("baterai", /jenis/i)),
        wh: ctx.N(sp("baterai", /kapasitas/i)),
        siklus: ctx.N(sp("baterai", /cycle/i)),
        garansi: ctx.N(sp("baterai", /garansi|warranty/i)),
        qty: ctx.N(kf("baterai", /total\s*baterai/i)) || 1,
        whTotal: ctx.N(kf("baterai", /total\s*kapasitas/i)),
        datasheet: lamp(sp("baterai", /detail/i))
      };
    return L;
  }

  Object.assign(ctx, { bacaLHS });
}

if (typeof module !== "undefined" && module.exports) module.exports = initParsersBerlinLhs;
