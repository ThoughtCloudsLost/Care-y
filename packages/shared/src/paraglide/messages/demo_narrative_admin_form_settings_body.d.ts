/**
* | output |
* | --- |
* | "Each form carries an internal name, an address on the public site, a destination queue for the cases it creates, an optional closing date and a banner image...." |
*
* @param {Demo_Narrative_Admin_Form_Settings_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_form_settings_body: ((inputs?: Demo_Narrative_Admin_Form_Settings_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Admin_Form_Settings_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Admin_Form_Settings_BodyInputs = {};
