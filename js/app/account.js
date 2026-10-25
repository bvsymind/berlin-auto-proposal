// Apply Cloudflare account data to the sales form.
// Dependencies and shared state are provided through ctx.
function initAppAccount(ctx) {
  // ---------- akun (website dengan Cloudflare Access) ----------
  function terapkanAkun(u) {
    if (!u) return;
    if (u.peran === "mitra")
      ctx.S.sales = { nama: u.nama, wa: ctx.normWA(u.wa), mitra: u.perusahaan || "", kunci: true };
    else {
      if (ctx.S.sales.kunci) ctx.S.sales = { nama: "", wa: "" };
      if (!ctx.S.sales.nama) ctx.S.sales = { nama: u.nama, wa: ctx.normWA(u.wa) };
    }
    ctx.renderForm();
    ctx.jadwalPreview();
  }
  document.addEventListener("akun-siap", (e) => terapkanAkun(e.detail));
  if (window.PENGGUNA) terapkanAkun(window.PENGGUNA);

  Object.assign(ctx, { terapkanAkun });
}
