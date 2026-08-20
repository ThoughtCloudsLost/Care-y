/**
* | output |
* | --- |
* | "Volunteers can change their display name and username from this page. **Display name.** The display name is encrypted with the organization key in the browse..." |
*
* @param {Demo_Narrative_Settings_Identity_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_settings_identity_body: ((inputs?: Demo_Narrative_Settings_Identity_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Settings_Identity_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Settings_Identity_BodyInputs = {};
