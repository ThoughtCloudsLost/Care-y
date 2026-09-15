/**
* | output |
* | --- |
* | "Set up escalation rules" |
*
* @param {Permission_Manage_EscalationInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const permission_manage_escalation: ((inputs?: Permission_Manage_EscalationInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Permission_Manage_EscalationInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Permission_Manage_EscalationInputs = {};
