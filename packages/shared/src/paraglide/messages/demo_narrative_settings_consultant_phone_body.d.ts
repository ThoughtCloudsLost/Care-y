/**
* | output |
* | --- |
* | "The user registers a personal phone number for receiving forwarded calls. A verification code sent to that number must be confirmed before the server will co..." |
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
