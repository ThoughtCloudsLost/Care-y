/**
* | output |
* | --- |
* | "This organization is being deleted." |
*
* @param {Org_Deletion_ProcessingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const org_deletion_processing: ((inputs?: Org_Deletion_ProcessingInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Org_Deletion_ProcessingInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Org_Deletion_ProcessingInputs = {};
