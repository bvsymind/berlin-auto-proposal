# Generator Proposal PLTS — Berlin Energi

Web statis untuk membaca workbook Berlin Energi (LHS + BOQ), melengkapi data
pelanggan dan survey, menghitung proyeksi PLTS, serta menghasilkan proposal HTML
mandiri dan cetakan PDF.

## Menjalankan aplikasi

Buka `index.html` langsung di browser. Tidak ada proses build atau instalasi paket
yang diperlukan untuk memakai aplikasi. Untuk menjalankannya melalui server lokal:

```powershell
python -m http.server 8080
```

Kemudian buka `http://localhost:8080`. Untuk hosting, unggah `index.html`, `styles/`,
`js/`, `data/`, dan `vendor/` dengan struktur folder yang sama.

## Struktur folder

```text
index.html                    Kerangka dashboard dan urutan pemuatan script
styles/app.css                Tampilan dashboard, termasuk aturan responsif
data/                         Pengaturan, produk, akses, dan aset bawaan
js/
  app.js                      Entry point dashboard
  app/
    state.js                  State awal, localStorage, dan direktori sales
    imports/                  Penerapan hasil impor ke data proyek
    forms/                    Render formulir per kelompok isian
    proposal-data.js           Penyusunan data final proposal
    recommendation.js         Pemilihan rekomendasi otomatis
    images.js                 Pengolahan foto dan sampul
    preview.js                Pratinjau, pemeriksaan, dan penamaan file
    feedback.js               Toast, dialog, dan unduhan
    events.js                 Event formulir
    uploads.js                File picker dan drag-and-drop
    toolbar.js                Baru, buka, simpan, ekspor, dan cetak
    account.js                Penerapan profil akun ke sales PIC
    startup.js                Render awal
  auth/account.js             Identitas dan menu akun Cloudflare Access
  calculations/engine.js      Mesin hitung bersama dashboard dan proposal
  parsers/
    boq.js, boq/               Parser quotation/BOQ umum
    berlin.js, berlin/         Parser workbook Berlin (LHS, BOQ, Savings, DB)
    survey.js, survey/         Parser survey teks, Excel, PDF, Word, dan foto
  proposal/
    runtime.js                Koordinator modul proposal
    export.js                 Pembungkus HTML mandiri
    context.js                Asumsi aktif dan format angka/tanggal
    calculations.js           Penghitungan semua opsi
    icons.js, charts.js        Ikon SVG, grafik, dan diagram sistem
    ui.js                     Potongan UI dan daftar bagian
    analysis.js               Analisis perbandingan opsi
    sections/                 Isi proposal per bagian
    render.js                 Penyusunan dokumen dan navigasi
    interactions.js           Simulasi, tooltip, navigasi, dan event cetak
    styles.js                 CSS proposal, termasuk aturan cetak A4
    startup.js                Kerangka HTML dan pemasangan interaksi
vendor/                       PDF.js, worker PDF.js, dan SheetJS bawaan
tests/                        Pemeriksaan regresi dan pembanding versi awal
```

## Pengaturan yang dapat diedit

- `data/pengaturan.js`: identitas perusahaan, asumsi, tarif, termin, dan teks bawaan.
- `data/produk.js`: katalog produk dan spesifikasi.
- `data/akses.js`: profil pengguna dan peran Cloudflare Access.
- `data/assets.js` dan `data/portofolio.js`: aset gambar berbentuk data URL.

Aset tetap berupa data URL agar bisa disertakan dalam file proposal mandiri.
Pustaka pihak ketiga di `vendor/` dipertahankan dari versi awal.

## Pola modul dan state

Script memakai fungsi inisialisasi biasa, sehingga aplikasi tetap mendukung
`file://`. Setiap fungsi menerima `ctx`, yaitu objek dependensi untuk satu dashboard,
satu parser, atau satu proposal. Dependensi antarbagian diakses melalui objek itu;
helper yang dipakai di dalam satu modul tetap lokal. Entry point menyatakan urutan
inisialisasi secara eksplisit, sesuai urutan aplikasi semula.

