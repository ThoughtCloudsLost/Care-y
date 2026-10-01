/**
* | output |
* | --- |
* | "Until then, an administrator can stop the deletion." |
*
* @param {Org_Deletion_Pending_HintInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const org_deletion_pending_hint: ((inputs?: Org_Deletion_Pending_HintInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Org_Deletion_Pending_HintInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Org_Deletion_Pending_HintInputs = {};
