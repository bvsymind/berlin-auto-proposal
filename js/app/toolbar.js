// New/open/save project, export, print and keyboard shortcuts.
// Dependencies and shared state are provided through ctx.
function initAppToolbar(ctx) {
  // ---------- toolbar ----------
  const simpanProyek = () => {
    if (!ctx.S.opsi.length)
      return ctx.toast("Belum ada data — unggah workbook terlebih dahulu.", "err");
    const nama = ctx.namaFile("proyek.json");
    ctx.unduh(
      JSON.stringify(
        Object.assign({}, ctx.S, {
          opsi: ctx.S.opsi.map((o) =>
            Object.assign({}, o, { _h: undefined, teksMentah: undefined })
          )
        }),
        null,
        1
      ),
      nama,
      "application/json"
    );
    ctx.toast(
      `✓ Proyek disimpan: ${nama} (folder Unduhan/Downloads). Buka lagi lewat tombol "Buka".`
    );
  };
  ctx.$("#btnBaru").onclick = () =>
    ctx.dialog(
      "Mulai proposal baru?",
      `<p class="muted">Semua isian, foto, dan opsi di layar akan dikosongkan. Simpan dulu bila masih diperlukan.</p>`,
      [
        { teks: "Batal" },
        ...(ctx.S.opsi.length
          ? [
              {
                teks: "Simpan dulu",
                aksi: () => {
                  simpanProyek();
                  ctx.S = ctx.baru();
                  ctx.renderForm();
                  ctx.jadwalPreview();
                }
              }
            ]
          : []),
        {
          teks: "Ya, mulai baru",
          pri: true,
          aksi: () => {
            ctx.S = ctx.baru();
            if (window.PENGGUNA) ctx.terapkanAkun(window.PENGGUNA);
            ctx.$("#upStatus").textContent = "";
            ctx.$("#svStatus").textContent = "";
            ctx.renderForm();
            ctx.jadwalPreview();
            ctx.toast("Proposal baru siap — tarik workbook BMI ke bagian 1.");
          }
        }
      ]
    );
  ctx.$("#btnSimpan").onclick = simpanProyek;
  ctx.$("#btnBuka").onclick = () => ctx.$("#fileProyek").click();
  ctx.$("#fileProyek").onchange = async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    try {
      ctx.S = Object.assign(ctx.baru(), JSON.parse(await f.text()));
      if (!ctx.S.survey) ctx.S.survey = ctx.surveyBaru();
      if (!ctx.S.sales) ctx.S.sales = { nama: "", wa: "" };
      ctx.renderForm();
      ctx.jadwalPreview();
      ctx.toast(`✓ Proyek dibuka: ${f.name}`);
    } catch (er) {
      ctx.toast(
        "File tidak bisa dibuka — pilih file .proyek.json hasil tombol Simpan. (" +
          er.message +
          ")",
        "err",
        7000
      );
    }
    e.target.value = "";
  };
  ctx.$("#btnHTML").onclick = () => {
    if (!ctx.S.opsi.length) return ctx.toast("Unggah workbook terlebih dahulu.", "err");
    const nama = ctx.namaFile("html");
    ctx.unduh(buatHTMLProposal(ctx.rakit()), nama, "text/html");
    ctx.toast(
      `✓ Proposal diunduh: ${nama} — cek folder Unduhan (Downloads). File ini bisa langsung dikirim ke pelanggan.`,
      "ok",
      7000
    );
  };
  ctx.$("#btnPDF").onclick = () => {
    if (!ctx.S.opsi.length) return ctx.toast("Unggah workbook terlebih dahulu.", "err");
    ctx.dialog(
      "Simpan sebagai PDF",
      `<ol><li>Destination / Tujuan: <b>Save as PDF</b></li><li>Paper size / Ukuran kertas: <b>A4</b></li><li>More settings: centang <b>Background graphics</b></li><li>Matikan <b>Headers and footers</b> (nomor halaman sudah otomatis)</li></ol><p class="muted">Nama file yang disarankan: <b>${ctx.esc(ctx.namaFile("pdf"))}</b></p>`,
      [
        { teks: "Batal" },
        {
          teks: "Lanjut cetak",
          pri: true,
          aksi: () => {
            const fr = ctx.$("#preview");
            fr.onload = () => {
              setTimeout(() => {
                try {
                  fr.contentWindow.focus();
                  fr.contentWindow.print();
                } catch (e) {
                  const w = window.open(
                    URL.createObjectURL(
                      new Blob([buatHTMLProposal(ctx.rakit())], { type: "text/html" })
                    )
                  );
                  if (w) w.addEventListener("load", () => setTimeout(() => w.print(), 600));
                }
              }, 500);
            };
            fr.srcdoc = buatHTMLProposal(ctx.rakit()); // muat ulang pratinjau agar yang dicetak pasti versi terbaru
          }
        }
      ]
    );
  };
  ctx.$("#btnLebar").onclick = () => {
    const w = document.body.classList.toggle("wide");
    ctx.$("#lblLebar").textContent = w ? "Tampilkan panel" : "Lebarkan";
    ctx.$("#btnLebar").title = w
      ? "Tampilkan lagi panel isian di kiri"
      : "Sembunyikan panel kiri agar pratinjau proposal lebih lebar";
  };
  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
      e.preventDefault();
      simpanProyek();
    }
  });

  Object.assign(ctx, { simpanProyek });
}
