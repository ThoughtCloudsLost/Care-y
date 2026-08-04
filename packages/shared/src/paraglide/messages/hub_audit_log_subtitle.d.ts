/**
* | output |
* | --- |
* | "Review system activity and change history" |
*
* @param {Hub_Audit_Log_SubtitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const hub_audit_log_subtitle: ((inputs?: Hub_Audit_Log_SubtitleInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Hub_Audit_Log_SubtitleInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Hub_Audit_Log_SubtitleInputs = {};
