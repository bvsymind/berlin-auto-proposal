// Environmental impact and quotation.
// Dependencies and shared state are provided through ctx.
function initProposalSectionsEnvironmentOffer(ctx) {
  function lingkungan() {
    const r = ctx.rek().hasil,
      kmEV = (r.produksiDasar * 1000) / (ctx.A.whPerKmEV || 153);
    return `<section class="sheet flow" id="lingkungan">${ctx.kepala(ctx.NO.lingkungan, "Dampak Lingkungan", `Faktor emisi listrik PLN ${ctx.num(ctx.A.faktorEmisi, 3)} kg CO₂/kWh`)}
      <div class="eco">
        <div class="eco-hero"><div>${ctx.IC.leaf}</div><b data-count="${r.co2Tahun1}" data-fmt="ton2">${ctx.num(r.co2Tahun1, 2)} ton</b><span>emisi CO₂ dihindari setiap tahun</span><em>±${ctx.num(r.co2Total, 0)} ton selama ${r.horizon} tahun</em></div>
        <div class="eco-grid">
          ${ctx.kpi("tree", ctx.num(r.pohonTahunan, 0) + " pohon", "setara penyerapan CO₂ oleh pohon dewasa per tahun")}
          ${ctx.kpi("bolt", ctx.kWh(r.produksiDasar), "energi bersih dihasilkan per tahun")}
          ${ctx.kpi("car", ctx.num(kmEV, 0) + " km", `jarak tempuh mobil listrik per tahun dari energi PLTS (≈ ${ctx.num(kmEV / 40075, 1)}× keliling bumi)`)}
          ${ctx.kpi("fuel", ctx.num(kmEV / (ctx.A.kmPerLiter || 11.5), 0) + " liter", `bensin yang setara dihemat per tahun (${ctx.num(ctx.A.kmPerLiter || 11.5, 1)} km/liter)`)}
        </div>
      </div>
      <p class="note">Dengan beralih ke energi surya, ${ctx.esc(ctx.D.proyek.lokasi || "Anda")} turut mendukung target bauran energi terbarukan nasional dan upaya global mengurangi perubahan iklim.</p>
    </section>`;
  }

  function penawaran() {
    return `<section class="sheet" id="penawaran">${ctx.kepala(ctx.NO.penawaran, "Penawaran Harga", "Quotation")}
      ${ctx.D.opsi
        .map((o, oi) => {
          const q = o.quo,
            rows = q && q.rows.length ? q.rows : null,
            wp = o.kWp * 1000;
          const kat = ctx.kelompokItem(o);
          return `${ctx.multi ? `<h3 class="h3 opt-h${oi ? " brk" : ""}">${ctx.esc(o.label)} — ${ctx.esc(ctx.judulSistem(o))}</h3>` : ""}
        <div class="q-head"><div><small>Pelanggan</small><b>${ctx.esc(ctx.D.proyek.lokasi)}</b></div><div><small>Sistem</small><b>${ctx.esc(o.judul || ctx.judulSistem(o))}</b></div><div><small>Tanggal</small><b>${ctx.tgl(ctx.D.proyek.tanggal)}</b></div><div><small>Ref.</small><b>${ctx.esc(o.nomor || ctx.D.proyek.nomor || "-")}</b></div></div>
        <div class="tw"><table class="tbl num quo"><thead><tr><th>No</th><th>Produk / Pekerjaan</th><th>Keterangan</th><th>Harga Satuan</th><th>Qty</th><th>Total</th></tr></thead><tbody>
          ${(
            rows ||
            kat.map((k) => ({
              produk: k.nama,
              desc:
                k.item
                  .map((i) => i.nama)
                  .slice(0, 4)
                  .join(", ") + (k.item.length > 4 ? ", dll." : ""),
              harga: k.total,
              qty: 1,
              satuan: "lot",
              total: k.total
            }))
          )
            .map(
              (x, i) =>
                `<tr><td>${i + 1}</td><td><b>${ctx.esc(x.produk)}</b></td><td>${ctx.esc(x.desc)}</td><td>${ctx.rp(x.harga)}</td><td>${ctx.num(x.qty)} ${ctx.esc(x.satuan)}</td><td>${ctx.rp(x.total)}</td></tr>`
            )
            .join("")}
        </tbody><tbody class="tot">
          <tr><td colspan="5">Sub Total</td><td>${ctx.rp(o.subtotal)}</td></tr>
          ${o.diskon ? `<tr class="disc"><td colspan="5">Diskon</td><td>− ${ctx.rp(o.diskon)}</td></tr>` : ""}
          ${o.ppn ? `<tr><td colspan="5">PPN 11%</td><td>${ctx.rp(o.ppn)}</td></tr>` : ""}
          <tr class="grand"><td colspan="5">TOTAL INVESTASI</td><td>${ctx.rp(o.investasi)}</td></tr>
          ${wp ? `<tr class="pw"><td colspan="5">Harga per Wp</td><td>${ctx.rp(o.investasi / wp)}</td></tr>` : ""}
        </tbody></table></div>
        <p class="terbilang">Terbilang: <i>${ctx.esc(ctx.K.terbilang(o.investasi))}</i></p>
        ${ctx.D.tampilkanRincian && o.item.length ? `<p class="note">${ctx.IC.list} Rincian ${o.item.length} item pekerjaan & material terlampir pada <a href="#rincian-boq">Lampiran — Rincian BOQ</a>.</p>` : ""}`;
        })
        .join("")}
      ${(ctx.D.catatanPenawaran || []).length ? `<h3 class="h3">Ketentuan Penawaran</h3><ol class="terms">${ctx.D.catatanPenawaran.map((t) => `<li>${ctx.esc(t)}</li>`).join("")}</ol>` : ""}
    </section>`;
  }

  Object.assign(ctx, { lingkungan, penawaran });
}

if (typeof module !== "undefined" && module.exports)
  module.exports = initProposalSectionsEnvironmentOffer;
