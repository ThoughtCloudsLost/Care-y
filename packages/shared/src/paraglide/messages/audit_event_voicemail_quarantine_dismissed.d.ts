/**
* | output |
* | --- |
* | "Voicemail quarantine dismissed" |
*
* @param {Audit_Event_Voicemail_Quarantine_DismissedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const audit_event_voicemail_quarantine_dismissed: ((inputs?: Audit_Event_Voicemail_Quarantine_DismissedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Audit_Event_Voicemail_Quarantine_DismissedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Audit_Event_Voicemail_Quarantine_DismissedInputs = {};
