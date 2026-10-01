/**
* | output |
* | --- |
* | "Fund administration lives on the Organization page as a section gated on the Manage funds permission, in the same shape as Note types and Intake forms. The s..." |
*
* @param {Demo_Narrative_Admin_Funds_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_funds_body: ((inputs?: Demo_Narrative_Admin_Funds_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Admin_Funds_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Admin_Funds_BodyInputs = {};
