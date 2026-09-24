/**
* | output |
* | --- |
* | "The completeness count for each locale tracks how many translatable items have been filled out of the total, and the total counts only items that exist in at..." |
*
* @param {Demo_Narrative_Admin_Form_Locales_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_form_locales_body: ((inputs?: Demo_Narrative_Admin_Form_Locales_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Admin_Form_Locales_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Admin_Form_Locales_BodyInputs = {};
