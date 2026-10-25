// Form fields, state paths and the form render coordinator.
// Dependencies and shared state are provided through ctx.
function initAppFormsHelpers(ctx) {
  // ---------------------------- FORM ----------------------------
  const inp = (path, label, type = "text", extra = "") =>
    `<label class="f"><span>${label}</span><input data-p="${path}" type="${type}" value="${ctx.esc(get(path))}" ${extra}></label>`;
  const chk = (path, label) =>
    `<label class="ck"><input data-p="${path}" type="checkbox" ${get(path) ? "checked" : ""}> ${label}</label>`;
  const sel = (path, label, opts) =>
    `<label class="f"><span>${label}</span><select data-p="${path}">${opts.map((o) => `<option value="${ctx.esc(o[0])}" ${String(get(path)) === String(o[0]) ? "selected" : ""}>${ctx.esc(o[1])}</option>`).join("")}</select></label>`;
  function get(path) {
    return path.split(".").reduce((o, k) => (o == null ? o : o[k]), ctx.S) ?? "";
  }
  function set(path, v) {
    const ks = path.split("."),
      last = ks.pop();
    const o = ks.reduce((o, k) => (o[k] ??= {}), ctx.S);
    o[last] = v;
  }

  function renderForm() {
    ctx.aturTombol();
    ctx.renderOpsiSurvey();
    ctx.renderDataProyek();
    ctx.renderKomponen();
    ctx.renderPengaturanProposal();
  }

  Object.assign(ctx, { inp, chk, sel, get, set, renderForm });
}
