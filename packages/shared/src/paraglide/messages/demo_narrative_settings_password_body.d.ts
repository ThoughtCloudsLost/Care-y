/**
* | output |
* | --- |
* | "A password change rebuilds the encryption keys from the new password and re-wraps every sealed copy those keys protect. The browser derives both the old and ..." |
*
* @param {Demo_Narrative_Settings_Password_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_settings_password_body: ((inputs?: Demo_Narrative_Settings_Password_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Settings_Password_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Settings_Password_BodyInputs = {};
