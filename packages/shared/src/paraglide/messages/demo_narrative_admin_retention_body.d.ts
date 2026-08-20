/**
* | output |
* | --- |
* | "Administrators configure how long different types of data are retained before automatic deletion. Retention rules apply to closed tickets, voicemails, and ot..." |
*
* @param {Demo_Narrative_Admin_Retention_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_retention_body: ((inputs?: Demo_Narrative_Admin_Retention_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Admin_Retention_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Admin_Retention_BodyInputs = {};
