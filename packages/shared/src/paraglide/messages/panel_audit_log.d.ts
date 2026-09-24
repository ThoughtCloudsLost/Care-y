/**
* | output |
* | --- |
* | "Audit Log" |
*
* @param {Panel_Audit_LogInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const panel_audit_log: ((inputs?: Panel_Audit_LogInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Panel_Audit_LogInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Panel_Audit_LogInputs = {};
