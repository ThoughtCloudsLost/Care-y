/**
* | output |
* | --- |
* | "We send a 6-digit code to your phone number via text message. This is the weakest option because phone numbers can be stolen through a technique called SIM-s..." |
*
* @param {Twofa_Sms_DescInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const twofa_sms_desc: ((inputs?: Twofa_Sms_DescInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Twofa_Sms_DescInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Twofa_Sms_DescInputs = {};
