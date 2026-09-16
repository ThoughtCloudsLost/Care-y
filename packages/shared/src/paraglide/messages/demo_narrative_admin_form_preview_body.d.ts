/**
* | output |
* | --- |
* | "The preview renders the form using the same field renderer the public intake page uses, so what the user sees while editing is what the visitor sees when sub..." |
*
* @param {Demo_Narrative_Admin_Form_Preview_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_form_preview_body: ((inputs?: Demo_Narrative_Admin_Form_Preview_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Admin_Form_Preview_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Admin_Form_Preview_BodyInputs = {};
