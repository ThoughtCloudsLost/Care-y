/**
* | output |
* | --- |
* | "Inbound and outbound call records" |
*
* @param {Followup_Type_Phone_Call_DescInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const followup_type_phone_call_desc: ((inputs?: Followup_Type_Phone_Call_DescInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Followup_Type_Phone_Call_DescInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Followup_Type_Phone_Call_DescInputs = {};
