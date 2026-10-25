// Initial form and preview rendering.
// Dependencies and shared state are provided through ctx.
function initAppStartup(ctx) {
  ctx.renderForm();
  ctx.preview();
  window.__S = () => ctx.S; // untuk pengecekan
}
