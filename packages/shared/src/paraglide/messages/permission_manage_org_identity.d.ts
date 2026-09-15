/**
* | output |
* | --- |
* | "Change how the organisation presents itself" |
*
* @param {Permission_Manage_Org_IdentityInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const permission_manage_org_identity: ((inputs?: Permission_Manage_Org_IdentityInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Permission_Manage_Org_IdentityInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Permission_Manage_Org_IdentityInputs = {};
