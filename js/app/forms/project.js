// Sales, project, customer and PLN fields.
// Dependencies and shared state are provided through ctx.
function initAppFormsProject(ctx) {
  function renderDataProyek() {
    // sales PIC, PSH, isi proposal
    const opsiProd = ctx.S.opsi.filter((o) => o.produksiImg).length;
    ctx.$("#fSales").innerHTML = `
      <div class="g2">${ctx.inp("sales.nama", "Nama sales PIC", "text", ctx.S.sales.kunci ? "readonly" : "")}${ctx.inp("sales.wa", "No. WhatsApp sales", "tel", 'placeholder="08xx / 628xx"' + (ctx.S.sales.kunci ? " readonly" : ""))}</div>
      ${ctx.S.sales.kunci ? `<div class="hint">Akun mitra${ctx.S.sales.mitra ? " " + ctx.esc(ctx.S.sales.mitra) : ""}: Sales PIC otomatis memakai profil Anda.</div>` : ""}
      <div class="hint">${ctx.S.sales.kunci ? (ctx.S.sales.wa ? "" : "Nomor WhatsApp Anda belum ada di profil — minta admin mengisinya di data/akses.js.") : ctx.S.sales.nama ? (ctx.S.sales.wa ? `✓ Tampil di halaman penutup & tombol WhatsApp → wa.me/${ctx.esc(ctx.normWA(ctx.S.sales.wa))}` : "Isi nomor WA sekali — akan diingat untuk proposal berikutnya dari sales yang sama.") : "Nama diambil otomatis dari kolom Marketing/PIC di sheet DB LHS."}</div>
      <fieldset><legend>PSH (Peak Sun Hour)</legend>
        <div class="g2">${ctx.inp("asumsi.jamEfektif", "PSH — jam matahari efektif / hari", "number", 'step="0.01" min="1" max="6"')}<div class="f"><span>&nbsp;</span><div class="hint" style="color:${ctx.S._pshSumber === "lhs" ? "var(--g7)" : "#B45309"}">${ctx.S._pshSumber === "lhs" ? `Otomatis dari proyeksi produksi di LHS${opsiProd ? " (PVWatts)" : ""}. Boleh diubah.` : "LHS tidak melampirkan proyeksi produksi (NREL/PVWatts/Helioscope) — isi PSH lokasi."}</div></div></div>
      </fieldset>
      <fieldset><legend>Rincian item pekerjaan & material (BOQ)</legend>
        <label class="ck"><input type="radio" name="rinc" data-rinc="1" ${ctx.S.tampilkanRincian ? "checked" : ""}> Berikan ke pelanggan (halaman Lampiran — Rincian BOQ)</label>
        <label class="ck"><input type="radio" name="rinc" data-rinc="0" ${!ctx.S.tampilkanRincian ? "checked" : ""}> Jangan berikan (pelanggan hanya melihat ringkasan Quotation)</label>
      </fieldset>`;

    // pelanggan & PLN
    ctx.$("#fPelanggan").innerHTML = `
      ${ctx.inp("proyek.lokasi", "Nama lokasi / proyek")}
      ${ctx.inp("proyek.pic", "Nama pelanggan / PIC")}
      <label class="f"><span>Alamat</span><textarea data-p="proyek.alamat" rows="2">${ctx.esc(ctx.S.proyek.alamat)}</textarea></label>
      <div class="g2">${ctx.sel(
        "proyek.segmen",
        "Peruntukan",
        Object.entries(ctx.ST.segmen).map(([k, v]) => [k, v.label])
      )}${ctx.inp("proyek.tanggal", "Tanggal proposal", "date")}</div>
      <div class="g2">${ctx.inp("proyek.berlaku", "Berlaku sampai", "date")}<label class="f"><span>Foto sampul (drone/lokasi)</span><input type="file" id="foto" accept="image/*"></label></div>
      ${ctx.S.proyek.foto ? `<div class="thumb"><img src="${ctx.S.proyek.foto}"><span class="muted">${ctx.S.proyek._fotoOtomatis ? "Otomatis: foto drone + layout PV" : "Pilihan manual"}</span><button class="x" id="hapusFoto">Hapus</button></div>` : ""}
      ${ctx.S.opsi.some((o) => o.layoutSampul) && !ctx.S.proyek._fotoOtomatis ? `<button class="add" id="sampulOtomatis">↺ Pakai foto drone + layout PV sebagai sampul</button>` : ""}`;
    ctx.$("#fPLN").innerHTML = `
      <div class="g2">${ctx.inp("pln.idPelanggan", "ID pelanggan PLN")}${ctx.sel(
        "pln.golongan",
        "Golongan tarif",
        ctx.ST.tarifPLN.map((t) => [t.kode, t.label])
      )}</div>
      <div class="g2">${ctx.inp("pln.kva", "Daya terpasang (kVA)", "number", 'step="any" min="0"')}${ctx.inp("pln.fase", "Fasa (mis. 3 Fasa)")}</div>
      <div class="g2">${ctx.inp("pln.kwh", "Pemakaian / bulan (kWh)", "number", 'step="any" min="0"')}${ctx.inp("pln.tagihan", "Tagihan rata-rata / bulan (Rp)", "number", 'step="1000" min="0"')}</div>
      <div class="g2">${ctx.inp("pln.tarif", "Tarif rata-rata per kWh (Rp)", "number", 'step="any" min="0"')}${ctx.inp("pln.idCatatan", "Keterangan bila ID PLN kosong")}</div>
      ${ctx.chk("pln.pascabayar", "Kurangi rekening minimum 40 jam nyala (metode lama)")}
      <div class="hint" id="tagihanHint">${ctx.S.pln.tagihan ? "≈ " + ctx.K.rp(ctx.S.pln.tagihan) + " / bulan" : ""}</div>`;
  }

  Object.assign(ctx, { renderDataProyek });
}
