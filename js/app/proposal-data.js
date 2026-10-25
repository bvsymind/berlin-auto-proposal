// Assemble final proposal data, components, warranties and closing text.
// Dependencies and shared state are provided through ctx.
function initAppProposalData(ctx) {
  // ---------------------------- RAKIT DATA PROPOSAL ----------------------------
  const produk = (id) => ctx.KAT.find((p) => p.id === id);
  function komponenFinal(o, x) {
    const c = o.komponen[x];
    if (!c) return null;
    const p = produk(c.produkId) || {};
    const keu =
      o.keunggulan[x] != null
        ? o.keunggulan[x]
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean)
        : p.keunggulan || [];
    return Object.assign({}, c, {
      nama: c.nama || p.nama || c.uraian,
      merek: c.merek || p.merek || "",
      keunggulan: keu,
      datasheet: c.datasheet || p.datasheet || "",
      produk: p
    });
  }
  function proteksiDari(items) {
    const t = items.map((i) => i.uraian).join(" | ");
    const L = [];
    if (/dc\s*spd/i.test(t) || /ac\s*spd/i.test(t))
      L.push(
        /dc\s*spd/i.test(t) && /ac\s*spd/i.test(t)
          ? "DC/AC SPD"
          : /dc\s*spd/i.test(t)
            ? "DC SPD"
            : "AC SPD"
      );
    if (/mccb/i.test(t)) L.push("MCCB");
    else if (/\bmcb\b/i.test(t)) L.push("MCB");
    if (/\bats\b/i.test(t)) L.push("ATS");
    if (/pv\s*switch|dc\s*switch|isolator/i.test(t)) L.push("DC Switch");
    if (/combiner/i.test(t)) L.push("PV Combiner");
    if (/ground|grounding|arde|penangkal/i.test(t)) L.push("Grounding");
    return L.join(", ");
  }
  function monitoringDari(o, inv) {
    const t = o.item.map((i) => i.uraian).join(" ");
    if (!/monitor|dongle|doogle|wifi|cloud|lan/i.test(t) && !(inv && inv.merek)) return "";
    const m = ((inv && inv.merek) || "").toLowerCase();
    return m === "solax"
      ? "SolaX Cloud (WiFi/LAN/4G)"
      : m === "deye"
        ? "Solarman Smart (WiFi)"
        : "Aplikasi monitoring (WiFi)";
  }
  function garansiGabung(opsi) {
    // workbook Berlin: garansi dari spesifikasi LHS (Standard Garansi)
    if (opsi.some((o) => o.berlin)) {
      const out = [],
        lihat = new Set(),
        NM = { pv: "Panel Surya", inverter: "Inverter", baterai: "Baterai" };
      opsi.forEach((o) =>
        ["pv", "inverter", "baterai"].forEach((x) => {
          const c = komponenFinal(o, x);
          if (!c) return;
          const t = c.garansi || (c.produk && (c.produk.garansiProduk || c.produk.garansi));
          if (!t) return;
          const nama = `${NM[x]} ${c.merek || ""}`.trim();
          if (lihat.has(nama + t)) return;
          lihat.add(nama + t);
          out.push({
            item: nama,
            durasi: `${t} Tahun`,
            ket:
              x === "pv" && c.produk && c.produk.garansiPerforma
                ? `Garansi daya ${c.produk.garansiPerforma} tahun`
                : ""
          });
        })
      );
      return out.concat(
        ctx.ST.garansiTambahan.map((g) => ({ item: g.item, durasi: g.durasi, ket: "" }))
      );
    }
    const peta = {};
    opsi.forEach((o) => {
      (o.garansiBOQ || []).forEach((g) => {
        const it = g.item.toLowerCase();
        let kunci,
          nama,
          ket = "";
        if (/batt?er/.test(it)) {
          const b = komponenFinal(o, "baterai");
          kunci = "bat";
          nama = "Baterai " + ((b && b.merek) || "");
        } else if (/inverter/.test(it)) {
          const i = komponenFinal(o, "inverter");
          kunci = "inv-" + (i && i.merek);
          nama = "Inverter " + ((i && i.merek) || "");
        } else if (/pv|modul|panel|module/.test(it)) {
          const p = komponenFinal(o, "pv");
          kunci = "pv";
          nama = "Modul PV " + ((p && p.merek) || "");
          if (p && p.produk.garansiPerforma)
            ket = `Garansi performa ${p.produk.garansiPerforma} tahun`;
        } else {
          kunci = it;
          nama = g.item;
        }
        if (!peta[kunci]) peta[kunci] = { item: nama.trim(), durasi: g.tahun + " Tahun", ket };
      });
    });
    const out = Object.values(peta);
    if (!out.length)
      opsi.forEach((o) =>
        ["pv", "inverter", "baterai"].forEach((x) => {
          const c = komponenFinal(o, x);
          if (c && c.produk && (c.produk.garansi || c.produk.garansiProduk)) {
            const k = x + c.merek;
            if (!peta[k]) {
              peta[k] = 1;
              out.push({
                item:
                  (x === "pv" ? "Modul PV " : x === "inverter" ? "Inverter " : "Baterai ") +
                  c.merek,
                durasi: (c.produk.garansiProduk || c.produk.garansi) + " Tahun",
                ket: c.produk.garansiPerforma
                  ? `Garansi performa ${c.produk.garansiPerforma} tahun`
                  : ""
              });
            }
          }
        })
      );
    return out.concat(
      ctx.ST.garansiTambahan.map((g) => ({ item: g.item, durasi: g.durasi, ket: "" }))
    );
  }
  function alasanDefault(rek) {
    const j = rek ? rek.jenis : "ongrid";
    return (ctx.ST.alasan[j] || ctx.ST.alasan[j === "hybridoff" ? "hybrid" : "ongrid"] || [])
      .map((a) => `${a[0]} | ${a[1]}`)
      .join("\n");
  }
  function penutupDefault(D) {
    const r = D.opsi.find((o) => o.id === D.rekomendasi) || D.opsi[0];
    if (!r) return "";
    const lain = D.opsi.filter((o) => o.id !== r.id),
      nm = D.namaSistem[r.jenis],
      lok = D.proyek.lokasi || "Anda";
    const kap = `${ctx.K.num(r.kWp, 2)} kWp${r.bateraiKWh ? ` dengan baterai ${ctx.K.num(r.bateraiKWh, 2)} kWh` : ""}`,
      P = D.perusahaan.badanUsaha || D.perusahaan.nama;
    if (r.jenis !== "ongrid" && lain.length) {
      const sel = r.investasi - Math.min(...lain.map((l) => l.investasi));
      return `Untuk ${lok}, kami merekomendasikan ${r.label} – ${nm} ${kap}. Selain memangkas tagihan listrik, sistem ini menjaga listrik tetap menyala saat PLN padam${sel > 0 ? `; tambahan investasi ${ctx.K.rpSingkat(sel)} dibandingkan opsi termurah terbayar dalam bentuk kenyamanan dan perlindungan peralatan` : ""}. Tim ${P} siap mendampingi mulai dari desain, pengadaan, instalasi, perizinan SLO, hingga layanan purna jual.`;
    }
    if (lain.length) {
      try {
        const hr = ctx.hasilOpsi(r, D),
          murah = lain.reduce((a, b) => (b.investasi < a.investasi ? b : a)),
          hm = ctx.hasilOpsi(murah, D);
        const bep = ctx.bulanBEP(hr),
          H = D.asumsi.horizonTahun;
        const alt =
          murah.investasi < r.investasi
            ? ` Bila modal awal menjadi pertimbangan utama, ${murah.label} (${ctx.K.rpSingkat(murah.investasi)}) tetap layak sebagai langkah awal${ctx.bulanBEP(hm) > bep && isFinite(ctx.bulanBEP(hm)) ? `, dengan balik modal ±${ctx.bulanBEP(hm)} bulan` : ""}.`
            : "";
        return `Untuk ${lok}, kami merekomendasikan ${r.label} – ${nm} ${kap}: balik modal ±${isFinite(bep) ? bep + " bulan" : "lebih dari " + H + " tahun"} dan keuntungan bersih ±${ctx.K.rpSingkat(hr.netProfit)} selama ${H} tahun.${alt} Tim ${P} siap mendampingi mulai dari desain, pengadaan, instalasi, perizinan SLO, hingga layanan purna jual.`;
      } catch (e) {
        console.warn(e);
      }
    }
    if (lain.length)
      return `Untuk ${lok}, kami merekomendasikan ${r.label} – ${nm} ${kap} yang memberikan balik modal tercepat dengan perawatan minimal. Bila di kemudian hari dibutuhkan cadangan listrik, sistem dapat dikembangkan bersama tim ${P}.`;
    return `Dengan ${nm} ${kap}, ${lok} dapat memangkas tagihan listrik secara signifikan${r.bateraiKWh ? ", tetap memiliki listrik saat PLN padam," : ""} sekaligus berkontribusi pada lingkungan yang lebih bersih. Tim ${P} siap mendampingi mulai dari desain, pengadaan, instalasi, perizinan SLO, hingga layanan purna jual.`;
  }

  function rakit() {
    const pr = ctx.S.proyek,
      seg = ctx.ST.segmen[pr.segmen] || ctx.ST.segmen.lain;
    const opsi = ctx.S.opsi.map((o) => {
      const pv = komponenFinal(o, "pv"),
        inv = komponenFinal(o, "inverter"),
        bat = komponenFinal(o, "baterai");
      if (inv && inv.produk && inv.produk.kw && !inv.kw) inv.kw = inv.produk.kw;
      const bateraiKWh = bat ? bat.qty * ((bat.produk && bat.produk.kwh) || bat.kwh || 0) : 0;
      return {
        id: o.id,
        label: o.label,
        judul: o.judul,
        jenis: o.jenis,
        nomor: o.nomor,
        investasi: o.total,
        subtotal: o.subtotal,
        diskon: o.diskon,
        ppn: o.ppn,
        item: o.item,
        quo: o.quo || null,
        material: o.material || [],
        layout: o.layout || null,
        produksiImg: o.produksiImg || null,
        beratPV: o.beratPV || 0,
        komponen: { pv, inverter: inv, baterai: bat },
        kWp: pv ? (pv.qty * pv.wp) / 1000 : 0,
        bateraiKWh,
        dod: bat ? o.dod || (bat.produk && bat.produk.dod) || 80 : 0,
        degradasiTahun1:
          o.degradasiTahun1 != null
            ? o.degradasiTahun1
            : pv && pv.produk && pv.produk.degradasiTahun1 != null
              ? pv.produk.degradasiTahun1
              : 1,
        degradasiTahunan:
          o.degradasiTahunan != null
            ? o.degradasiTahunan
            : pv && pv.produk && pv.produk.degradasiTahunan != null
              ? pv.produk.degradasiTahunan
              : 0.4,
        luas: o.luas || (pv ? pv.qty * ctx.ST.asumsi.luasPerPanel : 0),
        proteksi: proteksiDari(o.item),
        monitoring: monitoringDari(o, inv),
        urlQuotation: o.urlQuotation,
        biayaGantiBaterai: +o.biayaGantiBaterai || 0,
        tahunGantiBaterai: +o.tahunGantiBaterai || 0
      };
    });
    const gol = ctx.ST.tarifPLN.find((t) => t.kode === ctx.S.pln.golongan);
    const termin = ctx.ST.termin ||
      (ctx.S.opsi.find((o) => o.termin && o.termin.length) || {}).termin || [
        { persen: 50, ket: "Down Payment" },
        { persen: 50, ket: "Setelah Pemasangan" }
      ];
    const bank = ctx.ST.perusahaan.bank || (ctx.S.opsi.find((o) => o.bank) || {}).bank;
    const D = {
      perusahaan: ctx.ST.perusahaan,
      aset: window.ASSETS,
      namaSistem: ctx.ST.namaSistem,
      proyek: Object.assign({}, pr, {
        segmenLabel: pr.segmen === "lain" ? "" : seg.label,
        segmenKata: seg.kata
      }),
      pln: Object.assign({}, ctx.S.pln, {
        golonganLabel: gol ? gol.label : ctx.S.pln.golongan,
        golongan: gol ? gol.kode.replace(/\/.*/, "") : ctx.S.pln.golongan
      }),
      asumsi: ctx.S.asumsi,
      opsi,
      rekomendasi: ctx.S.rekomendasi,
      kapanLain: ctx.ST.kapanLain,
      fitur: ctx.ST.fitur,
      mengapaKami: ctx.ST.mengapaKami,
      garansi: garansiGabung(ctx.S.opsi),
      termin: termin.map((t) => ({ persen: t.persen, ket: t.ket.replace(/selesai/i, "Selesai") })),
      bank,
      timeline: ctx.S.timelineTeks
        .split("\n")
        .map((l) => l.split("|").map((s) => s.trim()))
        .filter((l) => l[0])
        .map((l) => ({ tahap: l[0], durasi: l[1] || "" })),
      kontak: ctx.S.kontak,
      tampilkanRincian: ctx.S.tampilkanRincian,
      cetakItem: !!ctx.S.cetakItem,
      catatanPenutup: ctx.ST.catatanPenutup,
      survey: ctx.surveyUntukProposal(),
      catatanPenawaran: ctx.ST.catatanPenawaran || [],
      portofolio: window.PORTOFOLIO || null,
      sales:
        ctx.S.sales && ctx.S.sales.nama
          ? {
              nama: ctx.S.sales.nama,
              wa: ctx.normWA(ctx.S.sales.wa),
              mitra: ctx.S.sales.kunci ? ctx.S.sales.mitra || "Mitra" : ""
            }
          : null
    };
    const rek = opsi.find((o) => o.id === ctx.S.rekomendasi);
    if (!ctx.S.manualAlasan) ctx.S.alasanTeks = opsi.length > 1 ? "" : alasanDefault(rek);
    D.alasanManual = !!ctx.S.manualAlasan && !!ctx.S.alasanTeks.trim();
    D.alasan = ctx.S.alasanTeks
      .split("\n")
      .map((l) => l.split("|").map((s) => s.trim()))
      .filter((l) => l[0])
      .map((l) => [l[0], l[1] || ""]);
    if (!ctx.S.manualPenutup) ctx.S.penutupTeks = penutupDefault(D);
    D.penutup = ctx.S.penutupTeks;
    return D;
  }

  Object.assign(ctx, {
    produk,
    komponenFinal,
    proteksiDari,
    monitoringDari,
    garansiGabung,
    alasanDefault,
    penutupDefault,
    rakit
  });
}
