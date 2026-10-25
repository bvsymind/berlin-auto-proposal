// Public survey parser interface.
// Dependencies and shared state are provided through ctx.
function initParsersSurveyApi(ctx) {
  const API = {
    FIELD: ctx.FIELD,
    LABEL: ctx.LABEL,
    bacaTeksSurvey: ctx.bacaTeksSurvey,
    bacaFileSurvey: ctx.bacaFileSurvey,
    teksDariBarisExcel: ctx.teksDariBarisExcel,
    fotoDariBlob: ctx.fotoDariBlob
  };

  Object.assign(ctx, { API });
}

if (typeof module !== "undefined" && module.exports) module.exports = initParsersSurveyApi;
