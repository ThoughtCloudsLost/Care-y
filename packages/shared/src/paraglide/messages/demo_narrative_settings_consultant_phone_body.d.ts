/**
* | output |
* | --- |
* | "A user who takes calls on a personal phone registers the number here, and a code sent to that number has to come back before any call is bridged to it. [[#te..." |
*
* @param {Demo_Narrative_Settings_Consultant_Phone_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_settings_consultant_phone_body: ((inputs?: Demo_Narrative_Settings_Consultant_Phone_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Settings_Consultant_Phone_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Settings_Consultant_Phone_BodyInputs = {};
