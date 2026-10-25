// Factories are serialized into the downloaded HTML, keeping it fully standalone.
const ProposalModules =
  typeof module !== "undefined" && module.exports
    ? [
        require("./context.js"),
        require("./icons.js"),
        require("./calculations.js"),
        require("./charts.js"),
        require("./ui.js"),
        require("./sections/cover.js"),
        require("./sections/summary.js"),
        require("./sections/survey-design.js"),
        require("./sections/products-production.js"),
        require("./sections/financial.js"),
        require("./analysis.js"),
        require("./sections/comparison.js"),
        require("./sections/environment-offer.js"),
        require("./sections/company.js"),
        require("./sections/closing.js"),
        require("./sections/appendix.js"),
        require("./render.js"),
        require("./interactions.js"),
        require("./styles.js"),
        require("./startup.js")
      ]
    : [
        initProposalContext,
        initProposalIcons,
        initProposalCalculations,
        initProposalCharts,
        initProposalUi,
        initProposalSectionsCover,
        initProposalSectionsSummary,
        initProposalSectionsSurveyDesign,
        initProposalSectionsProductsProduction,
        initProposalSectionsFinancial,
        initProposalAnalysis,
        initProposalSectionsComparison,
        initProposalSectionsEnvironmentOffer,
        initProposalSectionsCompany,
        initProposalSectionsClosing,
        initProposalSectionsAppendix,
        initProposalRender,
        initProposalInteractions,
        initProposalStyles,
        initProposalStartup
      ];

function ProposalRuntime(D, K, modules = ProposalModules) {
  const ctx = { D, K };
  modules.forEach((init) => init(ctx));
  ctx.mulai();
}
if (typeof module !== "undefined" && module.exports) module.exports = ProposalRuntime;
