/**
* | output |
* | --- |
* | "Basic organization settings like the organization name and contact information. These fields are encrypted with the organization key before storage." |
*
* @param {Demo_Narrative_Admin_General_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_general_body: ((inputs?: Demo_Narrative_Admin_General_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Admin_General_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Admin_General_BodyInputs = {};
