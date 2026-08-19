/**
* | output |
* | --- |
* | "Two entries sit under the security heading beside two factor enrollment. **Review security briefing** opens the briefing from the login walkthrough. It expla..." |
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
