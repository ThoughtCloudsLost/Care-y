/**
* | output |
* | --- |
* | "Clear overrides for this queue" |
*
* @param {Notif_Clear_Queue_OverridesInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const notif_clear_queue_overrides: ((inputs?: Notif_Clear_Queue_OverridesInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Notif_Clear_Queue_OverridesInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Notif_Clear_Queue_OverridesInputs = {};
