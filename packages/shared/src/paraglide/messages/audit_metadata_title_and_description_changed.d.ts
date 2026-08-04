/**
* | output |
* | --- |
* | "Title and description changed" |
*
* @param {Audit_Metadata_Title_And_Description_ChangedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const audit_metadata_title_and_description_changed: ((inputs?: Audit_Metadata_Title_And_Description_ChangedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Audit_Metadata_Title_And_Description_ChangedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Audit_Metadata_Title_And_Description_ChangedInputs = {};
