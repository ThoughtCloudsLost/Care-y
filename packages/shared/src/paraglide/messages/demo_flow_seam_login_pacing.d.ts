/**
* | output |
* | --- |
* | "The pace of the login is scripted in the handbook. The real key derivation runs, with each callback held long enough to read." |
*
* @param {Demo_Flow_Seam_Login_PacingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_flow_seam_login_pacing: ((inputs?: Demo_Flow_Seam_Login_PacingInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Flow_Seam_Login_PacingInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Flow_Seam_Login_PacingInputs = {};
