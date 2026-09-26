/**
* | output |
* | --- |
* | "Merging two client records sets one as the survivor and writes a pointer from the other into it. Neither record is rewritten. The merged-away record keeps it..." |
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
