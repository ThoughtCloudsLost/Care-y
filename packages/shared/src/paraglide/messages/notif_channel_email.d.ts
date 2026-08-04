/**
* | output |
* | --- |
* | "Email" |
*
* @param {Notif_Channel_EmailInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const notif_channel_email: ((inputs?: Notif_Channel_EmailInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Notif_Channel_EmailInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Notif_Channel_EmailInputs = {};
