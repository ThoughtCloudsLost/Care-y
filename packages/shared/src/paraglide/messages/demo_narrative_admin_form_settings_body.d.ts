/**
* | output |
* | --- |
* | "The settings block at the top of the editor controls the form's identity and behavior. **Name and slug.** The name is what administrators see in the forms li..." |
*
* @param {Demo_Narrative_Admin_Form_Settings_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_form_settings_body: ((inputs?: Demo_Narrative_Admin_Form_Settings_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Admin_Form_Settings_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Admin_Form_Settings_BodyInputs = {};
