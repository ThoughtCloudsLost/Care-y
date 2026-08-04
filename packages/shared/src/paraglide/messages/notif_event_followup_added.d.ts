/**
* | output |
* | --- |
* | "New reply" |
*
* @param {Notif_Event_Followup_AddedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const notif_event_followup_added: ((inputs?: Notif_Event_Followup_AddedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Notif_Event_Followup_AddedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Notif_Event_Followup_AddedInputs = {};
