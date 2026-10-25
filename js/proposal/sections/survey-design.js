// Survey results and system design.
// Dependencies and shared state are provided through ctx.
function initProposalSectionsSurveyDesign(ctx) {
  function survei() {
    const sv = ctx.D.survey,
      pl = ctx.D.pln,
      o = ctx.rek(),
      r = o.hasil;
    const lok = (sv.baris || []).map((b) => [b[0], b[1]]);
    const lis = [
      ["Golongan tarif", pl.golonganLabel || pl.golongan],
      [
        "Daya terpasang",
        pl.kva ? `${ctx.num(pl.kva * 1000, 0)} VA${pl.fase ? " / " + pl.fase : ""}` : ""
      ],
      ["ID pelanggan PLN", pl.idPelanggan || pl.idCatatan || "-"],
      [
        "Pemakaian listrik",
        pl.kwh ? `${ctx.num(pl.kwh, 0)} kWh / bulan` : `~${ctx.num(r.kwhBulan, 0)} kWh / bulan`
      ],
      ["Tagihan listrik", `${ctx.rp(pl.tagihan)} / bulan`],
      ["Tarif rata-rata", `Rp ${ctx.num(pl.tarif, 2)} / kWh`]
    ];
    return `<section class="sheet" id="survey">${ctx.kepala(ctx.NO.survey, "Hasil Survey Lokasi", sv.tanggal ? `Survey ${ctx.tgl(sv.tanggal)}${sv.tim ? " · Tim: " + sv.tim : ""}` : "Kondisi aktual lokasi sebagai dasar desain")}
      <div class="two">
        <div><h3 class="h3 m0">Informasi Lokasi</h3>${ctx.kv(lok)}${sv.peta ? `<a class="maplink no-print-hide" href="${ctx.esc(sv.peta)}" target="_blank" rel="noopener">${ctx.IC.pin} Buka lokasi di Google Maps ${ctx.IC.ext}</a>` : ""}</div>
        <div><h3 class="h3 m0">Informasi Kelistrikan</h3>${ctx.kv(lis)}</div>
      </div>
      ${sv.catatan ? `<div class="callout">${ctx.IC.doc}<div><b>Catatan survey</b><p>${ctx.esc(sv.catatan).replace(/\n/g, "<br>")}</p></div></div>` : ""}
      ${
        sv.foto.length
          ? `<h3 class="h3${sv.foto.length > 3 ? " brk" : ""}">Dokumentasi Survey</h3>
      <div class="gal g${Math.min(3, sv.foto.length)}${sv.foto.length > 3 ? " big" : ""}">${sv.foto.map((f) => `<figure class="${/tagihan|screenshot|struk/i.test(f.ket) ? "doc" : ""}"><img src="${f.src}" alt="${ctx.esc(f.ket)}" loading="lazy">${f.ket ? `<figcaption>${ctx.esc(f.ket)}</figcaption>` : ""}</figure>`).join("")}</div>`
          : ""
      }
    </section>`;
  }

  function desain() {
    return `<section class="sheet" id="desain">${ctx.kepala(ctx.NO.desain, "Desain Sistem", "Rancangan teknis berdasarkan hasil survey")}
      ${ctx.D.opsi
        .map((o, oi) => {
          const k = o.komponen,
            kf = [];
          if (k.pv)
            kf.push(
              ["panel", `${ctx.num(k.pv.qty)} panel`, `${ctx.num(o.kWp * 1000, 0)} Wp total`],
              ["home", `${ctx.num(o.luas || 0, 1)} m²`, "luas area panel"]
            );
          if (o.beratPV) kf.push(["tools", `${ctx.num(o.beratPV, 0)} kg`, "beban panel di atap"]);
          if (k.inverter)
            kf.push([
              "bolt",
              `${ctx.num(k.inverter.qty)} × ${ctx.num(k.inverter.kw || 0, 1)} kW`,
              `inverter ${{ ongrid: "on-grid", hybrid: "hybrid", hybridoff: "off-grid", offgrid: "off-grid" }[o.jenis] || ""}`
            ]);
          if (k.baterai)
            kf.push([
              "battery",
              `${ctx.num(o.bateraiKWh, 2)} kWh`,
              `${ctx.num(k.baterai.qty)} unit baterai`
            ]);
          return `${ctx.multi ? `<h3 class="h3 opt-h${oi ? " brk" : ""}">${ctx.esc(o.label)} — ${ctx.esc(ctx.judulSistem(o))}</h3>` : ""}
        <h3 class="h3${ctx.multi ? " sub" : ""}">Diagram Sistem ${ctx.esc(ctx.D.namaSistem[o.jenis])}</h3>
        <figure class="card diag">${ctx.diagramSistem(o)}</figure>
        <div class="kpis k${Math.min(5, kf.length)} cfg">${kf.map((x) => ctx.kpi(x[0], x[1], x[2])).join("")}</div>
        ${o.bateraiKWh ? `<div class="callout">${ctx.IC.battery}<div><b>Cadangan listrik saat PLN padam ± ${ctx.num(o.hasil.backupJam, 1)} jam</b><p>${ctx.num(o.bateraiKWh, 2)} kWh × ${ctx.num(o.dod)}% kedalaman pengosongan (DOD) ÷ ${ctx.num(ctx.A.bebanBackupKW, 1)} kW beban penting (lampu, kulkas, router, pompa). Inverter hybrid berpindah ke baterai secara otomatis; durasi menyesuaikan besar beban yang menyala.</p></div></div>` : ""}
        ${o.layout && ctx.D.opsi.slice(0, oi).some((x) => x.layout === o.layout) ? `<p class="note">${ctx.IC.doc} Gambar perencanaan & layout panel sama dengan ${ctx.esc(ctx.D.opsi.slice(0, oi).find((x) => x.layout === o.layout).label)}.</p>` : o.layout ? `<h3 class="h3 brk">Gambar Perencanaan & Layout Panel</h3><figure class="card plan"><img src="${o.layout}" alt="Layout panel surya"><figcaption>Gambar teknik penempatan ${ctx.num(k.pv?.qty || 0)} panel surya, jalur kabel, dan lokasi peralatan.</figcaption></figure>` : ""}
        ${(o.material || []).length ? `<h3 class="h3">Material Instalasi</h3><div class="chips">${o.material.map((m) => `<span>${ctx.IC.check} ${ctx.esc(m)}</span>`).join("")}</div>` : ""}`;
        })
        .join("")}
    </section>`;
  }

  Object.assign(ctx, { survei, desain });
}

if (typeof module !== "undefined" && module.exports)
  module.exports = initProposalSectionsSurveyDesign;
