/**
* | output |
* | --- |
* | "SMS" |
*
* @param {Notif_Channel_SmsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const notif_channel_sms: ((inputs?: Notif_Channel_SmsInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Notif_Channel_SmsInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Notif_Channel_SmsInputs = {};
