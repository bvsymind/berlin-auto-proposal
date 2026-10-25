// =====================================================================
//  DAFTAR PENGGUNA & PERAN — dipakai saat generator dibuka sebagai website
//  yang dilindungi Cloudflare Access (login email / Google).
//
//  PENTING: yang MENENTUKAN siapa boleh masuk adalah daftar email di
//  Cloudflare Zero Trust → Access → Policies. File ini hanya memberi
//  PROFIL bagi email yang sudah diizinkan: nama, nomor WhatsApp, dan peran.
//
//  peran:
//    "admin" — semua fitur + tautan ke pengaturan akses
//    "sales" — sales internal Berlin Energi (Sales PIC bisa diganti)
//    "mitra" — mitra/reseller: Sales PIC di proposal otomatis = dirinya sendiri,
//              tidak bisa diganti, dan proposal mencantumkan nama perusahaan mitra
//  Email yang lolos login tapi tidak ada di daftar ini dianggap "sales".
// =====================================================================
window.AKSES = {
  pengguna: [
    // { email: "admin@berlinenergi.com",  nama: "Admin Berlin Energi", wa: "",             peran: "admin" },
    // { email: "ayu@berlinenergi.com",    nama: "Bu Ayu",              wa: "62812xxxxxxx", peran: "sales" },
    // { email: "anastasia@berlinenergi.com", nama: "Bu Anastasia",     wa: "62812xxxxxxx", peran: "sales" },
    // { email: "budi@mitrasurya.co.id",   nama: "Budi",                wa: "62813xxxxxxx", peran: "mitra", perusahaan: "PT Mitra Surya" },
  ],
  // Tautan untuk admin mengelola siapa yang boleh login
  linkKelolaAkses: "https://one.dash.cloudflare.com/"
};
