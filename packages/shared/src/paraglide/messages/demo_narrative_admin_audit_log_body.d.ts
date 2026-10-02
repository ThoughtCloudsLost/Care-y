/**
* | output |
* | --- |
* | "The audit log records administrative and lifecycle actions taken in the organization. Fund administration, organization deletion requests, and organization d..." |
*
* @param {Demo_Narrative_Admin_Audit_Log_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_audit_log_body: ((inputs?: Demo_Narrative_Admin_Audit_Log_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Admin_Audit_Log_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Admin_Audit_Log_BodyInputs = {};
