/**
* | output |
* | --- |
* | "+1 (555) 000-0000" |
*
* @param {Twofa_Sms_Phone_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const twofa_sms_phone_placeholder: ((inputs?: Twofa_Sms_Phone_PlaceholderInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Twofa_Sms_Phone_PlaceholderInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Twofa_Sms_Phone_PlaceholderInputs = {};
