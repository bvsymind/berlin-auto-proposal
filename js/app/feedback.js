// Toast messages, dialogs, toolbar state and file downloads.
// Dependencies and shared state are provided through ctx.
function initAppFeedback(ctx) {
  // ---------- umpan balik ----------
  let tToast = null;
  function toast(pesan, jenis = "ok", lama = 4500) {
    const t = ctx.$("#toast");
    t.textContent = pesan;
    t.className = "on " + jenis;
    clearTimeout(tToast);
    tToast = setTimeout(() => (t.className = ""), lama);
  }
  function dialog(judul, isiHTML, tombol) {
    const m = ctx.$("#modal");
    ctx.$("#modalBox").innerHTML =
      `<h4>${judul}</h4>${isiHTML}<div class="act">${tombol.map((b, i) => `<button data-i="${i}" class="${b.pri ? "pri" : ""}">${b.teks}</button>`).join("")}</div>`;
    m.classList.add("on");
    ctx
      .$("#modalBox")
      .querySelectorAll("button")
      .forEach(
        (btn) =>
          (btn.onclick = () => {
            m.classList.remove("on");
            const f = tombol[+btn.dataset.i].aksi;
            if (f) f();
          })
      );
    const tutup = (e) => {
      if (e.key === "Escape" || e.target === m) {
        m.classList.remove("on");
        document.removeEventListener("keydown", tutup);
      }
    };
    document.addEventListener("keydown", tutup);
    m.onclick = tutup;
    setTimeout(() => {
      const p = ctx.$("#modalBox button.pri");
      if (p) p.focus();
    }, 30);
  }
  function aturTombol() {
    const ada = ctx.S.opsi.length > 0;
    ["#btnPDF", "#btnHTML", "#btnSimpan"].forEach((id) => {
      const b = ctx.$(id);
      b.disabled = !ada;
      if (!ada) ((b.dataset.t = b.title), (b.title = "Unggah workbook terlebih dahulu"));
      else if (b.dataset.t) b.title = b.dataset.t;
    });
  }
  function unduh(isi, nama, tipe) {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([isi], { type: tipe }));
    a.download = nama;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      URL.revokeObjectURL(a.href);
      a.remove();
    }, 1000);
  }

  Object.assign(ctx, { toast, dialog, aturTombol, unduh });

  Object.defineProperty(ctx, "tToast", {
    get: () => tToast,
    set: (value) => {
      tToast = value;
    }
  });
}
