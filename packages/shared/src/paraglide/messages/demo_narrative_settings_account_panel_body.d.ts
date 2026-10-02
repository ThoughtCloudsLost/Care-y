/**
* | output |
* | --- |
* | "The account panel opens from the identity button in the navbar below desktop width. It shows the user's display name, a role stamp, and the admin destination..." |
*
* @param {Demo_Narrative_Settings_Account_Panel_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_settings_account_panel_body: ((inputs?: Demo_Narrative_Settings_Account_Panel_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Settings_Account_Panel_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Settings_Account_Panel_BodyInputs = {};
