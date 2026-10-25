// Original proposal stylesheet, including print and responsive rules.
// Dependencies and shared state are provided through ctx.
function initProposalStyles(ctx) {
  // ---------------------------- CSS ----------------------------
  const CSS = `
  :root{color-scheme:light;--navy:#0A1A5C;--n2:#13267A;--b:#1D3A9E;--b5:#3157D5;--bs:#EEF2FB;--acc:#C1121F;--acc7:#8E0E17;--as:#FDEEEF;--gold:#F2A900;--ink:#0F172A;--ink2:#334155;--mut:#64748B;--line:#E3E8F2;--bg:#ECEFF5;--neg:#F4B4BA;--r:14px}
  *{box-sizing:border-box}html{scroll-behavior:smooth;scroll-padding-top:72px}
  body{margin:0;background:var(--bg);color:var(--ink);font:14px/1.6 Poppins,"Segoe UI",system-ui,sans-serif;-webkit-print-color-adjust:exact;print-color-adjust:exact}
  .ic{width:1.15em;height:1.15em;vertical-align:-.2em;flex:none}
  b{font-weight:600}h1,h2,h3,h4{font-weight:700;margin:0;line-height:1.25;color:var(--navy)}
  a{color:var(--b)}.muted{color:var(--mut)}
  /* bar */
  #bar{position:sticky;top:0;z-index:20;display:flex;align-items:center;gap:12px;padding:10px 20px;transition:.25s}
  #bar.solid{background:rgba(10,26,92,.94);backdrop-filter:blur(8px);box-shadow:0 4px 18px rgba(10,26,92,.25)}
  #bar .lg{height:32px;background:#fff;border-radius:8px;padding:4px 9px}#bar .lg img{height:100%}
  #nav{display:flex;gap:4px;overflow-x:auto;flex:1;scrollbar-width:none}#nav::-webkit-scrollbar{display:none}
  #nav a{color:#CBD5E1;text-decoration:none;font-size:12.5px;padding:6px 11px;border-radius:99px;white-space:nowrap}
  #bar:not(.solid) #nav a{color:var(--ink2);background:rgba(255,255,255,.85)}
  #nav a.on,#nav a:hover{background:var(--acc)!important;color:#fff!important}
  .tb{display:flex;gap:6px}.tb button{border:0;cursor:pointer;display:inline-flex;align-items:center;gap:6px;font:500 12.5px Poppins,sans-serif;padding:8px 12px;border-radius:99px;background:#fff;color:var(--navy)}
  .tb button.on{background:var(--gold)}
  /* sheets */
  #doc{padding:8px 0 40px}
  .sheet{width:210mm;max-width:calc(100% - 32px);margin:22px auto;background:#fff;border-radius:18px;padding:15mm 15mm 16mm;box-shadow:0 10px 30px rgba(15,23,42,.08);position:relative;overflow:hidden}
  .sheet:not(.cover):before{content:"";position:absolute;left:0;top:0;width:100%;height:5px;background:linear-gradient(90deg,var(--navy) 0 82%,var(--acc) 82%)}
  .sh{display:flex;gap:14px;align-items:center;margin-bottom:18px;padding-bottom:14px;border-bottom:1px solid var(--line)}
  .sh .no{flex:none;width:46px;height:46px;border-radius:12px;display:grid;place-items:center;background:var(--navy);color:#fff;font-weight:700;font-size:16px;box-shadow:inset 0 -4px 0 var(--acc)}
  .sh h2{font-size:23px;letter-spacing:-.01em}.sh p{margin:2px 0 0;color:var(--mut);font-size:12.8px}.sh>div{flex:1}
  .sh-logo{height:30px;opacity:.9}
  .h3{font-size:15px;margin:22px 0 10px;color:var(--navy);display:flex;align-items:center;gap:9px;text-transform:uppercase;letter-spacing:.04em}.h3 small{color:var(--mut);font-weight:400;font-size:12px;text-transform:none;letter-spacing:0}
  .h3.opt-h{background:var(--navy);color:#fff;padding:8px 14px;border-radius:10px}.h3.opt-h:before{background:var(--acc)}
  .h3:before{content:"";width:5px;height:16px;border-radius:2px;background:var(--acc)}.h3.m0{margin-top:0}.h3.sub{font-size:13.5px}
  .lead{font-size:14.5px;color:var(--ink2);margin:0 0 14px}
  .note{font-size:12.3px;color:var(--mut);margin:10px 0 0}.fine{font-size:11.3px;color:var(--mut);margin-top:16px}
  .card{border:1px solid var(--line);border-radius:var(--r);padding:16px;background:#fff}.card h4{font-size:13.5px;margin-bottom:10px;display:flex;gap:8px;align-items:center}.card h4 .ic{color:var(--acc)}
  .two{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin:14px 0}.two.w60{grid-template-columns:1.25fr 1fr;align-items:start}
  /* cover */
  .cover{padding:0;min-height:297mm;display:flex;flex-direction:column;background:#fff}
  .cv-photo{position:relative;height:150mm;overflow:hidden}.cv-photo>img{width:100%;height:100%;object-fit:cover;display:block}
  .cv-photo.plan{background:linear-gradient(135deg,var(--navy) 0%,var(--n2) 55%,var(--b) 100%)}
  .cv-photo.plan:before{content:"";position:absolute;inset:0;background:repeating-linear-gradient(115deg,rgba(255,255,255,.035) 0 2px,transparent 2px 26px)}
  .cv-plan{position:absolute;right:15mm;top:24mm;bottom:9mm;margin:0;background:#fff;padding:5px;border-radius:12px;box-shadow:0 18px 40px rgba(0,0,0,.35);transform:rotate(1.2deg)}
  .cv-plan img{height:100%;width:auto;display:block;border-radius:8px}
  .cv-plan-txt{position:absolute;left:15mm;bottom:14mm;max-width:92mm;color:#fff;display:flex;flex-direction:column;gap:4px}
  .cv-plan-txt small{font-size:10.5px;letter-spacing:.2em;text-transform:uppercase;color:#FCA5A5;font-weight:600}.cv-plan-txt b{font-size:21px;line-height:1.25}.cv-plan-txt span{font-size:12px;color:#C7D2FE}
  .cv-shade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(10,26,92,.55) 0%,rgba(10,26,92,0) 40%,rgba(10,26,92,.15) 70%,rgba(10,26,92,.85) 100%)}
  .cv-top{position:absolute;left:0;right:0;top:0;display:flex;justify-content:space-between;align-items:center;padding:13mm 15mm 0}
  .cv-logos{display:flex;align-items:center;gap:12px;background:#fff;border-radius:14px;padding:10px 16px;box-shadow:0 8px 24px rgba(0,0,0,.18)}.cv-logos img{height:46px}.cv-logos img.trang{height:44px}.cv-logos i{width:1px;height:38px;background:var(--line)}
  .cv-doc{font-size:10.5px;letter-spacing:.06em;color:#fff;background:rgba(10,26,92,.55);border:1px solid rgba(255,255,255,.3);padding:6px 12px;border-radius:99px;max-width:55%;text-align:right}
  .cv-body{position:relative;padding:12mm 15mm 0;flex:1}
  .cv-body:before{content:"";position:absolute;left:15mm;top:0;width:70px;height:6px;background:var(--acc);transform:translateY(-50%);border-radius:3px}
  .eyebrow{display:inline-block;font-size:12px;letter-spacing:.24em;text-transform:uppercase;color:var(--acc);font-weight:700;margin-bottom:8px}
  .cover h1{font-size:40px;line-height:1.08;letter-spacing:-.015em;color:var(--navy);text-transform:uppercase}
  .cv-cap{display:flex;flex-wrap:wrap;gap:8px;margin:14px 0 6px}.cv-cap span{font-size:13px;font-weight:600;background:var(--bs);color:var(--navy);padding:6px 14px;border-radius:99px}
  .cv-tag{font-style:italic;color:var(--mut);margin:6px 0 0;font-size:13px}
  .cv-kpi{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:16px 0 0;max-width:170mm}.cv-kpi div{border:1px solid var(--line);border-left:4px solid var(--acc);border-radius:10px;padding:8px 12px}.cv-kpi small{display:block;font-size:10px;color:var(--mut);text-transform:uppercase;letter-spacing:.08em}.cv-kpi b{font-size:15px;color:var(--navy);white-space:nowrap}
  .cv-cust{margin:18px 0 0;padding:14px 18px;border-radius:14px;background:linear-gradient(135deg,var(--navy),var(--n2));color:#fff;display:flex;flex-direction:column;gap:2px;max-width:150mm}
  .cv-cust small{font-size:10.5px;letter-spacing:.16em;text-transform:uppercase;color:#C7D2FE}.cv-cust b{font-size:24px;line-height:1.2}.cv-cust span{font-size:12.5px;color:#E2E8F0}.cv-cust .addr .ic{color:#FCA5A5}
  .cv-foot{display:grid;grid-template-columns:auto auto auto 1fr;gap:26px;align-items:end;padding:8mm 15mm 12mm;margin-top:10mm;border-top:1px solid var(--line)}
  .cv-foot small{display:block;font-size:10px;color:var(--mut);text-transform:uppercase;letter-spacing:.12em}.cv-foot b{font-size:13.5px;color:var(--navy)}
  .cv-contact{text-align:right;font-size:12px;color:var(--ink2);display:flex;flex-direction:column;gap:2px}.cv-contact .ic{color:var(--acc)}
  /* toc & surat */
  .letter{font-size:13.3px;color:var(--ink2)}.letter p{margin:0 0 10px}
  .toc-h{font-size:17px;margin:20px 0 10px;display:flex;gap:8px;align-items:center}.toc-h .ic{color:var(--acc)}
  .toc-list{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:1fr 1fr;gap:6px 14px}
  .toc-list a{display:flex;gap:12px;align-items:center;text-decoration:none;padding:8px 10px;border-radius:10px;border:1px solid var(--line)}.toc-list a:hover{border-color:var(--acc);background:var(--as)}
  .tn{flex:none;width:32px;height:32px;border-radius:9px;background:var(--bs);color:var(--navy);display:grid;place-items:center;font-weight:700;font-size:13px}
  .tt b{display:block;color:var(--navy);font-size:13px;line-height:1.3}.tt small{color:var(--mut);font-size:11px}
  /* ringkasan */
  .sys-card{border:1px solid var(--line);border-radius:16px;overflow:hidden}
  .sc-h{background:var(--navy);color:#fff;padding:12px 16px;display:flex;flex-direction:column}.sc-h small{color:#C7D2FE;font-size:11px;text-transform:uppercase;letter-spacing:.12em}.sc-h b{font-size:18px}
  .sc-t{width:100%;border-collapse:collapse;font-size:13px}.sc-t td{padding:10px 14px;border-bottom:1px solid var(--line)}.sc-t tr:last-child td{border-bottom:0}.sc-t td:first-child{width:36px;color:var(--acc)}.sc-t .ic{width:22px;height:22px}.sc-t .r{text-align:right;font-weight:600;color:var(--navy);white-space:nowrap}
  .hero-kpi{background:linear-gradient(135deg,var(--navy),var(--b));border-radius:18px;padding:16px;color:#fff;margin:14px 0 4px}
  .kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}.kpis.k5{grid-template-columns:repeat(5,1fr)}.kpis.k3{grid-template-columns:repeat(3,1fr)}.kpis.k2{grid-template-columns:repeat(2,1fr)}
  .kpi{background:var(--bs);border-radius:14px;padding:12px 12px 10px;position:relative}
  .hero-kpi .kpi{background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.14)}
  .kpi .ki{width:30px;height:30px;border-radius:9px;display:grid;place-items:center;background:var(--navy);color:#fff;margin-bottom:8px}.hero-kpi .kpi .ki{background:var(--acc)}
  .kpi .kv{font-size:18px;font-weight:700;color:var(--navy);white-space:nowrap;letter-spacing:-.01em}.hero-kpi .kv{color:#fff}
  .kpi .kl{font-size:11.3px;color:var(--mut);line-height:1.35}.hero-kpi .kl{color:#C7D2FE}
  .opts td{white-space:nowrap}.opts .pill{margin-left:6px}.tbl tr.rec-row td{background:#FEF9E7!important}
  .ijr{padding:12px 12px 8px;overflow-x:auto}
  .ij{display:flex;min-width:560px}
  .ij-s{flex:1;position:relative;padding:9px 10px 9px 22px;margin-right:-8px;clip-path:polygon(0 0,calc(100% - 14px) 0,100% 50%,calc(100% - 14px) 100%,0 100%,14px 50%);color:#fff;display:flex;flex-direction:column;justify-content:center;min-height:74px}
  .ij-s:first-child{clip-path:polygon(0 0,calc(100% - 14px) 0,100% 50%,calc(100% - 14px) 100%,0 100%);padding-left:12px;border-radius:10px 0 0 10px}
  .ij-s:last-child{clip-path:polygon(0 0,100% 0,100% 100%,0 100%,14px 50%);margin-right:0;border-radius:0 10px 10px 0}
  .ij-s.inv{background:#B3121D}.ij-s.inv2{background:#D9535C}.ij-s.bep{background:var(--gold);color:#3B2600}.ij-s.pos{background:var(--b5)}.ij-s.pos2{background:var(--navy)}
  .ij-s small{font-size:10px;opacity:.85;text-transform:uppercase;letter-spacing:.06em}.ij-s b{font-size:13.5px;line-height:1.25;white-space:nowrap}.ij-s span{font-size:10.5px;opacity:.9;line-height:1.25}
  .ij-bar{position:relative;height:6px;border-radius:3px;background:#C7D2FE;margin:12px 6px 4px;min-width:548px}.ij-bar i{position:absolute;left:0;top:0;bottom:0;border-radius:3px;background:linear-gradient(90deg,#B3121D,#F4B4BA)}
  .ij-bar em{position:absolute;top:50%;width:12px;height:12px;border-radius:50%;transform:translate(-50%,-50%);border:2px solid #fff;box-shadow:0 0 0 1px #CBD5E1}
  .ij-bar em.inv{background:#B3121D}.ij-bar em.inv2{background:#D9535C}.ij-bar em.bep{background:var(--gold)}.ij-bar em.pos{background:var(--b5)}.ij-bar em.pos2{background:var(--navy)}
  .ij-ax{display:flex;justify-content:space-between;font-size:10.5px;color:var(--mut);margin:0 6px;min-width:548px}
  .ij-z{stroke:#94A3B8;stroke-width:1.2;stroke-dasharray:4 4}.ij-ax{font:10.5px Poppins,sans-serif;fill:#94A3B8}
  .ij-d{stroke:#fff;stroke-width:3}.ij-d.inv{fill:var(--acc)}.ij-d.bep{fill:var(--gold)}.ij-d.pos{fill:var(--navy)}
  .ij-v{font:700 13.5px Poppins,sans-serif;fill:var(--navy)}.ij-v.inv{fill:var(--acc)}.ij-v.b{fill:#3B2600;font-size:13px}.ij-k{font:10.5px Poppins,sans-serif;fill:var(--mut)}.ij-k.b{fill:#5B4300}
  .ij-bep{fill:#FEF3C7;stroke:var(--gold);stroke-width:1.5}
  .tg-ln{fill:none;stroke-width:3;stroke-linejoin:round}.tg-ln.tanpa{stroke:var(--acc);stroke-dasharray:6 4}.tg-ln.s0{stroke:var(--b)}.tg-ln.s1{stroke:#0E9F6E}.tg-ln.s2{stroke:var(--gold)}.tg-ln.s3{stroke:#7C3AED}
  .tg-gap{fill:#BBF7D0;opacity:.55}.lg-inline i.tanpa{background:var(--acc)}.lg-inline i.gap{background:#BBF7D0}
  .tg-sum{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin:10px 0 6px}.tg-sum div{background:var(--bs);border-radius:12px;padding:10px 12px}.tg-sum small{display:block;font-size:11px;color:var(--mut)}.tg-sum b{font-size:16px;color:var(--navy)}
  .tg-sum .hl{background:#E8F7EF}.tg-sum .hl b{color:#166534}
  .itl{display:grid;grid-template-columns:repeat(5,1fr);position:relative;margin:6px 0 4px}
  .itl:before{content:"";position:absolute;left:10%;right:10%;top:9px;height:4px;border-radius:2px;background:linear-gradient(90deg,var(--neg) 0 40%,var(--gold) 40% 52%,var(--b5) 52%)}
  .itl-i{text-align:center;position:relative;padding:0 4px}.itl-i i{display:block;width:22px;height:22px;border-radius:50%;margin:0 auto 6px;background:#fff;border:5px solid var(--acc);position:relative}
  .itl-i.bep i{border-color:var(--gold)}.itl-i.pos i{border-color:var(--b5)}
  .itl-i small{display:block;font-size:11px;color:var(--mut)}.itl-i b{display:block;font-size:13.5px;color:var(--navy)}.itl-i span{font-size:11px;color:var(--ink2)}
  .itl-i.inv b{color:var(--acc)}.itl-i.bep b{color:#B7791F}
  .bb{display:grid;grid-template-columns:96px 1fr auto;gap:10px;align-items:center;margin:10px 0;font-size:12.5px}
  .bb div{height:14px;background:#F1F5F9;border-radius:99px;overflow:hidden}.bb i{display:block;height:100%;border-radius:99px}
  .bb .b0{background:linear-gradient(90deg,#F87171,var(--acc))}.bb .b1{background:linear-gradient(90deg,var(--b5),var(--navy))}
  .eco-mini{display:grid;gap:10px}.eco-mini div{display:grid;grid-template-columns:28px 1fr;column-gap:8px;align-items:center}
  .eco-mini .ic{grid-row:span 2;width:24px;height:24px;color:#15803D}.eco-mini b{font-size:15px;color:var(--navy)}.eco-mini span{font-size:12px;color:var(--mut)}
  /* survey */
  .callout{display:flex;gap:12px;background:var(--as);border-left:4px solid var(--acc);border-radius:12px;padding:12px 16px;margin:12px 0}.callout .ic{color:var(--acc);width:22px;height:22px;margin-top:2px}.callout p{margin:2px 0 0;font-size:12.8px;color:var(--ink2)}
  .maplink{display:inline-flex;gap:6px;align-items:center;font-size:12.5px;font-weight:600;text-decoration:none;margin-top:4px}
  .gal{display:grid;gap:10px}.gal.g1{grid-template-columns:1fr}.gal.g2{grid-template-columns:1fr 1fr}.gal.g3{grid-template-columns:repeat(3,1fr)}.gal.g4{grid-template-columns:repeat(4,1fr)}
  .gal figure{margin:0;border:1px solid var(--line);border-radius:12px;overflow:hidden;background:#F8FAFC}
  .gal img{width:100%;aspect-ratio:4/3;object-fit:cover;display:block}.gal figure.doc img{object-fit:contain;background:#F1F5F9}.gal figcaption{font-size:11.3px;color:var(--ink2);padding:6px 9px}
  /* desain */
  .diag{padding:10px}.sysd{width:100%;height:auto;display:block}
  .db rect{fill:#fff;stroke:var(--line);stroke-width:1.5}.db.main rect{fill:var(--navy);stroke:var(--navy)}.db .di{color:var(--acc)}.db.main .di{color:#fff}
  .dt{font:600 13px Poppins,sans-serif;fill:var(--navy)}.ds{font:11px Poppins,sans-serif;fill:var(--mut)}.db.main .dt{fill:#fff}.db.main .ds{fill:#C7D2FE}
  .dl{fill:none;stroke-width:3}.dl.dc{stroke:var(--acc)}.dl.ac{stroke:var(--b5)}.dl.sg{stroke:#94A3B8;stroke-width:1.8}
  .am.dc{fill:var(--acc)}.am.ac{fill:var(--b5)}.am.sg{fill:#94A3B8}
  .dlab{font:600 10.5px Poppins,sans-serif;fill:var(--mut)}.dleg text{font:11px Poppins,sans-serif;fill:var(--mut)}.dleg .dc{fill:var(--acc)}.dleg .ac{fill:var(--b5)}.dleg .sg{fill:#94A3B8}
  .cfg{margin-top:12px}
  .plan{margin:0;padding:10px;text-align:center}.plan img{max-width:100%;max-height:150mm;border-radius:8px}.plan figcaption,.pvw figcaption{font-size:11.5px;color:var(--mut);margin-top:6px}
  .chips{display:flex;flex-wrap:wrap;gap:8px}.chips span{display:inline-flex;gap:6px;align-items:center;font-size:12.3px;padding:6px 12px;border-radius:99px;background:var(--bs);color:var(--navy)}.chips .ic{color:var(--acc)}
  .chips.cl span{background:#fff;border:1px solid var(--line)}.chips.pt span{background:#F8FAFC;font-size:11.8px}
  /* produk */
  .prods{display:grid;gap:12px}.prods.c2{grid-template-columns:1fr 1fr}.prods.c3{grid-template-columns:repeat(3,1fr)}
  .prod{border:1px solid var(--line);border-radius:16px;overflow:hidden;break-inside:avoid;display:flex;flex-direction:column;background:#fff}
  .prod header{display:flex;gap:10px;align-items:center;padding:12px 14px;background:linear-gradient(135deg,var(--navy),var(--n2));color:#fff}
  .pi{flex:none;width:36px;height:36px;border-radius:10px;background:var(--acc);color:#fff;display:grid;place-items:center}.pi .ic{width:20px;height:20px}
  .prod header small{display:block;font-size:10px;text-transform:uppercase;letter-spacing:.12em;color:#FCA5A5;font-weight:600}.prod header b{display:block;font-size:14.5px;color:#fff;line-height:1.2}.prod header span{display:block;font-size:11px;color:#C7D2FE;word-break:break-all}
  .prod .qty{font-size:12px;font-weight:600;color:var(--navy);background:var(--bs);padding:6px 14px}
  .ks{display:grid;grid-template-columns:auto 1fr;gap:4px 10px;margin:10px 14px 4px;font-size:12px}.ks dt{color:var(--mut)}.ks dd{margin:0;font-weight:600;color:var(--ink);text-align:right}
  .prod .checks{margin:6px 14px 10px;flex:1}
  .prod footer{display:flex;justify-content:space-between;align-items:center;gap:8px;padding:9px 14px;border-top:1px dashed var(--line)}
  .wb{display:inline-flex;gap:5px;align-items:center;font-size:11px;font-weight:600;color:var(--acc);white-space:nowrap}
  .ds-link{display:inline-flex;gap:5px;align-items:center;font-size:11.5px;font-weight:600;color:var(--b);text-decoration:none;border:1px solid var(--line);border-radius:99px;padding:4px 11px}.ds-link:hover{background:var(--bs)}
  .checks{list-style:none;margin:0;padding:0;font-size:12.3px}.checks li{padding:3px 0 3px 22px;position:relative;color:var(--ink2)}
  .checks li:before{content:"";position:absolute;left:0;top:6px;width:15px;height:15px;border-radius:5px;background:var(--as) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23C1121F' stroke-width='3'%3E%3Cpath d='m5 12 5 5L20 7'/%3E%3C/svg%3E") center/10px no-repeat}
  /* produksi */
  .calc{display:grid;gap:8px}.calc div{display:grid;grid-template-columns:110px 1fr auto;gap:10px;align-items:center;background:#F8FAFC;border-radius:12px;padding:9px 12px}
  .calc small{color:var(--mut);font-size:11.5px}.calc code{font-family:inherit;font-size:12px;color:var(--ink2)}.calc b{color:var(--navy);white-space:nowrap;font-size:13px}
  .pvw{margin:14px 0 0;padding:8px;text-align:center}.pvw img{width:100%;border-radius:6px;display:block}
  .cov{display:flex;gap:14px;align-items:center;margin-top:12px}.cov p{margin:0;font-size:12.3px;color:var(--ink2)}
  .gauge{--p:50;flex:none;width:118px;height:118px;border-radius:50%;display:grid;place-items:center;background:conic-gradient(var(--b5) calc(var(--p)*1%),#E2E8F0 0)}
  .gauge>div{width:90px;height:90px;border-radius:50%;background:#fff;display:grid;place-content:center;text-align:center}.gauge b{font-size:22px;color:var(--navy)}.gauge span{font-size:9.5px;color:var(--mut);max-width:80px;line-height:1.2}
  /* tabel */
  .tw{overflow-x:auto;border-radius:12px;border:1px solid var(--line);margin:8px 0}
  .tbl{width:100%;border-collapse:collapse;font-size:12.6px}
  .tbl th,.tbl td{padding:8px 12px;text-align:left;border-bottom:1px solid var(--line);vertical-align:top}
  .tbl thead th{background:var(--navy);color:#fff;font-weight:600;font-size:11.8px;white-space:nowrap}
  .tbl thead th em{display:inline-block;margin-left:6px;font-style:normal;font-size:10px;background:var(--acc);color:#fff;padding:1px 8px;border-radius:99px}
  .tbl thead th.rec{background:var(--acc7)}
  .tbl tbody tr:nth-child(even){background:#F8FAFC}.tbl tbody tr:last-child td,.tbl tbody tr:last-child th{border-bottom:0}
  .tbl.kv th{width:44%;background:#F8FAFC;color:var(--ink2);font-weight:600}.tbl.kv tr:nth-child(even){background:#fff}
  .tbl.num td:not(:first-child):not(:nth-child(2)){text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap}
  .tbl.sm{font-size:11.5px}.tbl.sm td,.tbl.sm th{padding:5px 9px}.tbl small{display:block;color:var(--mut);font-size:10.8px}
  .bep-t td{text-align:right!important;font-variant-numeric:tabular-nums;white-space:nowrap}.bep-t td:first-child{text-align:center!important}
  .bep-t tr.is-neg td:nth-child(5){color:var(--acc)}.bep-t tr.inv{background:var(--as)!important}.bep-t tr.bep-row{background:#FEF3C7!important;font-weight:600}
  .pill{display:inline-flex;gap:4px;align-items:center;background:var(--gold);color:#3B2600;padding:2px 8px;border-radius:99px;font-size:11px;font-weight:600}
  .mut{color:var(--mut)}.pr-only{display:none}
  .tg{display:inline-grid;place-items:center;width:20px;height:20px;border-radius:6px;margin-right:4px}.tg .ic{width:14px;height:14px}.tg.ok{background:var(--bs);color:var(--b)}.tg.no{background:var(--as);color:var(--acc)}.tg.wr{background:#FEF3C7;color:#B45309}
  /* grafik */
  .chart-card{padding:12px 12px 8px;margin-top:12px}.chart{width:100%;height:auto;display:block}
  .chart .gl{stroke:#E2E8F0;stroke-width:1}.chart .gl.z{stroke:#94A3B8;stroke-width:1.4}.chart .ax{font:11px Poppins,sans-serif;fill:#64748B}
  .chart .neg{fill:var(--neg)}.chart .pos{fill:var(--b)}.chart rect[data-tip]:hover{opacity:.75}
  .chart .bep{stroke:var(--gold);stroke-width:2;stroke-dasharray:5 4}.chart .bepb{fill:var(--gold)}.chart .bept{font:600 11px Poppins,sans-serif;fill:#3B2600}
  .chart .ln{fill:none;stroke-width:3;stroke-linejoin:round}.chart .ln.s0,.lg-inline i.s0{stroke:var(--b);background:var(--b)}.chart .ln.s1,.lg-inline i.s1{stroke:var(--acc);background:var(--acc)}
  .chart .dot{stroke:#fff;stroke-width:2}.chart .dot.s0{fill:var(--b)}.chart .dot.s1{fill:var(--acc)}
  .chart .ln.s2,.lg-inline i.s2{stroke:var(--gold);background:var(--gold)}.chart .dot.s2{fill:var(--gold)}.chart .ln.s3,.lg-inline i.s3{stroke:#0E9F6E;background:#0E9F6E}.chart .dot.s3{fill:#0E9F6E}
  td.best{background:#E8F7EF!important;font-weight:700;color:#166534}.best-key{display:inline-block;width:12px;height:12px;border-radius:3px;background:#E8F7EF;border:1px solid #86C5A0;vertical-align:-1px}
  .card.alt{background:#FFFBEB;border-color:#FDE68A;margin-top:12px}.dots{margin:0;padding-left:18px;font-size:12.3px;color:var(--ink2)}
  .lg-inline{display:flex;gap:16px;justify-content:center;font-size:12px;color:var(--mut);flex-wrap:wrap}.lg-inline i{display:inline-block;width:12px;height:12px;border-radius:3px;margin-right:6px;vertical-align:-1px}
  .lg-inline i.neg{background:var(--neg)}.lg-inline i.pos{background:var(--b)}
  .sum-box{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:12px}
  .sum-box div{background:var(--bs);border-radius:12px;padding:10px 12px}.sum-box small{display:block;color:var(--mut);font-size:11px}.sum-box b{font-size:15px;color:var(--navy)}
  /* lingkungan */
  .eco{display:grid;grid-template-columns:1fr 1.5fr;gap:14px}
  .eco-hero{background:linear-gradient(160deg,#166534,#14532D);color:#fff;border-radius:18px;padding:22px;display:flex;flex-direction:column;justify-content:center}
  .eco-hero>div .ic{width:42px;height:42px}.eco-hero b{font-size:34px;line-height:1.1;margin-top:10px}.eco-hero span{font-size:13px}.eco-hero em{font-style:normal;font-size:12px;opacity:.85;margin-top:8px}
  .eco-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.eco-grid .kpi{background:#F0FDF4}.eco-grid .kpi .ki{background:#166534}.eco-grid .kpi .kv{font-size:17px}
  /* penawaran */
  .q-head{display:grid;grid-template-columns:1fr 1.4fr .8fr 1.4fr;gap:10px;margin-bottom:8px}.q-head div{background:var(--bs);border-radius:10px;padding:8px 12px}.q-head small{display:block;font-size:10.5px;color:var(--mut);text-transform:uppercase;letter-spacing:.08em}.q-head b{font-size:12.5px;color:var(--navy)}
  .quo td:nth-child(3){color:var(--ink2);font-size:12px;white-space:normal!important;text-align:left!important}
  .tbl .tot td{padding:7px 12px;text-align:right!important;font-variant-numeric:tabular-nums;white-space:nowrap;border-top:1px solid var(--line);background:#fff!important}.tbl .tot td:first-child{color:var(--ink2)}
  .tbl .tot tr.disc td:last-child{color:var(--acc)}.tbl .tot tr.grand td{background:var(--navy)!important;color:#fff;font-weight:700;font-size:14px}.tbl .tot tr.pw td{font-size:11.5px;color:var(--mut)}.tbl .tot tr{break-inside:avoid}
  .terbilang{font-size:12px;color:var(--ink2);margin:4px 0 0}
  .boq tr.cat td{background:var(--bs)!important;font-weight:700;color:var(--navy)}
  details.items{margin-top:14px}details.items summary{cursor:pointer;font-weight:600;color:var(--b);font-size:13px;padding:8px 0;display:flex;gap:8px;align-items:center}
  .terms{margin:0;padding-left:20px;font-size:12.3px;color:var(--ink2)}.terms li{margin:3px 0}
  /* garansi & pembayaran */
  .warranty{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px}
  .warranty div{border-radius:14px;padding:14px 12px;text-align:center;background:var(--navy);color:#fff}
  .warranty b{display:block;font-size:22px;color:#fff}.warranty span{font-size:12px;color:#C7D2FE}.warranty em{display:block;font-style:normal;font-size:10.5px;color:#C7D2FE}
  .pay{display:grid;grid-template-columns:repeat(${Math.max(1, (ctx.D.termin || []).length)},1fr);gap:10px}
  .pay-i{border:1px solid var(--line);border-radius:14px;padding:12px;display:flex;flex-direction:column;gap:6px}
  .pay-p b{display:inline-block;font-size:22px;color:var(--acc)}.pay-i>div:last-child b{display:block;font-size:12.5px;color:var(--navy);line-height:1.3}.pay-i span{display:block;font-size:12px;color:var(--ink2);font-variant-numeric:tabular-nums}
  .bank{display:flex;gap:14px;align-items:center;border:1px dashed var(--b);background:var(--bs);border-radius:14px;padding:12px 16px;margin-top:12px}.bank .ic{width:30px;height:30px;color:var(--b)}
  .bank small{display:block;font-size:11px;color:var(--mut)}.bank b{font-size:18px;color:var(--navy);letter-spacing:.02em}.bank span{display:block;font-size:12.5px}
  .timeline{list-style:none;padding:0;margin:8px 0 0;display:grid;grid-template-columns:repeat(auto-fit,minmax(110px,1fr));gap:8px}
  .timeline li{position:relative;padding:12px;border-radius:12px;background:#F8FAFC;border-top:4px solid var(--navy)}.timeline li:last-child{border-top-color:var(--acc)}
  .timeline span{display:inline-grid;place-items:center;width:24px;height:24px;border-radius:50%;background:var(--navy);color:#fff;font-size:12px;font-weight:700}
  .timeline b{display:block;font-size:12.5px;margin-top:6px;line-height:1.35}.timeline em{font-style:normal;font-size:11.5px;color:var(--mut)}
  /* tentang */
  .about{display:grid;grid-template-columns:1.5fr 1fr;gap:16px;align-items:start}.vm{font-size:12.6px;color:var(--ink2);margin:6px 0}.vm b{display:inline-block;min-width:44px;color:var(--acc)}
  .stats{display:grid;grid-template-columns:1fr 1fr;gap:8px}.stats div{background:var(--navy);color:#fff;border-radius:14px;padding:12px}.stats b{display:block;font-size:22px;line-height:1.1}.stats span{font-size:11px;color:#C7D2FE}
  .stats div:first-child{background:var(--acc)}.stats div:first-child span{color:#FFE4E6}
  .why{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.why .card{padding:13px}.why b{display:block;font-size:13px;margin-top:8px;color:var(--navy)}.why p{margin:4px 0 0;font-size:11.8px;color:var(--ink2)}
  .wi{width:34px;height:34px;border-radius:10px;background:var(--as);color:var(--acc);display:grid;place-items:center}.wi .ic{width:19px;height:19px}
  .porto{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
  .porto figure{margin:0;border-radius:14px;overflow:hidden;border:1px solid var(--line);background:#fff;break-inside:avoid}.porto img{width:100%;aspect-ratio:4/3;object-fit:cover;display:block}
  .porto figcaption{padding:8px 10px}.porto b{display:block;font-size:12.3px;color:var(--navy);line-height:1.3}.porto span{display:block;font-size:11.5px;color:var(--acc);font-weight:600}.porto em{font-style:normal;font-size:11px;color:var(--mut)}
  .btn{display:inline-flex;gap:8px;align-items:center;text-decoration:none;font-weight:600;font-size:14px;padding:12px 18px;border-radius:12px;border:1px solid var(--line);color:var(--navy);margin-top:12px}
  .btn.pri{background:var(--acc);border-color:var(--acc);color:#fff;box-shadow:0 6px 18px rgba(193,18,31,.3)}.btn.ghost{background:var(--bs)}
  /* penutup */
  .next{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:8px 0}.next div{border:1px solid var(--line);border-radius:14px;padding:12px}
  .next span{display:inline-grid;place-items:center;width:26px;height:26px;border-radius:50%;background:var(--acc);color:#fff;font-weight:700;font-size:13px}.next b{display:block;margin-top:6px;color:var(--navy)}.next p{margin:2px 0 0;font-size:12px;color:var(--ink2)}
  .cta{display:flex;gap:10px;flex-wrap:wrap}
  .sign{display:grid;grid-template-columns:1fr 1fr;gap:30px;margin-top:22px}.sign p{margin:0;color:var(--mut);font-size:12.5px}.sig-space{height:64px;border-bottom:1px solid var(--ink2);margin:6px 40px 8px 0}
  .sign b{display:block;color:var(--navy)}.sign span{display:block;font-size:12px;color:var(--ink2)}
  .contact{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:22px;background:var(--navy);color:#fff;border-radius:16px;padding:16px 18px;border-bottom:5px solid var(--acc)}
  .pic{display:flex;gap:14px;align-items:center;border:1px solid var(--line);border-left:5px solid #25D366;border-radius:16px;padding:12px 16px;margin:14px 0;break-inside:avoid}
  .pic-av{flex:none;width:46px;height:46px;border-radius:50%;background:var(--navy);color:#fff;display:grid;place-items:center;font-weight:700;font-size:19px}
  .pic-t{flex:1}.pic-t small{display:block;font-size:10.5px;text-transform:uppercase;letter-spacing:.12em;color:var(--mut)}.pic-t b{display:block;font-size:16px;color:var(--navy)}.pic-t span{font-size:12px;color:var(--ink2)}
  .pic-wa{display:flex;gap:10px;align-items:center;background:#25D366;color:#fff;text-decoration:none;border-radius:12px;padding:9px 14px;font-weight:700;font-size:14px}.pic-wa .ic{width:24px;height:24px}.pic-wa small{display:block;font-size:10px;font-weight:500;opacity:.9}
  .ct-r a{color:#fff;text-decoration:none}
  .ct-l img{height:42px}.ct-l p{font-size:12px;color:#C7D2FE;margin:8px 0 0}.ct-r{display:flex;flex-direction:column;gap:4px;font-size:12.5px}.ct-r .ic{color:#FCA5A5}
  /* lampiran */
  .att{display:grid;gap:8px}.att a{display:flex;gap:12px;align-items:center;padding:12px 14px;border:1px solid var(--line);border-radius:12px;text-decoration:none;color:var(--ink)}
  .att a:hover{border-color:var(--acc);background:var(--as)}.att .ic{width:22px;height:22px;color:var(--b)}.att span{flex:1;font-size:13px}.att small{display:block;color:var(--mut);font-size:11px}.att em{font-style:normal;font-size:12px;color:var(--acc);font-weight:600;display:flex;gap:4px;align-items:center}
  /* perbandingan */
  .rec-card{background:linear-gradient(135deg,var(--navy),var(--b));color:#fff;border-radius:16px;padding:14px 18px;margin-top:14px;break-inside:avoid}
  .rc-l .ic{width:30px;height:30px;color:var(--gold)}.rc-l small{display:block;color:#C7D2FE;font-size:11px;text-transform:uppercase;letter-spacing:.1em;margin-top:4px}.rc-l b{display:block;font-size:19px}
  .reasons{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:12px}.rs{display:flex;gap:10px;border:1px solid var(--line);border-radius:12px;padding:10px 12px;break-inside:avoid}.rs>span{flex:none;width:24px;height:24px;border-radius:50%;background:var(--acc);color:#fff;display:grid;place-items:center;font-weight:700;font-size:12px}
  .rs b{font-size:13px;color:var(--navy)}.rs p{margin:2px 0 0;font-size:12px;color:var(--ink2)}
  .rc-why{margin:6px 0 0;font-size:12.5px;color:#E0E7FF;line-height:1.45}.dots li{margin:3px 0}.dots li b{color:var(--navy)}
  .kons{margin:8px 0 0;padding:8px 10px;border-radius:10px;background:#fff;border:1px dashed #FCD34D;font-size:12px;color:var(--ink2)}.kons b{color:#92400E}
  /* tooltip, simulasi, wa */
  #tip{position:fixed;z-index:50;pointer-events:none;background:var(--navy);color:#fff;font-size:12px;padding:8px 10px;border-radius:10px;box-shadow:0 8px 20px rgba(0,0,0,.25);max-width:240px}#tip b{display:block}#tip span{display:block;color:#CBD5E1}
  #sim{position:fixed;right:16px;top:70px;z-index:30;width:300px;background:#fff;border-radius:16px;box-shadow:0 18px 40px rgba(10,26,92,.25);padding:16px;border:1px solid var(--line)}
  #sim h4{display:flex;justify-content:space-between;align-items:center;margin-bottom:4px}#sim h4 button{border:0;background:none;cursor:pointer;color:var(--mut)}
  #sim p{font-size:11.5px;color:var(--mut);margin:0 0 10px}#sim label{display:block;font-size:12.5px;margin:10px 0 2px}#sim label b{float:right;color:var(--b)}
  #sim input[type=range]{width:100%;accent-color:var(--acc)}#sim .rs2{margin-top:12px;width:100%;border:1px solid var(--line);background:#F8FAFC;padding:8px;border-radius:10px;cursor:pointer;font:500 12.5px Poppins,sans-serif}
  #simBanner{display:none;position:fixed;left:50%;transform:translateX(-50%);bottom:16px;z-index:30;background:var(--gold);color:#3B2600;font-size:12.5px;font-weight:600;padding:8px 16px;border-radius:99px;box-shadow:0 6px 18px rgba(0,0,0,.2)}
  body.simulating #simBanner{display:block}
  .fab{position:fixed;right:18px;bottom:18px;z-index:25;width:56px;height:56px;border-radius:50%;background:#25D366;color:#fff;display:grid;place-items:center;box-shadow:0 8px 22px rgba(0,0,0,.25)}.fab .ic{width:30px;height:30px}
  @media screen and (max-width:760px){
    body{font-size:13.5px}.sheet{max-width:100%;margin:0 0 10px;border-radius:0;padding:26px 16px}
    .cv-photo{height:52vh}.cv-plan{top:auto;bottom:16px;right:16px;height:58%}.cv-plan-txt{left:16px;bottom:16px;max-width:45%}.cv-plan-txt b{font-size:16px}.cv-top{padding:70px 16px 0;flex-direction:column;align-items:flex-start;gap:10px}.cv-logos img{height:36px}.cv-doc{max-width:100%;text-align:left}.cv-body{padding:28px 16px 0}.cv-body:before{left:16px}.cover h1{font-size:28px}.cv-cust b{font-size:20px}
    .cv-foot{grid-template-columns:1fr 1fr;padding:18px 16px;gap:14px}.cv-contact{grid-column:span 2;text-align:left}
    .cv-kpi{grid-template-columns:1fr 1fr}.kpis,.kpis.k5,.kpis.k3{grid-template-columns:1fr 1fr}.two,.two.w60,.eco,.about,.sign,.contact,.reasons,.next,.prods.c2,.prods.c3{grid-template-columns:1fr}.why,.porto,.gal.g3,.gal.g4,.toc-list,.pay{grid-template-columns:1fr 1fr}
    .sum-box,.q-head{grid-template-columns:1fr 1fr}.calc div{grid-template-columns:1fr}.tg-sum{grid-template-columns:1fr}.sh-logo{display:none}
    .tb .t{display:none}#bar{padding:8px 10px}#sim{left:10px;right:10px;width:auto}
  }
  @page{size:A4;margin:13mm 13mm 15mm;@bottom-left{content:"${ctx.esc(ctx.P.badanUsaha || ctx.P.nama)}  ·  ${ctx.esc(ctx.P.website)}  ·  ${ctx.esc(ctx.P.telepon)}";font:8.5px Poppins,sans-serif;color:#64748B}@bottom-right{content:"Halaman " counter(page);font:600 9px Poppins,sans-serif;color:#C1121F}@top-right{content:"Proposal ${ctx.esc(ctx.D.namaSistem[ctx.rek().jenis])} — ${ctx.esc(ctx.D.proyek.lokasi)}";font:8.5px Poppins,sans-serif;color:#94A3B8}}
  @page cover{margin:0;@bottom-left{content:none}@bottom-right{content:none}@top-right{content:none}}
  @media print{
    body{background:#fff;font-size:10.5pt}#bar,#sim,#simBanner,.fab,#tip,.no-print{display:none!important}
    #doc{padding:0}.sheet{width:auto;max-width:none;margin:0;padding:0;border-radius:0;box-shadow:none;break-before:page;overflow:visible}.sheet:not(.cover):before{display:none}
    .cover{page:cover;height:297mm;min-height:0;break-before:auto}.cv-photo{height:148mm}
    .tw{overflow:visible}.card,.kpi,.calc div,.rs,.why .card,.timeline li,.sum-box,.eco,.warranty div,.chart-card,.diag,.tbl tr,.gal figure,.porto figure,.prod,.pay-i,.next div,.contact,.sign,.itl,.sys-card,.callout,.toc-list li{break-inside:avoid}
    .h3{break-after:avoid}.h3.brk{break-before:page;margin-top:0}.bep-t td,.bep-t th{padding:4px 10px}.tbl{font-size:9.3pt}
    a{color:inherit;text-decoration:none}details.items summary{display:none}
    .kpi .kv{font-size:15.5px}.sheet .sh{margin-bottom:12px}.sh-logo{height:26px}
    .pr-hide{display:none}.pr-only{display:block}.chart-card .chart{height:225px}.hero-kpi{padding:12px}.two{margin:10px 0}
    .sheet.flow{break-before:auto;margin-top:12mm}
    .chips span{font-size:8.3pt;padding:3px 9px}.chips{gap:5px}.porto figcaption{padding:5px 8px}.why .card{padding:9px}.why p{font-size:8.5pt}
    .gal.big{grid-template-columns:1fr 1fr}
    .prod .checks{font-size:8.4pt}.prod .checks li{padding:1px 0 1px 20px}.ks{font-size:8.6pt}
    .cv-photo{height:140mm}

  }`;

  Object.assign(ctx, { CSS });
}

if (typeof module !== "undefined" && module.exports) module.exports = initProposalStyles;
