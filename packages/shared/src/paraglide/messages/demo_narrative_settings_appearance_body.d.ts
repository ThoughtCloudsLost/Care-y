/**
* | output |
* | --- |
* | "Light and dark color schemes are available. The preference is saved locally on the device and is not sent to the server." |
*
* @param {Demo_Narrative_Settings_Appearance_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_settings_appearance_body: ((inputs?: Demo_Narrative_Settings_Appearance_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Settings_Appearance_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Settings_Appearance_BodyInputs = {};
