/**
* | output |
* | --- |
* | "Volunteers can toggle between light and dark color schemes. The preference is saved locally on the device and is not sent to the server, and a refresh app en..." |
*
* @param {Demo_Narrative_Settings_Appearance_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_settings_appearance_body: ((inputs?: Demo_Narrative_Settings_Appearance_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Settings_Appearance_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Settings_Appearance_BodyInputs = {};
