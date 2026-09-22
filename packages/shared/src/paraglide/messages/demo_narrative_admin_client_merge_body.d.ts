/**
* | output |
* | --- |
* | "A merge names one of two records the survivor and marks the other as merged into it, which is a pointer between rows rather than a rewrite of either. [[#clie..." |
*
* @param {Demo_Narrative_Admin_Client_Merge_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_client_merge_body: ((inputs?: Demo_Narrative_Admin_Client_Merge_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Admin_Client_Merge_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Admin_Client_Merge_BodyInputs = {};
