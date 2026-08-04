/**
* | output |
* | --- |
* | "Voicemail" |
*
* @param {Notif_Event_Voicemail_QuarantinedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const notif_event_voicemail_quarantined: ((inputs?: Notif_Event_Voicemail_QuarantinedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Notif_Event_Voicemail_QuarantinedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Notif_Event_Voicemail_QuarantinedInputs = {};
