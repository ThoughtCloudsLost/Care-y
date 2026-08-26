/**
* | output |
* | --- |
* | "Caller-submitted corrections to their contact information" |
*
* @param {Followup_Type_Contact_Correction_DescInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const followup_type_contact_correction_desc: ((inputs?: Followup_Type_Contact_Correction_DescInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Followup_Type_Contact_Correction_DescInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Followup_Type_Contact_Correction_DescInputs = {};
