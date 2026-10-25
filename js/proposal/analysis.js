// Compare options and compose recommendation reasoning.
// Dependencies and shared state are provided through ctx.
function initProposalAnalysis(ctx) {
  // ---------------- ANALISIS ANTAR-OPSI (kacamata pelanggan & sales berpengalaman) ----------------
  // Semua kalimat disusun dari angka opsi-opsi di proposal ini sendiri, bukan teks umum.
  const perWp = (x) => (x.kWp ? x.investasi / (x.kWp * 1000) : 0);
  const porsiTagihan = (x) => x.hasil.persenHemat || 0;
  const luasKanopi = (x) =>
    (x.item || [])
      .filter((i) => /kanopi|canopy|carport/i.test(`${i.nama} ${i.uraian}`) && +i.total > 0)
      .reduce((s, i) => s + (/m2|m²/i.test(i.satuan || "") ? +i.qty || 0 : 0), 0) ||
    ((x.item || []).some(
      (i) => /kanopi|canopy|carport/i.test(`${i.nama} ${i.uraian}`) && +i.total > 0
    )
      ? -1
      : 0);
  const kali = (v) => (v >= 1.95 ? ctx.num(v, 1) + "×" : ctx.pct(v - 1)) + " lebih";
  const jt = ctx.rs;
  // bulan saat tambahan penghematan opsi mahal menutup selisih investasinya terhadap opsi murah
  function bepSelisih(mahal, murah) {
    const sel = mahal.investasi - murah.investasi;
    if (!(sel > 0)) return null;
    const a = mahal.hasil,
      b = murah.hasil;
    if (a.kasBulan && b.kasBulan && a.bulan && a.bulan.length) {
      for (let m = 1; m <= a.bulan.length; m++) if (a.kasBulan(m) - b.kasBulan(m) >= 0) return m;
      return null;
    }
    const d = a.hematBulan1 - b.hematBulan1;
    return d > 0 ? Math.ceil(sel / d) : null;
  }
  function analisisOpsi() {
    const o = ctx.rek(),
      lain = ctx.D.opsi.filter((x) => x.id !== o.id),
      H = ctx.A.horizonTahun;
    const B = (x) => ctx.bln(x.hasil) ?? Infinity;
    const terbaikLain = (f, besar) =>
      lain.reduce((a, b) => ((besar ? f(b) > f(a) : f(b) < f(a)) ? b : a));
    const alasan = [],
      ringkas = [];
    // 1. balik modal
    const cepat = terbaikLain(B, false);
    if (B(o) < B(cepat)) {
      const d = B(cepat) - B(o);
      alasan.push([
        "Balik modal paling cepat",
        `±${B(o)} bulan (${ctx.th(o.hasil.bep)} tahun) — ${d} bulan lebih cepat dibanding ${cepat.label} (${isFinite(B(cepat)) ? B(cepat) + " bulan" : "> " + H + " tahun"}).`
      ]);
      ringkas.push(`balik modal ${d} bulan lebih cepat`);
    }
    // 2. keuntungan jangka panjang
    const untung = terbaikLain((x) => x.hasil.netProfit, true);
    if (o.hasil.netProfit > untung.hasil.netProfit) {
      const r = untung.hasil.netProfit > 0 ? o.hasil.netProfit / untung.hasil.netProfit : 0;
      alasan.push([
        `Keuntungan ${H} tahun terbesar`,
        `${jt(o.hasil.netProfit)} bersih setelah modal kembali${r ? ` — ${kali(r)} besar dibanding ${untung.label} (${jt(untung.hasil.netProfit)})` : ""}.`
      ]);
      ringkas.push(r ? `keuntungan ${H} tahun ${kali(r)} besar` : `keuntungan ${H} tahun terbesar`);
    }
    // 3. efisiensi harga per Wp
    const murahWp = terbaikLain(perWp, false);
    if (perWp(o) && perWp(o) < perWp(murahWp) * 0.97) {
      const d = 1 - perWp(o) / perWp(murahWp);
      alasan.push([
        "Biaya per Wp paling efisien",
        `${ctx.rp(perWp(o))}/Wp, ${ctx.pct(d)} lebih rendah dari ${murahWp.label} (${ctx.rp(perWp(murahWp))}/Wp)${o.kWp > murahWp.kWp ? " — skala sistem yang lebih besar menekan biaya per Wp" : ""}.`
      ]);
      ringkas.push(`harga per Wp ${ctx.pct(d)} lebih rendah`);
    }
    // 4. porsi tagihan yang terpangkas
    const hemat = terbaikLain(porsiTagihan, true);
    if (porsiTagihan(o) > porsiTagihan(hemat) * 1.1)
      alasan.push([
        "Tagihan terpangkas paling besar",
        `±${jt(o.hasil.hematBulan1)} per bulan (${ctx.pct(porsiTagihan(o), 1)} tagihan) dibanding ${jt(hemat.hasil.hematBulan1)} (${ctx.pct(porsiTagihan(hemat), 1)}) pada ${hemat.label}.`
      ]);
    // 5. tambahan investasi terhadap opsi termurah
    const termurah = terbaikLain((x) => x.investasi, false);
    if (o.investasi > termurah.investasi) {
      const m = bepSelisih(o, termurah),
        sel = o.investasi - termurah.investasi,
        dh = o.hasil.hematBulan1 - termurah.hasil.hematBulan1;
      if (m && dh > 0)
        alasan.push([
          "Tambahan investasi cepat kembali",
          `Selisih ${jt(sel)} dibanding ${termurah.label} tertutup dalam ±${m} bulan dari tambahan penghematan ±${jt(dh)} per bulan — setelah itu seluruhnya menjadi keuntungan tambahan.`
        ]);
    }
    // 6. cadangan listrik
    const tanpaBat = lain.filter((x) => (x.bateraiKWh || 0) < (o.bateraiKWh || 0));
    if (o.bateraiKWh && tanpaBat.length)
      alasan.push([
        "Listrik tetap menyala saat PLN padam",
        `Baterai ${ctx.num(o.bateraiKWh, 2)} kWh ≈ ${ctx.num(o.hasil.backupJam, 1)} jam untuk beban ${ctx.num(ctx.A.bebanBackupKW, 1)} kW; ${tanpaBat.map((x) => x.label).join(", ")} ${tanpaBat.some((x) => x.bateraiKWh) ? "memiliki cadangan lebih kecil" : "tidak memiliki cadangan"}.`
      ]);
    // 7. lebih hemat modal (bila rekomendasi justru opsi termurah)
    const mahal = terbaikLain((x) => x.investasi, true);
    if (o.investasi < mahal.investasi) {
      alasan.push([
        "Modal awal lebih ringan",
        `${jt(o.investasi)} — ${ctx.pct(1 - o.investasi / mahal.investasi)} lebih hemat dibanding ${mahal.label} (${jt(mahal.investasi)}).`
      ]);
      ringkas.push(`modal awal ${ctx.pct(1 - o.investasi / mahal.investasi)} lebih ringan`);
    }
    if (alasan.length < 2)
      alasan.push([
        `ROI ${ctx.pct(o.hasil.roi)} dalam ${H} tahun`,
        `Total penghematan ±${jt(o.hasil.totalHemat)} selama ${H} tahun dari investasi ${jt(o.investasi)}.`
      ]);

    // Kapan opsi lain lebih cocok + konsekuensinya (jujur, berbasis angka)
    const alternatif = lain.map((l) => {
      const cocok = [],
        kons = [],
        oL = ctx.esc(o.label);
      if (l.investasi < o.investasi)
        cocok.push(
          `<b>Anggaran ingin ditekan.</b> Cukup ${jt(l.investasi)} — hanya ${ctx.pct(l.investasi / o.investasi)} dari ${oL}, modal awal ${jt(o.investasi - l.investasi)} lebih ringan.`
        );
      if (B(l) < B(o))
        cocok.push(
          `<b>Prioritas balik modal tercepat.</b> ±${B(l)} bulan, ${B(o) - B(l)} bulan lebih cepat dari ${oL}.`
        );
      if ((l.bateraiKWh || 0) > (o.bateraiKWh || 0))
        cocok.push(
          `<b>Butuh listrik cadangan saat PLN padam.</b> Baterai ${ctx.num(l.bateraiKWh, 2)} kWh ≈ ${ctx.num(l.hasil.backupJam, 1)} jam untuk beban ${ctx.num(ctx.A.bebanBackupKW, 1)} kW.`
        );
      const kl = luasKanopi(l),
        ko = luasKanopi(o);
      if (ko && !kl)
        cocok.push(
          `<b>Tanpa pekerjaan struktur kanopi.</b> Panel cukup di atap eksisting (±${ctx.num(l.luas, 0)} m²), pemasangan lebih sederhana dibanding ${oL} yang memerlukan kanopi${ko > 0 ? ` ±${ctx.num(ko, 1)} m²` : ""}.`
        );
      else if (l.luas && o.luas && l.luas < o.luas * 0.8)
        cocok.push(
          `<b>Area pemasangan terbatas.</b> Hanya butuh ±${ctx.num(l.luas, 0)} m² dibanding ±${ctx.num(o.luas, 0)} m².`
        );
      if (l.jenis === o.jenis && l.kWp < o.kWp)
        cocok.push(
          `<b>Ingin memulai bertahap.</b> Mulai dari ${ctx.num(l.kWp, 2)} kWp, kapasitas dapat ditambah di tahap berikutnya (dengan penyesuaian desain & inverter).`
        );
      if (l.hasil.netProfit > o.hasil.netProfit)
        cocok.push(
          `<b>Mengejar keuntungan ${H} tahun terbesar.</b> ${jt(l.hasil.netProfit)} dibanding ${jt(o.hasil.netProfit)}.`
        );
      if (B(l) > B(o))
        kons.push(
          `balik modal ${isFinite(B(l)) ? B(l) - B(o) + " bulan lebih lama" : "lebih dari " + H + " tahun"}`
        );
      if (l.hasil.netProfit < o.hasil.netProfit)
        kons.push(`keuntungan ${H} tahun ${jt(o.hasil.netProfit - l.hasil.netProfit)} lebih kecil`);
      if (porsiTagihan(l) < porsiTagihan(o) * 0.9)
        kons.push(
          `tagihan hanya terpangkas ${ctx.pct(porsiTagihan(l), 1)} (vs ${ctx.pct(porsiTagihan(o), 1)})`
        );
      if (perWp(l) > perWp(o) * 1.03)
        kons.push(`biaya per Wp ${ctx.pct(perWp(l) / perWp(o) - 1)} lebih mahal`);
      if (l.investasi > o.investasi)
        kons.push(`investasi ${jt(l.investasi - o.investasi)} lebih besar`);
      return { l, cocok, kons };
    });
    const ringkasan = ringkas.length
      ? ringkas
          .slice(0, 3)
          .join(", ")
          .replace(/, ([^,]*)$/, " dan $1")
      : "";
    return {
      o,
      alasan: alasan.slice(0, 6),
      alternatif,
      ringkasan,
      pembanding: lain.length === 1 ? lain[0].label : "opsi lainnya"
    };
  }

  Object.assign(ctx, { perWp, porsiTagihan, luasKanopi, kali, jt, bepSelisih, analisisOpsi });
}

if (typeof module !== "undefined" && module.exports) module.exports = initProposalAnalysis;
