// Assemble sections, navigation and the rendered document.
// Dependencies and shared state are provided through ctx.
function initProposalRender(ctx) {
  // ============================ RAKIT ============================
  function bangun() {
    ctx.hitungSemua();
    const bag = ctx.daftarBagian();
    ctx.NO = {};
    bag.forEach((b, i) => (ctx.NO[b[0]] = i + 1));
    let h = ctx.cover() + ctx.daftarIsi(bag) + ctx.ringkasan();
    if (ctx.D.survey) h += ctx.survei();
    h +=
      ctx.desain() +
      ctx.spesifikasi() +
      ctx.produksi() +
      ctx.finansial() +
      ctx.perbandingan() +
      ctx.lingkungan() +
      ctx.penawaran() +
      ctx.garansiBayar() +
      ctx.tentang() +
      ctx.penutup() +
      ctx.lampiran() +
      ctx.rincianBOQ();
    return h;
  }
  function navLinks() {
    return ctx
      .daftarBagian()
      .filter((b) => b[0] !== "lampiran")
      .map(
        (b) =>
          `<a href="#${b[0]}" data-sec="${b[0]}">${ctx.esc(b[1].replace(/ &.*| Proposal\b| Produk\b| Lokasi\b| Energi\b| Proyek\b/g, "").replace(/^Tentang .*/, "Profil"))}</a>`
      )
      .join("");
  }
  function render() {
    const y = window.scrollY;
    document.getElementById("doc").innerHTML = bangun();
    window.scrollTo(0, y);
    ctx.hidupkan();
  }

  Object.assign(ctx, { bangun, navLinks, render });
}

if (typeof module !== "undefined" && module.exports) module.exports = initProposalRender;
