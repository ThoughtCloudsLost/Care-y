/**
* | output |
* | --- |
* | "Clear" |
*
* @param {Notif_Clear_Queue_ActionInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const notif_clear_queue_action: ((inputs?: Notif_Clear_Queue_ActionInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Notif_Clear_Queue_ActionInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Notif_Clear_Queue_ActionInputs = {};
