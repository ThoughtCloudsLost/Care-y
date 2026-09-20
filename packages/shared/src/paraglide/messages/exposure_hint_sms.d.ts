/**
* | output |
* | --- |
* | "SMS is not encrypted. Your phone provider can read it. Keep sensitive details in the encrypted chat." |
*
* @param {Exposure_Hint_SmsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const exposure_hint_sms: ((inputs?: Exposure_Hint_SmsInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Exposure_Hint_SmsInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Exposure_Hint_SmsInputs = {};
