// Public Berlin workbook parser interface.
// Dependencies and shared state are provided through ctx.
function initParsersBerlinApi(ctx) {
  const API = {
    bacaWorkbook: ctx.bacaWorkbook,
    bacaLHS: ctx.bacaLHS,
    bacaBOQ: ctx.bacaBOQ,
    bacaQuotation: ctx.bacaQuotation,
    bacaSavings: ctx.bacaSavings,
    idDrive: ctx.idDrive
  };

  Object.assign(ctx, { API });
}

if (typeof module !== "undefined" && module.exports) module.exports = initParsersBerlinApi;
