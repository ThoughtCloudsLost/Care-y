/**
* | output |
* | --- |
* | "Voicemail quarantined" |
*
* @param {Audit_Event_Voicemail_QuarantinedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const audit_event_voicemail_quarantined: ((inputs?: Audit_Event_Voicemail_QuarantinedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Audit_Event_Voicemail_QuarantinedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Audit_Event_Voicemail_QuarantinedInputs = {};
