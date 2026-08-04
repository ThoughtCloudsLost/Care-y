/**
* | output |
* | --- |
* | "The pace of the login is scripted in this demo. The real key derivation runs, with each callback held long enough to read." |
*
* @param {Demo_Flow_Seam_Login_PacingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_flow_seam_login_pacing: ((inputs?: Demo_Flow_Seam_Login_PacingInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Flow_Seam_Login_PacingInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Flow_Seam_Login_PacingInputs = {};
