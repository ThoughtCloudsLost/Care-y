/**
* | output |
* | --- |
* | "Title changed" |
*
* @param {Audit_Metadata_Title_ChangedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const audit_metadata_title_changed: ((inputs?: Audit_Metadata_Title_ChangedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Audit_Metadata_Title_ChangedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Audit_Metadata_Title_ChangedInputs = {};
