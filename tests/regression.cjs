const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const { chromium } = require("playwright");
const { surveyPDF, surveyWord, surveyPhoto } = require("./attachments.cjs");
const { berlinWorkbook } = require("./workbook.cjs");

const root = path.resolve(process.env.APP_ROOT || path.join(__dirname, ".."));
const recording = process.argv.includes("--record");
const fixture = path.join(__dirname, "fixtures", "regression.json");
const resultsDir = path.join(__dirname, "..", ".verification");
fs.mkdirSync(resultsDir, { recursive: true });
const expected = recording ? {} : JSON.parse(fs.readFileSync(fixture, "utf8"));
const actual = {};
const errors = [];
const hash = (value) => crypto.createHash("sha256").update(value).digest("hex");
const server = http.createServer((req, res) => {
  const name = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
  const file = path.resolve(root, "." + (name === "/" ? "/index.html" : name));
  if (!file.startsWith(root + path.sep)) {
    res.writeHead(403).end();
    return;
  }
  fs.readFile(file, (error, bytes) => {
    if (error) {
      res.writeHead(404).end();
      return;
    }
    const type =
      {
        ".js": "text/javascript",
        ".css": "text/css",
        ".html": "text/html",
        ".xlsx": "application/octet-stream"
      }[path.extname(file)] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": type });
    res.end(bytes);
  });
});

