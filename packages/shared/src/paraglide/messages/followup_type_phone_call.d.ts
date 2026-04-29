/**
* | output |
* | --- |
* | "Phone Calls" |
*
* @param {Followup_Type_Phone_CallInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const followup_type_phone_call: ((inputs?: Followup_Type_Phone_CallInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Followup_Type_Phone_CallInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Followup_Type_Phone_CallInputs = {};
