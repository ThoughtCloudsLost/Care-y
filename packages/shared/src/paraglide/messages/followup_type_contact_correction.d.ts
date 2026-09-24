/**
* | output |
* | --- |
* | "Contact correction" |
*
* @param {Followup_Type_Contact_CorrectionInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const followup_type_contact_correction: ((inputs?: Followup_Type_Contact_CorrectionInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Followup_Type_Contact_CorrectionInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Followup_Type_Contact_CorrectionInputs = {};
