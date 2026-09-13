/**
* | output |
* | --- |
* | "Voicemail quarantine routed" |
*
* @param {Audit_Event_Voicemail_Quarantine_RoutedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const audit_event_voicemail_quarantine_routed: ((inputs?: Audit_Event_Voicemail_Quarantine_RoutedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Audit_Event_Voicemail_Quarantine_RoutedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Audit_Event_Voicemail_Quarantine_RoutedInputs = {};