async function main() {
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const browser = await chromium.launch({
    executablePath:
      process.env.BROWSER_PATH ||
      "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    headless: true
  });
  try {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 1000 },
      reducedMotion: "reduce",
      acceptDownloads: true
    });
    await context.addInitScript(() => {
      const NativeDate = Date;
      window.Date = class extends NativeDate {
        constructor(...args) {
          super(...(args.length ? args : ["2026-10-26T05:00:00Z"]));
        }
        static now() {
          return new NativeDate("2026-10-26T05:00:00Z").getTime();
        }
      };
      let seed = 12345;
      Math.random = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
    });
    // Keep verification deterministic and independent of external font/photo services.
    await context.route("https://**/*", (route) => route.abort());
    const page = await context.newPage();
    page.on("pageerror", (error) => errors.push(error.message));
    const url = `http://127.0.0.1:${server.address().port}/`;
    const settle = async () => {
      await page.waitForTimeout(500);
      if (await page.evaluate(() => window.__S().opsi.length)) {
        await page.frameLocator("#preview").locator("#doc .cover").waitFor({ state: "attached" });
      }
    };
    const capture = async (name, proposal = true) => {
      await settle();
      const data = await page.evaluate(() => {
        const panel = document.getElementById("panel").cloneNode(true);
        const walker = document.createTreeWalker(panel, NodeFilter.SHOW_TEXT);
        const whitespace = [];
        while (walker.nextNode()) {
          const node = walker.currentNode;
          if (!node.textContent.trim()) whitespace.push(node);
          else node.textContent = node.textContent.replace(/\s+/g, " ").trim();
        }
        whitespace.forEach((node) => node.remove());
        panel
          .querySelectorAll("[style]")
          .forEach((el) => el.setAttribute("style", el.style.cssText));
        const frame = document.getElementById("preview");
        const styles = [...document.styleSheets].flatMap((s) => {
          try {
            return [...s.cssRules].map((r) =>
              r.cssText.replace(/#[\da-f]{3,8}\b/gi, (c) => c.toLowerCase())
            );
          } catch {
            return [];
          }
        });
        const preview = frame.contentDocument;
        return {
          state: JSON.stringify(window.__S()),
          panel: panel.innerHTML,
          styles: JSON.stringify(styles),
          toolbar: [...document.querySelectorAll("header button")].map((b) => [
            b.id,
            b.disabled,
            b.textContent.replace(/\s+/g, " ").trim()
          ]),
          proposal: preview ? preview.body.innerHTML : "",
          proposalStyles: preview
            ? [...preview.querySelectorAll("style")].map((s) => s.textContent).join("")
            : ""
        };
      });
      if (!proposal) {
        delete data.proposal;
        delete data.proposalStyles;
      }
      const summary = Object.fromEntries(
        Object.entries(data).map(([key, value]) => [
          key,
          hash(typeof value === "string" ? value : JSON.stringify(value))
        ])
      );
      actual[name] = summary;
      if (!recording) assert.deepEqual(summary, expected[name], `Regression at ${name}`);
      const screenshot = path.join(resultsDir, `${recording ? "before" : "after"}-${name}.png`);
      await page.screenshot({ path: screenshot, animations: "disabled" });
      if (!recording) {
        const before = path.join(resultsDir, `before-${name}.png`);
        if (fs.existsSync(before))
          assert.equal(
            hash(fs.readFileSync(screenshot)),
            hash(fs.readFileSync(before)),
            `Screenshot changed at ${name}`
          );
      }
      console.log(`PASS ${name}`);
    };

    await page.goto(url);
    await capture("empty");
    await page.locator("#fileBOQ").setInputFiles(berlinWorkbook());
    await page.waitForFunction(
      () =>
        window.__S().opsi.length === 1 &&
        !document.getElementById("upStatus").textContent.includes("Membaca"),
      { timeout: 60000 }
    );
    await page.waitForFunction(() => document.querySelector("#fKomp .tabs button"), {
      timeout: 60000
    });
    await capture("workbook");
    await page.locator('[data-p="proyek.lokasi"]').fill("Pelanggan <Uji> & Rekan");
    await page.locator('[data-p="pln.tagihan"]').fill("2500000");
    await page.locator('[data-p="sales.nama"]').fill("Bu Uji");
    await page.locator('[data-p="sales.wa"]').fill("081234567890");
    await capture("edited");

    const preview = page.frameLocator("#preview");
    const beforeSim = await preview.locator("#doc").innerHTML();
    await preview.locator("#btnSim").click();
    await preview.locator("#s_kenaikanTarif").fill("5");
    assert.notEqual(await preview.locator("#doc").innerHTML(), beforeSim);
    assert.equal(
      await preview.locator("body").evaluate((el) => el.classList.contains("simulating")),
      true
    );
    await preview.locator("#simReset").click();
    assert.equal(await preview.locator("#doc").innerHTML(), beforeSim);
    await preview.locator("#simClose").click();
    await preview.locator("body").evaluate(() => window.dispatchEvent(new Event("beforeprint")));
    assert.equal(
      await preview.locator("details").evaluateAll((nodes) => nodes.every((n) => n.open)),
      true
    );
    await preview.locator("body").evaluate(() => window.dispatchEvent(new Event("afterprint")));
    await capture("simulation-reset");

    // Add a second system through a legacy BOQ text file to exercise multi-option output.
    const csv =
      "No,Code,Uraian,Qty,Unit,Harga,Total\n1,PV,Panel Surya 550Wp,10,unit,2000000,20000000\n2,INV,Inverter On Grid 5kW,1,unit,10000000,10000000\nTOTAL,,,,,,30000000";
    await page
      .locator("#fileBOQ")
      .setInputFiles({ name: "Opsi B.csv", mimeType: "text/csv", buffer: Buffer.from(csv) });
    await page.waitForFunction(() => window.__S().opsi.length === 2);
    await capture("multiple-options");
    await page.locator('[data-tab="1"]').click();
    await page.locator('[data-p="opsi.1.label"]').fill("Opsi Alternatif");
    await page
      .locator('[data-p="rekomendasi"]')
      .selectOption(await page.evaluate(() => window.__S().opsi[1].id));
    await page.locator("#f_alasan").fill("Alasan <uji> | Penjelasan & nilai");
    await page.locator("#f_penutup").fill("Penutup uji.");
    await capture("manual-recommendation");

    const survey =
      "Nama Pelanggan: Pak Uji\nAlamat: Jalan Pengujian 10\nJenis Atap: Genteng\nLuas Atap: 120 m2\nCatatan: Survey pengujian";
    await page
      .locator("#fileSurvey")
      .setInputFiles({ name: "survey.txt", mimeType: "text/plain", buffer: Buffer.from(survey) });
    await page.waitForFunction(() => window.__S().survey.sumber.includes("survey.txt"));
    await capture("survey");
    await page.locator("#fileSurvey").setInputFiles([surveyPDF(), surveyWord(), surveyPhoto()]);
    await page.waitForFunction(() => window.__S().survey.sumber.includes("foto-lokasi.svg"));
    assert.equal(await page.evaluate(() => window.__S().survey.foto.length), 1);
    await capture("survey-attachments");
    const downloadPromise = page.waitForEvent("download");
    await page.locator("#btnSimpan").click();
    const saved = await downloadPromise;
    const projectPath = path.join(resultsDir, "roundtrip.proyek.json");
    await saved.saveAs(projectPath);
    const savedState = await page.evaluate(() =>
      JSON.stringify(window.__S().opsi.map(({ _h, teksMentah, ...o }) => o))
    );
    await page.locator("#btnBaru").click();
    await page.locator("#modal button").filter({ hasText: "Ya, mulai baru" }).click();
    assert.equal(await page.evaluate(() => window.__S().opsi.length), 0);
    await page.locator("#fileProyek").setInputFiles(projectPath);
    await page.waitForFunction(() => window.__S().opsi.length === 2);
    assert.equal(await page.evaluate(() => JSON.stringify(window.__S().opsi)), savedState);
    await capture("reopened");
    await page.reload();
    await capture("local-storage");
    const exportPromise = page.waitForEvent("download");
    await page.locator("#btnHTML").click();
    const exported = await exportPromise;
    const exportPath = path.join(resultsDir, `${recording ? "before" : "after"}-proposal.html`);
    await exported.saveAs(exportPath);
    const standalone = await context.newPage();
    standalone.on("pageerror", (e) => errors.push(e.message));
    await standalone.goto("file:///" + exportPath.replace(/\\/g, "/"));
    await standalone.locator("#doc .cover").waitFor();
    const output = await standalone.locator("#doc").innerHTML();
    actual.standalone = { doc: hash(output) };
    if (!recording) assert.deepEqual(actual.standalone, expected.standalone);
    await standalone.locator("#btnSim").click();
    await standalone.locator("#s_jamEfektif").fill("4");
    assert.notEqual(await standalone.locator("#doc").innerHTML(), output);
    await standalone.locator("#simReset").click();
    assert.equal(await standalone.locator("#doc").innerHTML(), output);
    console.log("PASS standalone HTML export and simulation");
    await standalone.close();
    await page.locator("#btnLebar").click();
    assert.equal(await page.locator("body").evaluate((el) => el.classList.contains("wide")), true);
    await capture("wide");
    await page.locator("#btnLebar").click();
    await page.setViewportSize({ width: 390, height: 844 });
    await capture("mobile");
    assert.deepEqual(errors, [], "Browser JavaScript errors");
    await context.close();
    // Preserve direct file:// usage, which must not require an HTTP server.
    const local = await browser.newPage();
    local.on("pageerror", (e) => errors.push(e.message));
    await local.route("https://**/*", (route) => route.abort());
    await local.goto("file:///" + path.join(root, "index.html").replace(/\\/g, "/"));
    await local.locator('[data-p="proyek.lokasi"]').waitFor();
    assert.equal(await local.evaluate(() => typeof window.__S), "function");
    assert.deepEqual(errors, []);
    console.log("PASS direct file:// startup");
    await local.close();
    if (recording) fs.writeFileSync(fixture, JSON.stringify(actual, null, 2) + "\n");
  } finally {
    await browser.close();
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => server.close());
