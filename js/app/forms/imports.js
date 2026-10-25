// Uploaded option cards and survey fields.
// Dependencies and shared state are provided through ctx.
function initAppFormsImports(ctx) {
  function renderOpsiSurvey() {
    // daftar opsi BOQ
    ctx.$("#opsiList").innerHTML =
      ctx.S.opsi
        .map(
          (o, i) => `
      <div class="oc">
        <div class="oc-h"><input class="oc-l" data-p="opsi.${i}.label" value="${ctx.esc(o.label)}"><select data-p="opsi.${i}.jenis">${Object.entries(
          ctx.ST.namaSistem
        )
          .map(([k, v]) => `<option value="${k}" ${o.jenis === k ? "selected" : ""}>${v}</option>`)
          .join("")}</select><button class="x" data-del="${i}" title="Hapus opsi">✕</button></div>
        <div class="oc-m"><b>${ctx.K.rp(o.total)}</b> · ${o.item.length} item · ${ctx.esc(o.nomor || "tanpa nomor")}</div>
        <div class="oc-s">${ctx.esc(o.sumber || "")}</div>
        ${o.peringatan.length ? `<div class="oc-w">${o.peringatan.map((p) => `<div>⚠ ${ctx.esc(p)}</div>`).join("")}</div>` : `<div class="oc-ok">✓ Item & total cocok</div>`}
        <details><summary>Lihat item terbaca</summary><table class="mini">${o.item.map((it) => `<tr><td>${it.no}</td><td>${ctx.esc(it.uraian)}</td><td>${ctx.K.num(it.qty, it.qty % 1 ? 2 : 0)} ${ctx.esc(it.satuan)}</td><td>${ctx.K.num(it.total)}</td></tr>`).join("")}</table></details>
      </div>`
        )
        .join("") ||
      `<p class="muted">Belum ada BOQ. Satu file = satu opsi (mis. Opsi A Hybrid, Opsi B On Grid).</p>`;

    // laporan survey
    const sv = ctx.S.survey;
    const adaIsi = Object.keys(sv.isian).length || sv.foto.length;
    const belum = ctx.PS.FIELD.filter((f) => sv.isian[f[0]] == null);
    ctx.$("#fSurvey").innerHTML = !adaIsi
      ? `<p class="muted">Belum ada laporan survey. Data atap, kondisi lokasi, catatan surveyor, dan foto akan otomatis masuk ke proposal.</p>`
      : `
      ${sv.sumber.length ? `<div class="oc-s">Sumber: ${ctx.esc(sv.sumber.join(", "))}</div>` : ""}
      ${ctx.chk("survey.tampil", "Tampilkan bagian “Hasil Survey Lokasi” di proposal")}
      <fieldset><legend>Isian terbaca (bisa diedit)</legend>
        ${ctx.PS.FIELD.filter((f) => sv.isian[f[0]] != null)
          .map((f) =>
            f[3] === "panjang"
              ? `<label class="f"><span>${ctx.esc(f[1])} <a href="#" class="rst" data-svdel="${f[0]}">hapus</a></span><textarea rows="3" data-sv="${f[0]}">${ctx.esc(sv.isian[f[0]])}</textarea></label>`
              : `<div class="svf"><span>${ctx.esc(f[1])}</span><input data-sv="${f[0]}" data-num="${typeof sv.isian[f[0]] === "number" ? 1 : ""}" value="${ctx.esc(sv.isian[f[0]])}"><button class="x" data-svdel="${f[0]}" title="Hapus isian">✕</button></div>`
          )
          .join("")}
        ${belum.length ? `<label class="f"><span>Tambah isian</span><select id="svTambah"><option value="">— pilih —</option>${belum.map((f) => `<option value="${f[0]}">${ctx.esc(f[1])}</option>`).join("")}</select></label>` : ""}
        <button class="add" id="svTerapkan" title="Salin nama, alamat, ID pelanggan, golongan, daya, tagihan dari survey">↻ Terapkan ke Data Pelanggan & PLN</button>
      </fieldset>
      ${
        sv.foto.length
          ? `<fieldset><legend>Foto survey (${sv.foto.filter((f) => f.tampil).length}/${sv.foto.length} tampil)</legend>
        <div class="svp">${sv.foto.map((f, i) => `<figure class="${f.tampil ? "" : "off"}"><img src="${f.src}" alt=""><div class="tb2"><button data-svtampil="${i}" class="${f.tampil ? "on" : ""}" title="Tampilkan di proposal">${f.tampil ? "✓" : "–"}</button><button data-svsampul="${i}" title="Jadikan foto sampul">Sampul</button><button data-svhapus="${i}" title="Hapus foto">✕</button></div><input type="text" data-svket="${i}" value="${ctx.esc(f.ket)}" placeholder="Keterangan foto"></figure>`).join("")}</div></fieldset>`
          : ""
      }
      <button class="add" id="svReset" style="border-color:#B91C1C;color:#B91C1C;background:#FEF2F2">Hapus semua data survey</button>`;
  }

  Object.assign(ctx, { renderOpsiSurvey });
}
