/**
* | output |
* | --- |
* | "View audit log" |
*
* @param {Permission_View_Audit_LogInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const permission_view_audit_log: ((inputs?: Permission_View_Audit_LogInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Permission_View_Audit_LogInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Permission_View_Audit_LogInputs = {};
