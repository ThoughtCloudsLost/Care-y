/**
* | output |
* | --- |
* | "All supported second factor methods are enrolled from this page. **Available methods.** Passkeys (platform authenticators and cross platform security keys), ..." |
*
* @param {Demo_Narrative_Settings_Twofa_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_settings_twofa_body: ((inputs?: Demo_Narrative_Settings_Twofa_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Settings_Twofa_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Settings_Twofa_BodyInputs = {};
