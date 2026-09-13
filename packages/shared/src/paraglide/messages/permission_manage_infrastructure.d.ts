/**
* | output |
* | --- |
* | "Manage server and infrastructure" |
*
* @param {Permission_Manage_InfrastructureInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const permission_manage_infrastructure: ((inputs?: Permission_Manage_InfrastructureInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Permission_Manage_InfrastructureInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Permission_Manage_InfrastructureInputs = {};
