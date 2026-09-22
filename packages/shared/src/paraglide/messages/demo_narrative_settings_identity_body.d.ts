/**
* | output |
* | --- |
* | "An account carries a display name that other accounts see on its work and a username that signs it in, and the two are held under different protections becau..." |
*
* @param {Demo_Narrative_Settings_Identity_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_settings_identity_body: ((inputs?: Demo_Narrative_Settings_Identity_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Settings_Identity_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Settings_Identity_BodyInputs = {};
