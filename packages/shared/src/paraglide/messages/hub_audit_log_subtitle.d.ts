/**
* | output |
* | --- |
* | "Review system activity and change history" |
*
* @param {Hub_Audit_Log_SubtitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const hub_audit_log_subtitle: ((inputs?: Hub_Audit_Log_SubtitleInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Hub_Audit_Log_SubtitleInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Hub_Audit_Log_SubtitleInputs = {};
