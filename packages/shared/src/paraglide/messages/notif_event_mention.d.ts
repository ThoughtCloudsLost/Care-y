/**
* | output |
* | --- |
* | "Mention" |
*
* @param {Notif_Event_MentionInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const notif_event_mention: ((inputs?: Notif_Event_MentionInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Notif_Event_MentionInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Notif_Event_MentionInputs = {};
