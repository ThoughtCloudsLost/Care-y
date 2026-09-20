/**
* | output |
* | --- |
* | "Caller-submitted corrections to their contact information" |
*
* @param {Followup_Type_Contact_Correction_DescInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const followup_type_contact_correction_desc: ((inputs?: Followup_Type_Contact_Correction_DescInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Followup_Type_Contact_Correction_DescInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Followup_Type_Contact_Correction_DescInputs = {};
