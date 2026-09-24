/**
* | output |
* | --- |
* | "Overrides for {queue} will be removed. Your global preferences will apply instead." |
*
* @param {Notif_Clear_Queue_ConfirmInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const notif_clear_queue_confirm: ((inputs: Notif_Clear_Queue_ConfirmInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Notif_Clear_Queue_ConfirmInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Notif_Clear_Queue_ConfirmInputs = {
    queue: NonNullable<unknown>;
};
