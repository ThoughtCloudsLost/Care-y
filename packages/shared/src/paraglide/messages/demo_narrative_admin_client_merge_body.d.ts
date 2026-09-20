/**
* | output |
* | --- |
* | "The same person can end up as two client records, usually after calling from a new number, and the merge tool resolves this from the client detail sheet. **W..." |
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
