// =====================================================================
//  AKUN — mengenali pengguna yang login lewat Cloudflare Access.
//  • Dibuka dari file lokal (file://) atau tanpa Cloudflare Access → diam saja.
//  • Di website: ambil email dari /cdn-cgi/access/get-identity, cocokkan
//    dengan data/akses.js, tampilkan nama + peran + tombol Keluar di header,
//    lalu kirim event "akun-siap" untuk app.js (mengisi Sales PIC).
// =====================================================================
(function () {
  const AK = window.AKSES || { pengguna: [] };
  window.PENGGUNA = null;
  const esc = (s) =>
    String(s ?? "").replace(
      /[&<>"']/g,
      (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]
    );
  const LABEL = { admin: "Admin", sales: "Sales", mitra: "Mitra" };

  async function muat() {
    if (!/^https?:$/.test(location.protocol) || /^(localhost|127\.)/.test(location.hostname))
      return;
    let id;
    try {
      const r = await fetch("/cdn-cgi/access/get-identity", {
        credentials: "include",
        cache: "no-store"
      });
      if (!r.ok) return;
      id = await r.json();
    } catch (e) {
      return;
    }
    const email = String((id && id.email) || "").toLowerCase();
    if (!email) return;
    const p = (AK.pengguna || []).find((x) => String(x.email || "").toLowerCase() === email) || {};
    window.PENGGUNA = {
      email,
      nama: p.nama || id.name || email.split("@")[0],
      wa: p.wa || "",
      peran: LABEL[p.peran] ? p.peran : "sales",
      perusahaan: p.perusahaan || "",
      terdaftar: !!p.email
    };
    tampil();
    document.dispatchEvent(new CustomEvent("akun-siap", { detail: window.PENGGUNA }));
  }

  function tampil() {
    const u = window.PENGGUNA,
      h = document.querySelector("header");
    if (!u || !h) return;
    const el = document.createElement("div");
    el.className = "akun";
    el.innerHTML = `<button class="akun-btn" aria-haspopup="true" title="${esc(u.email)}"><span class="av">${esc(
      u.nama
        .replace(/^(bu|pak|ibu|bpk)\.?\s+/i, "")
        .slice(0, 1)
        .toUpperCase()
    )}</span><span class="nm">${esc(u.nama)}<small>${LABEL[u.peran]}${u.perusahaan ? " · " + esc(u.perusahaan) : ""}</small></span></button>
      <div class="akun-menu" hidden>
        <div class="am-h"><b>${esc(u.nama)}</b><span>${esc(u.email)}</span><em class="pr-${u.peran}">${LABEL[u.peran]}${u.perusahaan ? " · " + esc(u.perusahaan) : ""}</em></div>
        ${!u.terdaftar ? `<p class="am-note">Profil belum ada di data/akses.js — minta admin menambahkan nama & nomor WhatsApp Anda.</p>` : ""}
        ${u.peran === "admin" ? `<a href="${esc(AK.linkKelolaAkses)}" target="_blank" rel="noopener">Kelola akses pengguna (Cloudflare) ↗</a>` : ""}
        <a href="/cdn-cgi/access/logout" class="am-out">Keluar</a>
      </div>`;
    h.appendChild(el);
    const btn = el.querySelector(".akun-btn"),
      menu = el.querySelector(".akun-menu");
    btn.onclick = (e) => {
      e.stopPropagation();
      menu.hidden = !menu.hidden;
    };
    document.addEventListener("click", (e) => {
      if (!el.contains(e.target)) menu.hidden = true;
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") menu.hidden = true;
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", muat);
  else muat();
})();
