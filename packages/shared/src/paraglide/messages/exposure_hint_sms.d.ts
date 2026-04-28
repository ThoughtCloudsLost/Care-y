/**
* | output |
* | --- |
* | "SMS is not encrypted. Your phone provider can read it. Keep sensitive details in the encrypted chat." |
*
* @param {Exposure_Hint_SmsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const exposure_hint_sms: ((inputs?: Exposure_Hint_SmsInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Exposure_Hint_SmsInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Exposure_Hint_SmsInputs = {};
