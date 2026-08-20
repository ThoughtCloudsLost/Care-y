/**
* | output |
* | --- |
* | "Volunteers can enroll in any of the supported second factor methods from this page. **Available methods.** Passkeys (platform authenticators and cross platfo..." |
*
* @param {Demo_Narrative_Settings_Twofa_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_settings_twofa_body: ((inputs?: Demo_Narrative_Settings_Twofa_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Settings_Twofa_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Settings_Twofa_BodyInputs = {};
