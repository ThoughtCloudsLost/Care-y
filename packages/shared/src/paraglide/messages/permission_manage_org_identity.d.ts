/**
* | output |
* | --- |
* | "Manage org identity" |
*
* @param {Permission_Manage_Org_IdentityInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const permission_manage_org_identity: ((inputs?: Permission_Manage_Org_IdentityInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Permission_Manage_Org_IdentityInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Permission_Manage_Org_IdentityInputs = {};
