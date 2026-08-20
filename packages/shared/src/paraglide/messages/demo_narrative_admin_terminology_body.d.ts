/**
* | output |
* | --- |
* | "Organizations can rename standard terms to match their own language. For example, an organization might call tickets \"cases\" or volunteers \"advocates.\" Termi..." |
*
* @param {Demo_Narrative_Admin_Terminology_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_terminology_body: ((inputs?: Demo_Narrative_Admin_Terminology_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Admin_Terminology_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Admin_Terminology_BodyInputs = {};
