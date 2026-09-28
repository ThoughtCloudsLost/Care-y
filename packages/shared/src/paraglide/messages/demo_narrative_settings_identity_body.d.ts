/**
* | output |
* | --- |
* | "The user has a display name visible on their work and a username used to sign in. The display name is encrypted in the browser before it reaches the server. ..." |
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
