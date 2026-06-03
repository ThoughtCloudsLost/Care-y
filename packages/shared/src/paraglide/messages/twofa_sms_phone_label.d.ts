/**
* | output |
* | --- |
* | "Phone number" |
*
* @param {Twofa_Sms_Phone_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const twofa_sms_phone_label: ((inputs?: Twofa_Sms_Phone_LabelInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Twofa_Sms_Phone_LabelInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Twofa_Sms_Phone_LabelInputs = {};
