// Parse quotation text into normalized BOQ data.
// Dependencies and shared state are provided through ctx.
function initParsersBoqQuotation(ctx) {
  // -------------------------------------------------------------------
  // Pembaca utama — teks hasil ekstraksi → data quotation
  // -------------------------------------------------------------------
  function bacaTeks(teks, opsi = {}) {
    const fmt = opsi.formatTanggal || "MDY";
    const T = teks.replace(/ /g, " ");
    const satu = T.replace(/\s+/g, " ");
    const ambil = (re, s = satu) => {
      const m = s.match(re);
      return m ? m[1].trim() : "";
    };
    const POLA_TGL =
      "(\\d{1,2}[\\/\\-.]\\d{1,2}[\\/\\-.]\\d{2,4}|\\d{4}-\\d{2}-\\d{2}|\\d{1,2}\\s+[A-Za-z]+\\s+\\d{4})";

    const hasil = { peringatan: [] };
    hasil.tanggal = ctx.tanggal(
      ambil(new RegExp("\\b(?:DATE|TANGGAL|TGL)\\.?\\s*:?\\s*" + POLA_TGL, "i")),
      fmt
    );
    hasil.berlakuSampai = ctx.tanggal(
      ambil(
        new RegExp(
          "(?:VALID\\s*UNTIL|BERLAKU\\s*(?:S\\/D|SAMPAI|HINGGA))\\s*:?\\s*" + POLA_TGL,
          "i"
        )
      ),
      fmt
    );
    hasil.nomor = ambil(
      /(?:QUOTE\s*NO|QUOTATION\s*NO|NO\.?\s*(?:PENAWARAN|QUOTATION|QUO))\.?\s*:?\s*([A-Z0-9][A-Z0-9\/\-.]*\/[A-Z0-9\/\-.]+|[A-Z0-9\-.\/]{4,})/i
    );
    hasil.idCustomer = ambil(/CUSTOMER\s*ID\s*:?\s*([A-Z0-9\-]+)/i);

    // Nama customer: setelah kata CUSTOMER (bukan CUSTOMER ID) sampai Context Notes / tabel
    const cust = ambil(
      /CUSTOMER(?!\s*ID)(?!\s*Acceptance)\s*:?\s*(.+?)\s*(?=Context\s*Notes|No\.?\s+(?:Code|Uraian|Item|Desc)|\bNo\s+Code\b|$)/i
    );
    Object.assign(hasil, ctx.pecahCustomer(cust));

    const catatanKonteks = ambil(
      /Context\s*Notes?\s*:?\s*(.+?)\s*(?=No\.?\s+(?:Code|Uraian|Item|Desc|Product)|\b1\s+[A-Z])/i
    );
    hasil.catatan = catatanKonteks;
    const seg = catatanKonteks
      .split("|")
      .map((s) => s.trim())
      .filter(Boolean);
    const lab = (seg[0] || "").match(
      /^(Opsi|Option|Pilihan|Alternatif)\s*([A-Z0-9]+)\s*[:\-–]\s*(.*)$/i
    );
    hasil.labelOpsi = lab ? `Opsi ${lab[2].toUpperCase()}` : "";
    hasil.judulOpsi = lab ? lab[3].trim() : seg[0] || "";
    hasil.peruntukan = seg.length > 1 ? seg[seg.length - 1] : "";

    // Bagian tabel item
    const kepala = satu.match(
      /\bNo\.?\s+(?:Code|Uraian|Item|Desc|Product|Deskripsi)\b.*?\bTotal(?:\s*Price|\s*Harga)?\b/i
    );
    const mulai = kepala ? kepala.index + kepala[0].length : 0;
    const sisa = satu.slice(mulai);
    const akhir = sisa.search(/\b[Ss]ub\s*[Tt]otal\b|\bT O T A L\b|\bTOTAL\b|\bTerbilang\b/);
    const bagian = " " + (akhir >= 0 ? sisa.slice(0, akhir) : sisa);
    hasil.item =
      opsi.itemExcel && opsi.itemExcel.length ? opsi.itemExcel : ctx.itemDariTeks(bagian);

    hasil.subtotal = ctx.angka(ambil(/Sub\s*Total\s*[:\-]?\s*(?:Rp\.?\s*)?([\d.,]{4,})/i));
    hasil.diskon =
      ctx.angka(ambil(/(?:Discount|Diskon|Potongan)[^\d]{0,15}?(?:Rp\.?\s*)?([\d.,]{4,})/i)) || 0;
    hasil.ppn =
      ctx.angka(
        ambil(/(?:PPN|VAT|Tax)\s*(?:\d{1,2}\s*%)?\s*[:\-]?\s*(?:Rp\.?\s*)?([\d.,]{4,})/i)
      ) || 0;
    hasil.total = ctx.angka(
      ambil(
        /(?<![Ss]ub\s?)\bT\s?O\s?T\s?A\s?L\b(?!\s*Price)\s*(?:\+\s*VAT)?\s*[:\-]?\s*(?:Rp\.?\s*)?([\d.,]{4,})/
      )
    );
    hasil.terbilang = ambil(/Terbilang\s*:?\s*(.+?Rupiah)/i);

    // Syarat & ketentuan
    const sk = ambil(
      /(?:TERMS\s*(?:AND|&)\s*CONDITIONS|SYARAT\s*(?:DAN|&)\s*KETENTUAN|Catatan)\s*:?\s*(.+?)(?=Customer\s*Acceptance|Hormat\s*kami|If\s+you\s+have|$)/i
    );
    hasil.syaratTeks = sk;
    hasil.garansi = [];
    const reG =
      /(\d{1,2})\s*(?:years?|tahun|thn)\s*(?:for|untuk)\s*([A-Za-z][A-Za-z \-&]*?)(?=\s*(?:-|\d+\s*(?:years?|tahun)|\d\.\s|$|,|\n))/gi;
    let g;
    while ((g = reG.exec(sk))) hasil.garansi.push({ item: g[2].trim(), tahun: +g[1] });
    hasil.termin = [];
    const top =
      ambil(
        /(?:Term\s*Of\s*Payment|Termin|Pembayaran)\s*:?\s*(.+?)(?=\d\.\s*(?:Payment|Pembayaran\s*transfer|Bank|Rekening)|Payment\s*transfer|Nomor\s*rekening|$)/i,
        sk
      ) || sk;
    const reT = /(\d{1,3})\s*%\s*([A-Za-z][A-Za-z \/]*?)(?=\s*(?:-|\d{1,3}\s*%|\d\.\s|,|;|$))/g;
    let t;
    while ((t = reT.exec(top))) hasil.termin.push({ persen: +t[1], ket: t[2].trim() });
    const bank = sk.match(
      /\b(BCA|BRI|BNI|Mandiri|BSI|CIMB(?:\s*Niaga)?|Permata|Danamon|BTN|OCBC|Panin)\b\s*[:\-]?\s*([\d][\d\- ]{5,}\d)\s*[-–,]?\s*(?:a\.?n\.?|atas\s*nama)?\s*([A-Za-z][A-Za-z .]+?)(?=\s*(?:Customer|\d\.|$|If\s+you))/i
    );
    hasil.bank = bank
      ? { nama: bank[1], nomor: bank[2].trim(), atasNama: bank[3].replace(/^[-\s]+/, "").trim() }
      : null;
    const kontak = satu.match(/contact\s+([A-Za-z .]+?)\s*\|\s*(\+?[\d][\d\- ]{7,})/i);
    hasil.kontak = kontak ? { nama: kontak[1].trim(), telepon: kontak[2].trim() } : null;

    // Validasi
    const jml = hasil.item.reduce((a, b) => a + (b.total || 0), 0);
    if (!hasil.item.length) hasil.peringatan.push("Tabel item tidak terbaca — periksa format BOQ.");
    hasil.item.forEach((it) => {
      if (
        it.harga &&
        it.qty &&
        Math.abs(it.harga * it.qty - it.total) > Math.max(2, it.total * 0.005)
      )
        hasil.peringatan.push(
          `Item ${it.no} "${it.uraian}": qty × harga (${Math.round(it.qty * it.harga).toLocaleString("id-ID")}) ≠ total (${it.total.toLocaleString("id-ID")}).`
        );
    });
    if (!hasil.subtotal) hasil.subtotal = jml;
    else if (Math.abs(hasil.subtotal - jml) > 2)
      hasil.peringatan.push(
        `Jumlah item (${jml.toLocaleString("id-ID")}) berbeda dengan SubTotal (${hasil.subtotal.toLocaleString("id-ID")}).`
      );
    if (!hasil.total) hasil.total = hasil.subtotal - hasil.diskon + hasil.ppn;
    if (!hasil.tanggal) hasil.peringatan.push("Tanggal quotation tidak ditemukan.");
    if (!hasil.nomor) hasil.peringatan.push("Nomor quotation tidak ditemukan.");
    return hasil;
  }

  Object.assign(ctx, { bacaTeks });
}

if (typeof module !== "undefined" && module.exports) module.exports = initParsersBoqQuotation;
