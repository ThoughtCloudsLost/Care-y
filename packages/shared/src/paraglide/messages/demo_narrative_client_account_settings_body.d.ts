/**
* | output |
* | --- |
* | "The drawer entries for managing an account require a sign-in. A client who opens the page without a password sees nothing in the drawer. [Change password](#c..." |
*
* @param {Demo_Narrative_Client_Account_Settings_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_client_account_settings_body: ((inputs?: Demo_Narrative_Client_Account_Settings_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Client_Account_Settings_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Client_Account_Settings_BodyInputs = {};
