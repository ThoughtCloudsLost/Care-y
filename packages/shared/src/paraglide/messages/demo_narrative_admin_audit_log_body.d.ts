/**
* | output |
* | --- |
* | "The audit tab lists administrative actions across the organization. Each row shows the actor (who performed the action), the event type, a timestamp, and a d..." |
*
* @param {Demo_Narrative_Admin_Audit_Log_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_audit_log_body: ((inputs?: Demo_Narrative_Admin_Audit_Log_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Admin_Audit_Log_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Admin_Audit_Log_BodyInputs = {};
