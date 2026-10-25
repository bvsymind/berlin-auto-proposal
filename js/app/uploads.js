// File picker and drag-and-drop event bindings.
// Dependencies and shared state are provided through ctx.
function initAppUploads(ctx) {
  // unggah
  const dz = ctx.$("#drop"),
    fi = ctx.$("#fileBOQ");
  dz.addEventListener("click", () => fi.click());
  fi.addEventListener("change", () => {
    ctx.terimaFile([...fi.files]);
    fi.value = "";
  });
  ["dragenter", "dragover"].forEach((ev) =>
    dz.addEventListener(ev, (e) => {
      e.preventDefault();
      dz.classList.add("over");
    })
  );
  ["dragleave", "drop"].forEach((ev) =>
    dz.addEventListener(ev, (e) => {
      e.preventDefault();
      dz.classList.remove("over");
    })
  );
  dz.addEventListener("drop", (e) => ctx.terimaFile([...e.dataTransfer.files]));

  const dzs = ctx.$("#dropSv"),
    fs = ctx.$("#fileSurvey");
  dzs.addEventListener("click", () => fs.click());
  fs.addEventListener("change", () => {
    ctx.terimaSurvey([...fs.files]);
    fs.value = "";
  });
  ["dragenter", "dragover"].forEach((ev) =>
    dzs.addEventListener(ev, (e) => {
      e.preventDefault();
      dzs.classList.add("over");
    })
  );
  ["dragleave", "drop"].forEach((ev) =>
    dzs.addEventListener(ev, (e) => {
      e.preventDefault();
      dzs.classList.remove("over");
    })
  );
  dzs.addEventListener("drop", (e) => ctx.terimaSurvey([...e.dataTransfer.files]));

  Object.assign(ctx, { dz, fi, dzs, fs });
}
