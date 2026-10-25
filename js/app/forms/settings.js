// Calculation assumptions, recommendation and closing fields.
// Dependencies and shared state are provided through ctx.
function initAppFormsSettings(ctx) {
  function renderPengaturanProposal() {
    // asumsi
    const a = "asumsi";
    ctx.$("#fAsumsi").innerHTML = `
      <div class="g2">${ctx.inp(a + ".jamEfektif", "Jam produksi efektif / hari", "number", 'step="0.1"')}${ctx.inp(a + ".kenaikanTarif", "Kenaikan tarif PLN (%/tahun)", "number", 'step="0.5"')}</div>
      <div class="g2">${ctx.inp(a + ".horizonTahun", "Periode analisis (tahun)", "number", 'min="5" max="30"')}${ctx.inp(a + ".pemakaianSendiri", "Energi PLTS terpakai sendiri (%)", "number", 'min="10" max="100"')}</div>
      <div class="g2">${ctx.inp(a + ".bebanBackupKW", "Beban backup saat padam (kW)", "number", 'step="any"')}${ctx.inp(a + ".biayaPerawatanPersen", "Biaya perawatan (% investasi/tahun)", "number", 'step="0.1"')}</div>
      <div class="g2">${ctx.inp(a + ".faktorEmisi", "Faktor emisi (kg CO₂/kWh)", "number", 'step="0.01"')}${ctx.inp(a + ".diskonNPV", "Tingkat diskonto NPV (%)", "number", 'step="0.5"')}</div>`;

    // rekomendasi
    ctx.$("#fRek").innerHTML = `
      ${
        ctx.S.opsi.length
          ? ctx.sel(
              "rekomendasi",
              "Opsi yang direkomendasikan",
              ctx.S.opsi.map((o) => [o.id, `${o.label} — ${ctx.ST.namaSistem[o.jenis]}`])
            )
          : ""
      }
      <label class="f"><span>Alasan rekomendasi (format: Judul | penjelasan) <a href="#" class="rst" data-rst="alasan">kembalikan otomatis</a></span><textarea id="f_alasan" rows="6" placeholder="Kosongkan = otomatis: alasan disusun dari perbandingan angka antar-opsi (balik modal, investasi, keuntungan, biaya per Wp).">${ctx.esc(ctx.S.alasanTeks)}</textarea></label>
      <label class="f"><span>Paragraf kesimpulan <a href="#" class="rst" data-rst="penutup">kembalikan otomatis</a></span><textarea id="f_penutup" rows="4">${ctx.esc(ctx.S.penutupTeks)}</textarea></label>
      <div class="g2">${ctx.inp("kontak.nama", "Nama penandatangan / sales")}${ctx.inp("kontak.telepon", "Telepon")}</div>
      <label class="f"><span>Timeline (Tahap | durasi)</span><textarea data-p="timelineTeks" rows="5">${ctx.esc(ctx.S.timelineTeks)}</textarea></label>
      `;
  }

  Object.assign(ctx, { renderPengaturanProposal });
}
