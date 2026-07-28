/**
* | output |
* | --- |
* | "Settings lets you change your display name, password, locale, and notification options. Changes are encrypted before leaving your device. The server stores t..." |
*
* @param {Demo_Narrative_Settings_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_settings_body: ((inputs?: Demo_Narrative_Settings_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Settings_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Settings_BodyInputs = {};
