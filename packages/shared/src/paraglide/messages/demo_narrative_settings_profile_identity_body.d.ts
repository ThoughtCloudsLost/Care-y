/**
* | output |
* | --- |
* | "You can change your display name and username here. Both are real writes to the database running in your browser and reset when the demo restarts." |
*
* @param {Demo_Narrative_Settings_Profile_Identity_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_settings_profile_identity_body: ((inputs?: Demo_Narrative_Settings_Profile_Identity_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Settings_Profile_Identity_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Settings_Profile_Identity_BodyInputs = {};
