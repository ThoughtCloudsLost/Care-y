/**
* | output |
* | --- |
* | "Clear queue overrides?" |
*
* @param {Notif_Clear_Queue_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const notif_clear_queue_title: ((inputs?: Notif_Clear_Queue_TitleInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Notif_Clear_Queue_TitleInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Notif_Clear_Queue_TitleInputs = {};
