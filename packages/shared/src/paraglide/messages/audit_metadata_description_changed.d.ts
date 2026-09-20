/**
* | output |
* | --- |
* | "Description changed" |
*
* @param {Audit_Metadata_Description_ChangedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const audit_metadata_description_changed: ((inputs?: Audit_Metadata_Description_ChangedInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Audit_Metadata_Description_ChangedInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Audit_Metadata_Description_ChangedInputs = {};
