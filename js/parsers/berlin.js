// ParserBerlin entry point. Modules use the same initialization order in the browser and Node.
(function (root) {
  const ctx = { root };
  const modules = [
    typeof module !== "undefined" && module.exports
      ? require("./berlin/worksheet.js")
      : initParsersBerlinWorksheet,
    typeof module !== "undefined" && module.exports
      ? require("./berlin/lhs.js")
      : initParsersBerlinLhs,
    typeof module !== "undefined" && module.exports
      ? require("./berlin/boq.js")
      : initParsersBerlinBoq,
    typeof module !== "undefined" && module.exports
      ? require("./berlin/quotation.js")
      : initParsersBerlinQuotation,
    typeof module !== "undefined" && module.exports
      ? require("./berlin/savings.js")
      : initParsersBerlinSavings,
    typeof module !== "undefined" && module.exports
      ? require("./berlin/workbook.js")
      : initParsersBerlinWorkbook,
    typeof module !== "undefined" && module.exports
      ? require("./berlin/api.js")
      : initParsersBerlinApi
  ];
  modules.forEach((init) => init(ctx));
  if (typeof module !== "undefined" && module.exports) module.exports = ctx.API;
  else root.ParserBerlin = ctx.API;
})(typeof window !== "undefined" ? window : globalThis);
