/**
* | output |
* | --- |
* | "Volunteers can review the security briefing from the login walkthrough at any time from this page. The briefing explains what CARE-Y protects, how the encryp..." |
*
* @param {Demo_Narrative_Settings_Security_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_settings_security_body: ((inputs?: Demo_Narrative_Settings_Security_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Settings_Security_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Settings_Security_BodyInputs = {};
