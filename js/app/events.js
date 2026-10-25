// Delegated form events and photo uploads.
// Dependencies and shared state are provided through ctx.
function initAppEvents(ctx) {
  // ---------------------------- EVENT ----------------------------
  document.addEventListener("input", (e) => {
    const t = e.target;
    if (t.dataset.p) {
      let v = t.type === "checkbox" ? t.checked : t.value;
      if (t.type === "number") v = v === "" ? 0 : +v;
      ctx.set(t.dataset.p, v);
      if (t.dataset.p === "pln.golongan") ctx.S._golonganManual = true;
      if (t.dataset.p === "asumsi.jamEfektif") ctx.S._pshSumber = "manual";
      if (t.dataset.p === "sales.wa" || t.dataset.p === "sales.nama")
        ctx.ingatSales(ctx.S.sales.nama, ctx.normWA(ctx.S.sales.wa));
      if (t.dataset.p === "survey.tampil") ctx.renderForm();
      if (t.dataset.p === "pln.golongan") {
        ctx.S.pln.tarif = ctx.tarifDari(v);
        const f = ctx.$('[data-p="pln.tarif"]');
        if (f) f.value = ctx.S.pln.tarif;
      }
      if (t.dataset.p === "pln.tagihan")
        ctx.$("#tagihanHint").textContent = v ? "≈ " + ctx.K.rp(v) + " / bulan" : "";
      if (/produkId|rekomendasi|jenis/.test(t.dataset.p)) {
        if (/produkId/.test(t.dataset.p)) {
          const m = t.dataset.p.match(/opsi\.(\d+)\.komponen\.(\w+)/);
          if (m) delete ctx.S.opsi[+m[1]].keunggulan[m[2]];
        }
        if (t.dataset.p === "rekomendasi" || /jenis/.test(t.dataset.p))
          ((ctx.S.manualAlasan = false), (ctx.S.manualPenutup = false));
        if (t.dataset.p === "rekomendasi") {
          ctx.S._rekManual = true;
          ctx.pilihSampulOtomatis();
        }
        ctx.renderForm();
      }
      if (/\.label$/.test(t.dataset.p)) renderTabsOnly();
      ctx.jadwalPreview();
    } else if (t.dataset.sv) {
      const k = t.dataset.sv;
      ctx.S.survey.isian[k] =
        t.dataset.num && t.value.trim() !== "" && isFinite(ctx.PB.angka(t.value))
          ? ctx.PB.angka(t.value)
          : t.value;
      ctx.jadwalPreview();
    } else if (t.dataset.rinc != null) {
      ctx.S.tampilkanRincian = t.dataset.rinc === "1";
      ctx.jadwalPreview();
    } else if (t.dataset.svket != null) {
      ctx.S.survey.foto[+t.dataset.svket].ket = t.value;
      ctx.jadwalPreview();
    } else if (t.id === "svTambah" && t.value) {
      ctx.S.survey.isian[t.value] = "";
      ctx.renderForm();
    } else if (t.dataset.keu) {
      const [i, x] = t.dataset.keu.split(".");
      ctx.S.opsi[+i].keunggulan[x] = t.value;
      ctx.jadwalPreview();
    } else if (t.id === "f_alasan") {
      ctx.S.alasanTeks = t.value;
      ctx.S.manualAlasan = true;
      ctx.jadwalPreview();
    } else if (t.id === "f_penutup") {
      ctx.S.penutupTeks = t.value;
      ctx.S.manualPenutup = true;
      ctx.jadwalPreview();
    }
  });
  function renderTabsOnly() {
    ctx.$$("#fKomp .tabs button").forEach((b, i) => (b.textContent = ctx.S.opsi[i].label));
  }

  document.addEventListener("click", (e) => {
    const t = e.target;
    if (t.dataset.del != null) {
      if (confirm(`Hapus ${ctx.S.opsi[+t.dataset.del].label}?`)) {
        ctx.S.opsi.splice(+t.dataset.del, 1);
        ctx.pilihRekomendasiOtomatis();
        ctx.renderForm();
        ctx.jadwalPreview();
      }
    }
    if (t.dataset.tab != null) {
      ctx.S.opsiAktif = +t.dataset.tab;
      ctx.renderForm();
    }
    if (t.dataset.add) {
      const [i, x] = t.dataset.add.split(".");
      ctx.S.opsi[+i].komponen[x] = { qty: 0, wp: 550, uraian: "Modul PV", produkId: "" };
      ctx.renderForm();
    }
    if (t.dataset.rst) {
      e.preventDefault();
      if (t.dataset.rst === "alasan") ctx.S.manualAlasan = false;
      else ctx.S.manualPenutup = false;
      ctx.preview();
      ctx.renderForm();
    }
    if (t.dataset.svdel) {
      e.preventDefault();
      delete ctx.S.survey.isian[t.dataset.svdel];
      ctx.renderForm();
      ctx.jadwalPreview();
    }
    if (t.dataset.svtampil != null) {
      const f = ctx.S.survey.foto[+t.dataset.svtampil];
      f.tampil = !f.tampil;
      ctx.renderForm();
      ctx.jadwalPreview();
    }
    if (t.dataset.svsampul != null) {
      const src = ctx.S.survey.foto[+t.dataset.svsampul].src;
      ctx.S.proyek.foto = src;
      ctx.S.proyek._fotoOtomatis = false;
      ctx.rasioGambar(src).then((r) => {
        ctx.S.proyek.fotoRasio = r;
        ctx.renderForm();
        ctx.jadwalPreview();
      });
    }
    if (t.id === "sampulOtomatis") {
      ctx.S.proyek._fotoOtomatis = true;
      ctx.S.proyek.foto = null;
      ctx.pilihSampulOtomatis();
      ctx.renderForm();
      ctx.jadwalPreview();
    }
    if (t.dataset.svhapus != null) {
      ctx.S.survey.foto.splice(+t.dataset.svhapus, 1);
      ctx.renderForm();
      ctx.jadwalPreview();
    }
    if (t.id === "svTerapkan") {
      const v = ctx.S.survey.isian;
      ["lokasi", "pic", "alamat"].forEach((k) => {
        if (v[k]) ctx.S.proyek[k] = "";
      });
      if (v.idPelanggan) ctx.S.pln.idPelanggan = "";
      if (typeof v.daya === "number") ctx.S.pln.kva = 0;
      if (typeof v.tagihan === "number" || typeof v.pemakaian === "number") ctx.S.pln.tagihan = 0;
      ctx.S._golonganManual = false;
      ctx.terapkanSurvey(v);
      ctx.renderForm();
      ctx.jadwalPreview();
    }
    if (t.id === "svReset") {
      if (confirm("Hapus semua data & foto survey?")) {
        ctx.S.survey = ctx.surveyBaru();
        ctx.$("#svStatus").textContent = "";
        ctx.renderForm();
        ctx.jadwalPreview();
      }
    }
    if (t.id === "hapusFoto") {
      ctx.S.proyek.foto = null;
      ctx.S.proyek._fotoOtomatis = false;
      ctx.renderForm();
      ctx.jadwalPreview();
    }
    const h = t.closest(".sec > h3");
    if (h) h.parentElement.classList.toggle("closed");
  });
  document.addEventListener("change", async (e) => {
    if (e.target.id === "foto" && e.target.files[0]) {
      ctx.S.proyek.foto = await kecilkanFoto(e.target.files[0]);
      ctx.S.proyek._fotoOtomatis = false;
      ctx.S.proyek.fotoRasio = await ctx.rasioGambar(ctx.S.proyek.foto);
      ctx.renderForm();
      ctx.jadwalPreview();
    }
  });

  function kecilkanFoto(file) {
    return new Promise((res, rej) => {
      const img = new Image();
      img.onload = () => {
        const w = Math.min(1800, img.width),
          h = Math.round((img.height * w) / img.width);
        const c = document.createElement("canvas");
        c.width = w;
        c.height = h;
        c.getContext("2d").drawImage(img, 0, 0, w, h);
        res(c.toDataURL("image/jpeg", 0.8));
        URL.revokeObjectURL(img.src);
      };
      img.onerror = rej;
      img.src = URL.createObjectURL(file);
    });
  }

  Object.assign(ctx, { renderTabsOnly, kecilkanFoto });
}
