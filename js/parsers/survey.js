// ParserSurvey entry point. Modules use the same initialization order in the browser and Node.
(function (root) {
  const ctx = { root };
  const modules = [
    typeof module !== "undefined" && module.exports
      ? require("./survey/fields.js")
      : initParsersSurveyFields,
    typeof module !== "undefined" && module.exports
      ? require("./survey/text.js")
      : initParsersSurveyText,
    typeof module !== "undefined" && module.exports
      ? require("./survey/images.js")
      : initParsersSurveyImages,
    typeof module !== "undefined" && module.exports
      ? require("./survey/docx.js")
      : initParsersSurveyDocx,
    typeof module !== "undefined" && module.exports
      ? require("./survey/files.js")
      : initParsersSurveyFiles,
    typeof module !== "undefined" && module.exports
      ? require("./survey/api.js")
      : initParsersSurveyApi
  ];
  modules.forEach((init) => init(ctx));
  if (typeof module !== "undefined" && module.exports) module.exports = ctx.API;
  else root.ParserSurvey = ctx.API;
})(typeof window !== "undefined" ? window : globalThis);
