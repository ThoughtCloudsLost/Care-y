/**
* | output |
* | --- |
* | "The same person can end up as two client records, usually after calling from a new number. Administrators resolve this by merging the records from the client..." |
*
* @param {Demo_Narrative_Admin_Client_Merge_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_client_merge_body: ((inputs?: Demo_Narrative_Admin_Client_Merge_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Admin_Client_Merge_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Admin_Client_Merge_BodyInputs = {};
