/**
* | output |
* | --- |
* | "The audit log requires the View audit log permission." |
*
* @param {Logs_Audit_Permission_RequiredInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const logs_audit_permission_required: ((inputs?: Logs_Audit_Permission_RequiredInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Logs_Audit_Permission_RequiredInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Logs_Audit_Permission_RequiredInputs = {};
