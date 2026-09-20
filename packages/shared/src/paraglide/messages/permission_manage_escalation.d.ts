/**
* | output |
* | --- |
* | "Manage escalation" |
*
* @param {Permission_Manage_EscalationInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const permission_manage_escalation: ((inputs?: Permission_Manage_EscalationInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Permission_Manage_EscalationInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Permission_Manage_EscalationInputs = {};
