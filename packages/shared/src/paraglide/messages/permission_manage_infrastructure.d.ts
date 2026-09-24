/**
* | output |
* | --- |
* | "Manage infrastructure" |
*
* @param {Permission_Manage_InfrastructureInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const permission_manage_infrastructure: ((inputs?: Permission_Manage_InfrastructureInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Permission_Manage_InfrastructureInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Permission_Manage_InfrastructureInputs = {};
