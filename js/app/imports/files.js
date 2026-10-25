// Receive BOQ/workbook files and detect customer segment.
// Dependencies and shared state are provided through ctx.
function initAppImportsFiles(ctx) {
  async function terimaFile(files) {
    const status = ctx.$("#upStatus");
    for (const f of files) {
      status.textContent = `Membaca ${f.name}…`;
      try {
        const hb =
          ctx.PBE && /\.(xlsx|xlsm|xls)$/i.test(f.name) ? await ctx.PBE.bacaWorkbook(f) : null;
        if (hb) {
          const o = await ctx.terimaBerlin(hb, status, f.name);
          status.textContent = `✓ ${f.name}: LHS + BOQ terbaca — ${o.item.length} item, total ${ctx.K.rp(o.total)}${o.peringatan.length ? ` · ${o.peringatan.length} catatan` : ""}`;
          continue;
        }
        const h = await ctx.PB.bacaFile(f, { formatTanggal: ctx.ST.formatTanggalBOQ });
        const o = ctx.opsiDariBOQ(h);
        if (!o.label) o.label = "Opsi " + String.fromCharCode(65 + ctx.S.opsi.length);
        // data pelanggan diisi dari BOQ pertama (jika masih kosong)
        const p = ctx.S.proyek;
        if (!p.lokasi) p.lokasi = h.lokasi;
        if (!p.pic) p.pic = h.pic;
        if (!p.alamat) p.alamat = h.alamat;
        if (h.tanggal && !ctx.S.opsi.length) p.tanggal = h.tanggal;
        if (h.berlakuSampai && (!p.berlaku || !ctx.S.opsi.length)) p.berlaku = h.berlakuSampai;
        if (h.peruntukan && p.segmen === "lain") p.segmen = cariSegmen(h.peruntukan);
        if (h.kontak && !ctx.S._kontakDariBOQ) {
          ctx.S.kontak = { nama: h.kontak.nama, telepon: h.kontak.telepon };
          ctx.S._kontakDariBOQ = true;
        }
        // nomor quotation sama = revisi → ganti opsi lama (pengaturan manual tetap dipakai)
        const lama = h.nomor ? ctx.S.opsi.findIndex((x) => x.nomor === h.nomor) : -1;
        if (lama >= 0) {
          const L = ctx.S.opsi[lama];
          Object.assign(o, {
            id: L.id,
            label: L.label,
            urlQuotation: L.urlQuotation,
            keunggulan: L.keunggulan,
            biayaGantiBaterai: L.biayaGantiBaterai,
            tahunGantiBaterai: L.tahunGantiBaterai
          });
          ctx.S.opsi[lama] = o;
        } else ctx.S.opsi.push(o);
        ctx.S.opsi.sort((a, b) => a.label.localeCompare(b.label));
        if (!ctx.S.rekomendasi) ctx.S.rekomendasi = o.id;
        status.textContent = `${lama >= 0 ? "↻ Diperbarui" : "✓ Terbaca"}: ${f.name} — ${h.item.length} item, total ${ctx.K.rp(h.total)}`;
      } catch (e) {
        console.error(e);
        status.textContent = `✗ Gagal membaca ${f.name}: ${e.message}`;
      }
    }
    ctx.pilihRekomendasiOtomatis();
    ctx.S.manualAlasan = false;
    ctx.S.manualPenutup = false;
    ctx.renderForm();
    ctx.jadwalPreview();
  }
  function cariSegmen(t) {
    t = (t || "").toLowerCase();
    for (const [k, v] of Object.entries(ctx.ST.segmen))
      if (t.includes(v.kata) || t.includes(k) || t.includes(v.label.toLowerCase())) return k;
    if (/rumah|house|residen/.test(t)) return "rumah";
    if (/factory|industri|plant/.test(t)) return "pabrik";
    if (/office/.test(t)) return "kantor";
    return "lain";
  }

  Object.assign(ctx, { terimaFile, cariSegmen });
}
