// Membungkus data + mesin hitung + tampilan menjadi SATU file HTML mandiri.
function buatHTMLProposal(D) {
  const LS = new RegExp("[" + String.fromCharCode(0x2028, 0x2029) + "]", "g");
  const data = JSON.stringify(D)
    .replace(/</g, "\\u003c")
    .replace(LS, (c) => "\\u" + c.charCodeAt(0).toString(16));
  const judul = `Proposal PLTS - ${D.proyek.lokasi || ""} | ${D.perusahaan.nama}`.replace(
    /[<>&"]/g,
    ""
  );
  return `<!doctype html>
<html lang="id"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${judul}</title>
<meta name="description" content="Proposal Pembangkit Listrik Tenaga Surya oleh ${D.perusahaan.nama}">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap" rel="stylesheet">
</head><body>
<script>
${KalkulasiFactory.toString()}
${ProposalModules.map((init) => init.toString()).join("\n")}
${ProposalRuntime.toString()}
ProposalRuntime(${data}, KalkulasiFactory(), [${ProposalModules.map((init) => init.name).join(", ")}]);
<\/script>
</body></html>`;
}
