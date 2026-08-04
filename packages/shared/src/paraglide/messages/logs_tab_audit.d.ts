/**
* | output |
* | --- |
* | "Audit" |
*
* @param {Logs_Tab_AuditInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const logs_tab_audit: ((inputs?: Logs_Tab_AuditInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Logs_Tab_AuditInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Logs_Tab_AuditInputs = {};
