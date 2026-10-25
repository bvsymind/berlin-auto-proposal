const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.join(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const scripts = [...html.matchAll(/<script src="([^"]+)"/g)].map((match) => match[1]);
assert.equal(new Set(scripts).size, scripts.length, "No duplicate script tags");
for (const file of scripts) {
  assert.ok(fs.existsSync(path.join(root, file)), `Missing script ${file}`);
  new vm.Script(fs.readFileSync(path.join(root, file), "utf8"), { filename: file });
}
for (const match of html.matchAll(/<link[^>]*href="([^"#:]+)"/g)) {
  if (/^https?:/.test(match[1])) continue;
  assert.ok(fs.existsSync(path.join(root, match[1])), `Missing stylesheet ${match[1]}`);
}
assert.equal(
  typeof require("../js/proposal/runtime.js"),
  "function",
  "Proposal runtime keeps its CommonJS export"
);
assert.equal(
  typeof require("../js/calculations/engine.js"),
  "function",
  "Calculation factory keeps its CommonJS export"
);
console.log(`PASS syntax and local references (${scripts.length} scripts)`);
