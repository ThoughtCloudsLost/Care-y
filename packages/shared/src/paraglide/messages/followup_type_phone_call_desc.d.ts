/**
* | output |
* | --- |
* | "Inbound and outbound call records" |
*
* @param {Followup_Type_Phone_Call_DescInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const followup_type_phone_call_desc: ((inputs?: Followup_Type_Phone_Call_DescInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Followup_Type_Phone_Call_DescInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Followup_Type_Phone_Call_DescInputs = {};