State proyek (`ctx.S`), asumsi simulasi (`ctx.A`), dan nomor bagian (`ctx.NO`)
menggunakan accessor agar penggantian objek saat membuka proyek atau mereset
simulasi langsung terbaca oleh semua modul. Format proyek JSON, kunci localStorage,
aturan perhitungan, dan perilaku rekomendasi mengikuti versi awal.

`proposal/export.js` menyertakan sumber fungsi modul proposal dan mesin hitung ke
dalam HTML unduhan. Semua dependensi fungsi proposal harus tersedia melalui `ctx`
atau berasal dari API browser. Jika menambahkan modul proposal, daftarkan juga pada
`ProposalModules` di `proposal/runtime.js` dan urutan script di `index.html`.
CSS proposal tetap berada dalam fungsi di `proposal/styles.js` supaya ikut tertanam
di HTML hasil ekspor tanpa permintaan file tambahan.

Parser dan mesin hitung juga mempertahankan ekspor CommonJS untuk pemeriksaan
melalui Node.js. API parser ada di masing-masing file `api.js`.

## Pengembangan dan pemeriksaan

Paket npm hanya digunakan untuk pemformatan dan pengujian:

```powershell
npm.cmd ci
npm.cmd test
npm.cmd run format:check
```

Pengujian browser menggunakan Microsoft Edge di lokasi instalasi standar Windows.
Jika browser Chromium berada di lokasi lain, tetapkan `BROWSER_PATH` ke executable
browser tersebut sebelum menjalankan pengujian.

```powershell
$env:BROWSER_PATH = 'C:\lokasi\browser.exe'
npm.cmd run test:browser
```

- `test:check`: sintaks, referensi file lokal, dan ekspor CommonJS.
- `test:core`: parser angka/tanggal/customer, BOQ, survey, workbook sintetis, dan
  perhitungan on-grid/hybrid/hybrid off-grid/off-grid dengan kedua metode.
- `test:browser`: alur dashboard, impor, edit, rekomendasi, survey, simpan/buka,
  localStorage, simulasi/reset, event cetak, ekspor mandiri, desktop/mobile, dan
  pembukaan langsung lewat `file://`.
- `format`: merapikan format source dengan Prettier.

Fixture di `tests/fixtures/` direkam dari kode sebelum refactor. Pengujian
membandingkan hash hasil parser/perhitungan, state, HTML proposal, CSS, dan DOM
formulir setelah normalisasi whitespace format. Permintaan font dan foto eksternal
dinonaktifkan dalam pengujian agar hasilnya konsisten tanpa jaringan. Pengambilan
foto Google Drive dan autentikasi Cloudflare langsung tetap memerlukan layanan
serta akun yang sesuai.

Screenshot pengujian dan unduhan sementara disimpan di `.verification/` (diabaikan
oleh Git). Jika screenshot `before-*.png` dari sesi pembanding tersedia, pengujian
juga memeriksa kesamaan byte screenshot sebelum dan sesudah refactor. Jangan merekam
ulang fixture hanya untuk meloloskan perubahan perilaku.

## Isi repository

Workbook pelanggan dan hasil proposal di folder `examples/` sudah dihapus.
Pengujian memakai data sintetis dari `tests/workbook.cjs` dan `tests/attachments.cjs`;
berkas Excel, PDF, Word, dan gambar untuk tes dibuat di memori saat diperlukan.
Repository tidak memerlukan file contoh pelanggan untuk menjalankan tes.

`.gitignore` mengecualikan dependensi npm, hasil tes, folder deployment Vercel,
file environment lokal, dan file proyek `*.proyek.json`. Jika menyimpan kembali
contoh BOQ atau hasil proposal secara lokal, gunakan folder `examples/` yang juga
diabaikan oleh Git.

File yang diperlukan untuk hosting tetap `index.html`, `styles/`, `js/`, `data/`,
dan `vendor/`. `package.json`, `package-lock.json`, konfigurasi Prettier, dan `tests/`
dipertahankan untuk pengembangan.
