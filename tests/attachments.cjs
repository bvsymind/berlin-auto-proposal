// Small deterministic reports for exercising the original PDF, Word and image import paths.
const XLSX = require("../vendor/xlsx.full.min.js");

function surveyPDF() {
  const content =
    "BT /F1 12 Tf 50 750 Td (Jenis Atap: Genteng) Tj 0 -20 Td (Luas Atap: 150 m2) Tj ET";
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${Buffer.byteLength(content)} >>\nstream\n${content}\nendstream`
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(Buffer.byteLength(pdf));
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xref = Buffer.byteLength(pdf);
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  pdf += offsets
    .slice(1)
    .map((offset) => `${String(offset).padStart(10, "0")} 00000 n \n`)
    .join("");
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return { name: "survey.pdf", mimeType: "application/pdf", buffer: Buffer.from(pdf) };
}

function surveyWord() {
  const archive = XLSX.CFB.utils.cfb_new();
  const xml =
    '<?xml version="1.0" encoding="UTF-8"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>Jenis Atap: Metal</w:t></w:r></w:p><w:p><w:r><w:t>Catatan: Laporan Word pengujian</w:t></w:r></w:p></w:body></w:document>';
  XLSX.CFB.utils.cfb_add(archive, "word/document.xml", Buffer.from(xml));
  return {
    name: "survey.docx",
    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    buffer: Buffer.from(XLSX.CFB.write(archive, { type: "buffer", fileType: "zip" }))
  };
}

function surveyPhoto() {
  return {
    name: "foto-lokasi.svg",
    mimeType: "image/svg+xml",
    buffer: Buffer.from(
      '<svg xmlns="http://www.w3.org/2000/svg" width="240" height="180"><rect width="240" height="180" fill="#64748b"/></svg>'
    )
  };
}

module.exports = { surveyPDF, surveyWord, surveyPhoto };
