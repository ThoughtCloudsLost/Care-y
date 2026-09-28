/**
* | output |
* | --- |
* | "The user enrolls and removes second-factor methods from settings. An account can hold several active methods at once, and each one works independently. [Two ..." |
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
