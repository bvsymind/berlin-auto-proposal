// Create the proposal shell and attach interactions.
// Dependencies and shared state are provided through ctx.
function initProposalStartup(ctx) {
  function mulai() {
    // ---------------------------- MULAI ----------------------------
    document.title = `Proposal PLTS — ${ctx.D.proyek.lokasi} | ${ctx.P.nama}`;
    document.head.insertAdjacentHTML("beforeend", `<style>${ctx.CSS}</style>`);
    const waUtama = ctx.linkWA(
      `Halo ${ctx.SALES ? ctx.SALES.nama : ctx.P.nama}, saya ingin bertanya tentang proposal PLTS ${ctx.D.proyek.lokasi}.`
    );
    document.body.innerHTML = `
    <div id="bar"><div class="lg"><img src="${ctx.D.aset.logo}" alt="${ctx.esc(ctx.P.nama)}"></div><nav id="nav">${ctx.navLinks()}</nav>
      <div class="tb"><button id="btnSim" title="Simulasi">${ctx.IC.sliders}<span class="t">Simulasi</span></button><button id="btnPrint" title="Simpan sebagai PDF">${ctx.IC.print}<span class="t">PDF</span></button></div></div>
    <aside id="sim" hidden><h4>${ctx.IC.sliders} Simulasi <button id="simClose" aria-label="Tutup">${ctx.IC.x}</button></h4>
      <p>Geser untuk melihat pengaruh asumsi terhadap BEP & penghematan. Angka resmi tetap sesuai penawaran.</p>
      <label>Kenaikan tarif PLN <b id="v_kenaikanTarif"></b></label><input type="range" id="s_kenaikanTarif" min="0" max="10" step="0.5">
      <label>Jam matahari efektif <b id="v_jamEfektif"></b></label><input type="range" id="s_jamEfektif" min="2.5" max="4.8" step="0.05">
      ${ctx.D.opsi.some((o) => o.bateraiKWh) ? `<label>Beban backup <b id="v_bebanBackupKW"></b></label><input type="range" id="s_bebanBackupKW" min="0.5" max="${Math.max(10, ctx.A.bebanBackupKW * 3)}" step="0.5">` : ""}
      <button class="rs2" id="simReset">Kembalikan ke angka penawaran</button></aside>
    <div id="simBanner">Mode simulasi — angka berbeda dari penawaran resmi</div>
    <main id="doc"></main>
    ${ctx.noWA ? `<a class="fab no-print" href="${waUtama}" target="_blank" rel="noopener" aria-label="WhatsApp">${ctx.IC.wa}</a>` : ""}
    <div id="tip" hidden></div>`;
    ctx.pasangGlobal();
  }
  Object.assign(ctx, { mulai });
}

if (typeof module !== "undefined" && module.exports) module.exports = initProposalStartup;
