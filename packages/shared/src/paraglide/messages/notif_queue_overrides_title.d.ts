/**
* | output |
* | --- |
* | "Queue overrides" |
*
* @param {Notif_Queue_Overrides_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const notif_queue_overrides_title: ((inputs?: Notif_Queue_Overrides_TitleInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Notif_Queue_Overrides_TitleInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Notif_Queue_Overrides_TitleInputs = {};
