/**
* | output |
* | --- |
* | "Audit" |
*
* @param {Logs_Tab_AuditInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const logs_tab_audit: ((inputs?: Logs_Tab_AuditInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Logs_Tab_AuditInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Logs_Tab_AuditInputs = {};
