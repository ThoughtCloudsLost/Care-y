/**
* | output |
* | --- |
* | "The completeness count for each locale tracks how many translatable items have been filled out of the total, and the total counts only items that exist in at..." |
*
* @param {Demo_Narrative_Admin_Form_Locales_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_form_locales_body: ((inputs?: Demo_Narrative_Admin_Form_Locales_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Admin_Form_Locales_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Admin_Form_Locales_BodyInputs = {};
