// Dashboard entry point. Keep initialization order: state -> services -> forms -> events.
(function () {
  document.getElementById("hdrLogo").src = window.ASSETS.logo;
  const ctx = {};
  const modules = [
    initAppState,
    initAppImportsOptions,
    initAppImportsBerlin,
    initAppImages,
    initAppImportsFiles,
    initAppImportsSurvey,
    initAppRecommendation,
    initAppProposalData,
    initAppPreview,
    initAppFeedback,
    initAppFormsHelpers,
    initAppFormsImports,
    initAppFormsProject,
    initAppFormsComponents,
    initAppFormsSettings,
    initAppEvents,
    initAppUploads,
    initAppToolbar,
    initAppAccount,
    initAppStartup
  ];
  modules.forEach((init) => init(ctx));
})();
