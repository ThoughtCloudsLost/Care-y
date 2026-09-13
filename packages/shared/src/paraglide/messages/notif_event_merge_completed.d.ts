/**
* | output |
* | --- |
* | "Merge done" |
*
* @param {Notif_Event_Merge_CompletedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const notif_event_merge_completed: ((inputs?: Notif_Event_Merge_CompletedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Notif_Event_Merge_CompletedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Notif_Event_Merge_CompletedInputs = {};
