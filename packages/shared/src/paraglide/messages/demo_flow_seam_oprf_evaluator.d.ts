/**
* | output |
* | --- |
* | "This demo runs a single scalar OPRF evaluator in the browser. In production the OPRF key is split across two servers in separate jurisdictions, and neither o..." |
*
* @param {Demo_Flow_Seam_Oprf_EvaluatorInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_flow_seam_oprf_evaluator: ((inputs?: Demo_Flow_Seam_Oprf_EvaluatorInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Flow_Seam_Oprf_EvaluatorInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Flow_Seam_Oprf_EvaluatorInputs = {};
