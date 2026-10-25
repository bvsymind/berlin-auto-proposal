// Closing message and sales contacts.
// Dependencies and shared state are provided through ctx.
function initProposalSectionsClosing(ctx) {
  function penutup() {
    const o = ctx.rek(),
      r = o.hasil;
    const pesan = `Halo ${ctx.P.nama}, saya ${ctx.D.proyek.lokasi}. Saya ingin melanjutkan proposal ${ctx.judulSistem(o)} (${ctx.D.proyek.nomor || o.nomor || ""}).`;
    return `<section class="sheet" id="penutup">${ctx.kepala(ctx.NO.penutup, "Penutup & Persetujuan")}
      <p class="lead">${ctx.esc(ctx.D.penutup || "")}</p>
      <div class="next">
        <div><span>1</span><b>Konfirmasi</b><p>Tanda tangani lembar persetujuan ini atau hubungi kami melalui WhatsApp.</p></div>
        <div><span>2</span><b>Down Payment</b><p>DP ${ctx.num((ctx.D.termin[0] || {}).persen || 50)}% untuk memulai pengadaan material.</p></div>
        <div><span>3</span><b>Instalasi</b><p>Tim kami memasang, menguji, dan menyerahkan sistem beserta pelatihan monitoring.</p></div>
      </div>
      ${
        ctx.SALES
          ? `<div class="pic"><div class="pic-av">${ctx.esc(
              ctx.SALES.nama
                .replace(/^(bu|bpk|pak|ibu|mas|mbak)\.?\s+/i, "")
                .slice(0, 1)
                .toUpperCase()
            )}</div>
        <div class="pic-t"><small>${ctx.SALES.mitra ? "Mitra resmi" : "Sales PIC"} Anda</small><b>${ctx.esc(ctx.SALES.nama)}</b><span>${ctx.SALES.mitra ? ctx.esc(ctx.SALES.mitra) + " · mitra resmi " : ""}${ctx.esc(ctx.P.badanUsaha || ctx.P.nama)}</span></div>
        <a class="pic-wa" href="${ctx.linkWA(`Halo ${ctx.SALES.nama}, saya ${ctx.D.proyek.lokasi}. Saya ingin bertanya tentang proposal PLTS (${ctx.D.proyek.nomor || ""}).`)}" target="_blank" rel="noopener">${ctx.IC.wa}<span><small>Chat WhatsApp</small>${ctx.esc(ctx.waTampil(ctx.noWA))}</span></a></div>`
          : ""
      }
      <div class="cta no-print">
        <a class="btn pri" href="${ctx.linkWA(pesan)}" target="_blank" rel="noopener">${ctx.IC.wa} Lanjutkan proposal ini</a>
        <a class="btn" href="${ctx.linkWA(`Halo ${ctx.P.nama}, saya ingin konsultasi mengenai proposal PLTS ${ctx.D.proyek.lokasi}.`)}" target="_blank" rel="noopener">${ctx.IC.phone} Konsultasi dulu</a>
      </div>
      <div class="sign">
        <div><p>Hormat kami,</p><div class="sig-space"></div><b>${ctx.esc(ctx.SALES ? ctx.SALES.nama : ctx.D.kontak.nama || ctx.P.penandatangan)}</b><span>${ctx.SALES ? (ctx.SALES.mitra ? ctx.esc(ctx.SALES.mitra) + " · Mitra " : "Sales PIC · ") : ""}${ctx.esc(ctx.P.badanUsaha || ctx.P.nama)}</span></div>
        <div><p>Disetujui oleh,</p><div class="sig-space"></div><b>${ctx.esc(ctx.D.proyek.lokasi)}</b><span>Tanggal: ____________________</span></div>
      </div>
      <div class="contact">
        <div class="ct-l"><img src="${ctx.D.aset.logoPutih || ctx.D.aset.logo}" alt="${ctx.esc(ctx.P.nama)}"><p>${ctx.esc(ctx.P.alamat)}</p></div>
        <div class="ct-r">
          ${ctx.SALES ? `<a href="https://wa.me/${ctx.esc(ctx.noWA)}" target="_blank" rel="noopener">${ctx.IC.wa} ${ctx.esc(ctx.SALES.nama)}: ${ctx.esc(ctx.waTampil(ctx.noWA))}</a>` : ctx.P.kontakSales ? `<a href="https://wa.me/${ctx.esc(ctx.P.whatsapp)}" target="_blank" rel="noopener">${ctx.IC.wa} ${ctx.esc(ctx.P.kontakSales)}: ${ctx.esc(ctx.P.teleponSales)}</a>` : ""}
          <span>${ctx.IC.phone} ${ctx.esc(ctx.P.telepon)}</span>
          ${ctx.P.email ? `<span>${ctx.IC.mail} ${ctx.esc(ctx.P.email)}</span>` : ""}
          <span>${ctx.IC.globe} ${ctx.esc(ctx.P.website)}</span>
          ${ctx.P.instagram ? `<span>${ctx.IC.ig} @${ctx.esc(ctx.P.instagram)}</span>` : ""}
        </div>
      </div>
      <p class="fine">Proposal berlaku sampai <b>${ctx.tgl(ctx.D.proyek.berlaku) || "-"}</b>. ${ctx.esc(ctx.D.catatanPenutup || "")}</p>
    </section>`;
  }

  Object.assign(ctx, { penutup });
}

if (typeof module !== "undefined" && module.exports) module.exports = initProposalSectionsClosing;
