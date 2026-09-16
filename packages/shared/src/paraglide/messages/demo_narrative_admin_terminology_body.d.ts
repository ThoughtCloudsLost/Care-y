/**
* | output |
* | --- |
* | "Organizations rename the standard terms used throughout the interface to match their own language. Six term groups are available, each with a singular and a ..." |
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
