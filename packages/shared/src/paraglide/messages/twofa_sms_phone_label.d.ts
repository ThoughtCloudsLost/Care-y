/**
* | output |
* | --- |
* | "Phone number" |
*
* @param {Twofa_Sms_Phone_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const twofa_sms_phone_label: ((inputs?: Twofa_Sms_Phone_LabelInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Twofa_Sms_Phone_LabelInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Twofa_Sms_Phone_LabelInputs = {};
