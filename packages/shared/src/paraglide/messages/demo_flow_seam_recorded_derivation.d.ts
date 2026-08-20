/**
* | output |
* | --- |
* | "This server exchange ran once when the handbook started. It is replayed here with its real measured timing so the login section shows the full round-trip seq..." |
*
* @param {Demo_Flow_Seam_Recorded_DerivationInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_flow_seam_recorded_derivation: ((inputs?: Demo_Flow_Seam_Recorded_DerivationInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Flow_Seam_Recorded_DerivationInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Flow_Seam_Recorded_DerivationInputs = {};
