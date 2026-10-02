/**
* | output |
* | --- |
* | "A user with the Request org deletion permission can request that the organization and all of its data be permanently erased. The request requires typing the ..." |
*
* @param {Demo_Narrative_Admin_Org_Deletion_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_org_deletion_body: ((inputs?: Demo_Narrative_Admin_Org_Deletion_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Admin_Org_Deletion_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Admin_Org_Deletion_BodyInputs = {};
