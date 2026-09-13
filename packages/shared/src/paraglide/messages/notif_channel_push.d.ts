/**
* | output |
* | --- |
* | "Push" |
*
* @param {Notif_Channel_PushInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const notif_channel_push: ((inputs?: Notif_Channel_PushInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Notif_Channel_PushInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Notif_Channel_PushInputs = {};
