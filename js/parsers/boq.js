// ParserBOQ entry point. Modules use the same initialization order in the browser and Node.
(function (root) {
  const ctx = { root };
  const modules = [
    typeof module !== "undefined" && module.exports
      ? require("./boq/common.js")
      : initParsersBoqCommon,
    typeof module !== "undefined" && module.exports
      ? require("./boq/items.js")
      : initParsersBoqItems,
    typeof module !== "undefined" && module.exports
      ? require("./boq/quotation.js")
      : initParsersBoqQuotation,
    typeof module !== "undefined" && module.exports
      ? require("./boq/components.js")
      : initParsersBoqComponents,
    typeof module !== "undefined" && module.exports
      ? require("./boq/files.js")
      : initParsersBoqFiles,
    typeof module !== "undefined" && module.exports ? require("./boq/api.js") : initParsersBoqApi
  ];
  modules.forEach((init) => init(ctx));
  if (typeof module !== "undefined" && module.exports) module.exports = ctx.API;
  else root.ParserBOQ = ctx.API;
})(typeof window !== "undefined" ? window : globalThis);
