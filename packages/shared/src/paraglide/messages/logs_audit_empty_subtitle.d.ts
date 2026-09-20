/**
* | output |
* | --- |
* | "System activity will appear here as changes are made." |
*
* @param {Logs_Audit_Empty_SubtitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const logs_audit_empty_subtitle: ((inputs?: Logs_Audit_Empty_SubtitleInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Logs_Audit_Empty_SubtitleInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Logs_Audit_Empty_SubtitleInputs = {};
