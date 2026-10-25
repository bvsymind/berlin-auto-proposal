// Proposal cover, introduction and table of contents.
// Dependencies and shared state are provided through ctx.
function initProposalSectionsCover(ctx) {
  // ============================ SECTION ============================
  function cover() {
    const pr = ctx.D.proyek,
      o = ctx.rek();
    const foto = pr.foto || ctx.D.aset.sampul,
      rencana = pr.foto && pr.fotoRasio > 1.05;
    return `<section class="sheet cover" id="cover">
      <div class="cv-photo${rencana ? " plan" : ""}">${
        rencana
          ? `<figure class="cv-plan"><img src="${foto}" alt="Layout panel surya"></figure>
           <div class="cv-plan-txt"><small>Rencana instalasi</small><b>Layout panel surya di atap ${ctx.esc(pr.lokasi)}</b><span>Disusun dari survey drone ${ctx.D.survey && ctx.D.survey.tanggal ? ctx.tgl(ctx.D.survey.tanggal) : ""} oleh tim ${ctx.esc(ctx.titleCase(ctx.P.nama))}</span></div>`
          : `<img src="${foto}" alt=""><div class="cv-shade"></div>`
      }
        <div class="cv-top"><div class="cv-logos"><img src="${ctx.D.aset.logo}" alt="${ctx.esc(ctx.P.nama)}">${ctx.P.grup && ctx.D.aset.logoTrang ? `<i></i><img src="${ctx.D.aset.logoTrang}" alt="${ctx.esc(ctx.P.grup)}" class="trang">` : ""}</div>
          <span class="cv-doc">${ctx.esc(
            pr.nomor ||
              ctx.D.opsi
                .map((o) => o.nomor)
                .filter(Boolean)
                .join(" · ")
          )}</span></div>
      </div>
      <div class="cv-body">
        <div class="eyebrow">Proposal Penawaran</div>
        <h1>${ctx.multi ? "Pembangkit Listrik Tenaga Surya" : ctx.esc(ctx.D.namaSistem[o.jenis])}</h1>
        <div class="cv-cap">${ctx.multi ? ctx.D.opsi.map((x) => `<span>${ctx.esc(x.label)} · ${ctx.esc(ctx.judulSistem(x))}</span>`).join("") : `<span>${ctx.num(o.kWp, 2)} kWp</span>${o.bateraiKWh ? `<span>${ctx.num(o.bateraiKWh, 2)} kWh baterai</span>` : ""}<span>${ctx.num(o.komponen.pv?.qty || 0)} panel surya</span>`}</div>
        <p class="cv-tag">${ctx.esc(ctx.P.tagline)}</p>
        <div class="cv-kpi"><div><small>Investasi</small><b>${ctx.rp(o.investasi)}</b></div><div><small>Hemat / bulan</small><b>± ${ctx.rp(o.hasil.hematBulan1)}</b></div><div><small>Balik modal</small><b>${ctx.bln(o.hasil) ?? "-"} bulan</b></div><div><small>Keuntungan ${o.hasil.horizon} th</small><b>${ctx.rs(o.hasil.netProfit)}</b></div></div>
        <div class="cv-cust">
          <small>Dipersiapkan untuk</small>
          <b>${ctx.esc(pr.lokasi)}</b>
          ${pr.pic ? `<span>${ctx.esc(pr.pic)}</span>` : ""}
          ${pr.alamat ? `<span class="addr">${ctx.IC.pin} ${ctx.esc(pr.alamat)}</span>` : ""}
        </div>
      </div>
      <div class="cv-foot">
        <div><small>Tanggal</small><b>${ctx.tgl(pr.tanggal)}</b></div>
        <div><small>Berlaku hingga</small><b>${ctx.tgl(pr.berlaku) || "-"}</b></div>
        <div><small>Diajukan oleh</small><b>${ctx.esc(ctx.P.badanUsaha || ctx.P.nama)}</b></div>
        <div class="cv-contact"><span>${ctx.IC.globe} ${ctx.esc(ctx.P.website)}</span><span>${ctx.IC.phone} ${ctx.esc(ctx.P.telepon)}</span></div>
      </div>
    </section>`;
  }

  function daftarIsi(bag) {
    const pr = ctx.D.proyek,
      o = ctx.rek(),
      r = o.hasil;
    const sapaan = /^(pak|bapak|bpk|ibu|bu)\b/i.test(pr.lokasi) ? pr.lokasi : pr.pic || pr.lokasi;
    return `<section class="sheet toc" id="pengantar">
      <div class="letter">
        <p class="muted">${ctx.tgl(pr.tanggal)}${pr.nomor ? ` · Ref. ${ctx.esc(pr.nomor)}` : ""}</p>
        <p>Kepada Yth.<br><b>${ctx.esc(pr.lokasi)}</b>${pr.alamat ? `<br><span class="muted">${ctx.esc(pr.alamat)}</span>` : ""}</p>
        <p>Dengan hormat,</p>
        <p>Terima kasih atas kepercayaan ${ctx.esc(sapaan)} kepada <b>${ctx.esc(ctx.P.badanUsaha || ctx.P.nama)}</b>${ctx.D.survey && ctx.D.survey.tanggal ? ` dan atas kesempatan yang diberikan kepada tim kami untuk melakukan survey lokasi pada ${ctx.tgl(ctx.D.survey.tanggal)}` : ""}. Berdasarkan hasil survey tersebut, kami mengajukan ${ctx.multi ? `${ctx.D.opsi.length} opsi` : ""} <b>${ctx.esc(ctx.multi ? "sistem PLTS" : ctx.judulSistem(o))}</b> yang dirancang khusus untuk kondisi atap dan pola pemakaian listrik ${ctx.esc(pr.segmenKata || "Anda")}.</p>
        <p>Dengan investasi <b>${ctx.rp(o.investasi)}</b>, sistem ini diperkirakan menghemat sekitar <b>${ctx.rp(r.hematBulan1)} per bulan</b> dan kembali modal dalam <b>${ctx.bepTeks(r)}</b>. Rincian teknis, perhitungan, dan penawaran harga kami sampaikan pada halaman-halaman berikut.</p>
        <p>Hormat kami,<br><b>${ctx.esc(ctx.P.badanUsaha || ctx.P.nama)}</b></p>
      </div>
      <h3 class="toc-h">${ctx.IC.list} Daftar Isi</h3>
      <ol class="toc-list">${bag.map((b, i) => `<li><a href="#${b[0]}"><span class="tn">${String(i + 1).padStart(2, "0")}</span><span class="tt"><b>${ctx.esc(b[1])}</b><small>${ctx.esc(b[2])}</small></span></a></li>`).join("")}</ol>
    </section>`;
  }

  Object.assign(ctx, { cover, daftarIsi });
}

if (typeof module !== "undefined" && module.exports) module.exports = initProposalSectionsCover;
