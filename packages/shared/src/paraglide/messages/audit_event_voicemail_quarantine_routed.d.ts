/**
* | output |
* | --- |
* | "Voicemail quarantine routed" |
*
* @param {Audit_Event_Voicemail_Quarantine_RoutedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const audit_event_voicemail_quarantine_routed: ((inputs?: Audit_Event_Voicemail_Quarantine_RoutedInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Audit_Event_Voicemail_Quarantine_RoutedInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Audit_Event_Voicemail_Quarantine_RoutedInputs = {};
