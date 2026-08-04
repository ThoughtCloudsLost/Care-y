/**
* | output |
* | --- |
* | "System activity will appear here as changes are made." |
*
* @param {Logs_Audit_Empty_SubtitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const logs_audit_empty_subtitle: ((inputs?: Logs_Audit_Empty_SubtitleInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Logs_Audit_Empty_SubtitleInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Logs_Audit_Empty_SubtitleInputs = {};
