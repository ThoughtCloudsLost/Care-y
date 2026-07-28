/**
* | output |
* | --- |
* | "You can enroll TOTP, email, or SMS as a second factor from this page. The demo stands in for your authenticator app and inbox by auto-filling the verificatio..." |
*
* @param {Demo_Narrative_Settings_Two_Factor_Methods_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_settings_two_factor_methods_body: ((inputs?: Demo_Narrative_Settings_Two_Factor_Methods_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Settings_Two_Factor_Methods_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Settings_Two_Factor_Methods_BodyInputs = {};
