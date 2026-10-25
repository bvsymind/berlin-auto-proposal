// Proposal configuration, working assumptions and number/date formatting.
// Dependencies and shared state are provided through ctx.
function initProposalContext(ctx) {
  const P = ctx.D.perusahaan,
    A0 = JSON.parse(JSON.stringify(ctx.D.asumsi));
  let A = JSON.parse(JSON.stringify(ctx.D.asumsi));
  const esc = (s) =>
    String(s ?? "").replace(
      /[&<>"']/g,
      (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]
    );
  const rp = ctx.K.rp,
    num = ctx.K.num,
    rs = ctx.K.rpSingkat;
  const pct = (v, d = 0) => num(v * 100, d) + "%";
  const th = (v) => (v == null ? "> " + A.horizonTahun : num(v, 1));
  const bln = (r) =>
    r.bepBulan != null ? r.bepBulan : r.bep != null ? Math.round(r.bep * 12) : null;
  const bepTeks = (r) => {
    const b = bln(r);
    if (b == null) return "di luar periode analisis";
    const t = Math.floor(b / 12),
      m = b % 12;
    return `${b} bulan (${t} tahun${m ? " " + m + " bulan" : ""})`;
  };
  const BULAN = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember"
  ];
  const tgl = (iso) => {
    if (!iso || !/^\d{4}-\d{2}-\d{2}/.test(iso)) return iso || "";
    const [y, m, d] = iso.split("-").map(Number);
    return `${d} ${BULAN[m - 1]} ${y}`;
  };
  const romawi = (n) =>
    [
      "",
      "I",
      "II",
      "III",
      "IV",
      "V",
      "VI",
      "VII",
      "VIII",
      "IX",
      "X",
      "XI",
      "XII",
      "XIII",
      "XIV",
      "XV",
      "XVI"
    ][n] || n;
  const kWh = (v) => num(v, 0) + " kWh";

  Object.assign(ctx, { P, A0, esc, rp, num, rs, pct, th, bln, bepTeks, BULAN, tgl, romawi, kWh });

  Object.defineProperty(ctx, "A", {
    get: () => A,
    set: (value) => {
      A = value;
    }
  });
}

if (typeof module !== "undefined" && module.exports) module.exports = initProposalContext;
