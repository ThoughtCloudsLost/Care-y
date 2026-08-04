/**
* | output |
* | --- |
* | "No queues available." |
*
* @param {Notif_No_QueuesInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const notif_no_queues: ((inputs?: Notif_No_QueuesInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Notif_No_QueuesInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Notif_No_QueuesInputs = {};
