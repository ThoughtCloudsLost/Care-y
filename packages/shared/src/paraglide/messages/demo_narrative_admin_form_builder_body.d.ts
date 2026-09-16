/**
* | output |
* | --- |
* | "The form editor saves as a whole, so changes to fields accumulate until the user saves the form. **Removing.** Removing a field is immediate and has no confi..." |
*
* @param {Demo_Narrative_Admin_Form_Builder_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_form_builder_body: ((inputs?: Demo_Narrative_Admin_Form_Builder_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Admin_Form_Builder_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Admin_Form_Builder_BodyInputs = {};
