/**
* | output |
* | --- |
* | "The second factor check is choreographed in the handbook. The installed app verifies the code against the server." |
*
* @param {Demo_Flow_Seam_Twofa_ChoreographyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_flow_seam_twofa_choreography: ((inputs?: Demo_Flow_Seam_Twofa_ChoreographyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Flow_Seam_Twofa_ChoreographyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Flow_Seam_Twofa_ChoreographyInputs = {};
