/**
* | output |
* | --- |
* | "Manage organization settings" |
*
* @param {Permission_Manage_Org_ConfigInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const permission_manage_org_config: ((inputs?: Permission_Manage_Org_ConfigInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Permission_Manage_Org_ConfigInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Permission_Manage_Org_ConfigInputs = {};
