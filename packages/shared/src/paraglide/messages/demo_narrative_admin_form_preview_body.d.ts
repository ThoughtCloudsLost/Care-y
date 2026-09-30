/**
* | output |
* | --- |
* | "The preview renders the form with the same field renderer and the same page-splitting and validation logic the public intake page uses. The user can walk eve..." |
*
* @param {Demo_Narrative_Admin_Form_Preview_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_form_preview_body: ((inputs?: Demo_Narrative_Admin_Form_Preview_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Admin_Form_Preview_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Admin_Form_Preview_BodyInputs = {};
