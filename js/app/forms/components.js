// Per-option product and component fields.
// Dependencies and shared state are provided through ctx.
function initAppFormsComponents(ctx) {
  function renderKomponen() {
    // komponen per opsi (tab)
    if (ctx.S.opsiAktif >= ctx.S.opsi.length) ctx.S.opsiAktif = 0;
    ctx.$("#fKomp").innerHTML = !ctx.S.opsi.length
      ? `<p class="muted">Unggah BOQ terlebih dahulu.</p>`
      : `
      <div class="tabs">${ctx.S.opsi.map((o, i) => `<button data-tab="${i}" class="${i === ctx.S.opsiAktif ? "on" : ""}">${ctx.esc(o.label)}</button>`).join("")}</div>
      ${(() => {
        const i = ctx.S.opsiAktif,
          o = ctx.S.opsi[i],
          b = `opsi.${i}.komponen`;
        const pilihan = (kat) =>
          [["", "— Tidak ada di katalog (pakai teks BOQ) —"]].concat(
            ctx.KAT.filter((p) => p.kategori === kat).map((p) => [p.id, p.nama])
          );
        const keu = (x) => {
          const c = ctx.komponenFinal(o, x);
          return `<label class="f"><span>Keunggulan (1 baris = 1 poin)</span><textarea rows="4" data-keu="${i}.${x}">${ctx.esc(c ? c.keunggulan.join("\n") : "")}</textarea></label>`;
        };
        let h = "";
        const gar = (x) => {
          const c = ctx.komponenFinal(o, x),
            dflt = c && c.produk && (c.produk.garansiProduk || c.produk.garansi);
          return ctx.inp(
            `${b}.${x}.garansi`,
            `Garansi (tahun)${!o.komponen[x].garansi && dflt ? ` — default katalog ${dflt}` : ""}`,
            "number",
            `min="0" placeholder="${dflt || ""}"`
          );
        };
        if (o.komponen.pv)
          h += `<fieldset><legend>Modul PV</legend><div class="g2">${ctx.inp(b + ".pv.qty", "Jumlah modul", "number")}${ctx.inp(b + ".pv.wp", "Daya per modul (Wp)", "number")}</div>${gar("pv")}${ctx.sel(b + ".pv.produkId", "Produk katalog", pilihan("pv"))}${keu("pv")}</fieldset>`;
        else h += `<button class="add" data-add="${i}.pv">+ Tambah Modul PV manual</button>`;
        if (o.komponen.inverter)
          h += `<fieldset><legend>Inverter</legend><div class="g2">${ctx.inp(b + ".inverter.qty", "Jumlah", "number")}${ctx.inp(b + ".inverter.kw", "Daya per unit (kW)", "number", 'step="any"')}</div>${gar("inverter")}${ctx.sel(b + ".inverter.produkId", "Produk katalog", pilihan("inverter"))}${keu("inverter")}</fieldset>`;
        if (o.komponen.baterai)
          h += `<fieldset><legend>Baterai</legend><div class="g2">${ctx.inp(b + ".baterai.qty", "Jumlah", "number")}${ctx.inp(b + ".baterai.kwh", "Kapasitas per unit (kWh, bila tidak di katalog)", "number", 'step="any"')}</div>${gar("baterai")}${ctx.sel(b + ".baterai.produkId", "Produk katalog", pilihan("baterai"))}
          <div class="g2">${ctx.inp(`opsi.${i}.tahunGantiBaterai`, "Ganti baterai di tahun ke- (0 = tidak)", "number")}${ctx.inp(`opsi.${i}.biayaGantiBaterai`, "Biaya ganti baterai (Rp)", "number", 'step="1000"')}</div>${keu("baterai")}</fieldset>`;
        h += `<div class="g2">${ctx.inp(`opsi.${i}.luas`, "Luas area panel (m²)", "number", 'step="any"')}${ctx.inp(`opsi.${i}.urlQuotation`, "Link quotation (Google Drive)", "url", 'placeholder="https://drive.google.com/…"')}</div>`;
        return h;
      })()}`;
  }

  Object.assign(ctx, { renderKomponen });
}
