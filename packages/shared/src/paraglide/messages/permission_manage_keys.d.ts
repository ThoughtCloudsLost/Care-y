/**
* | output |
* | --- |
* | "Manage encryption keys" |
*
* @param {Permission_Manage_KeysInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const permission_manage_keys: ((inputs?: Permission_Manage_KeysInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Permission_Manage_KeysInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Permission_Manage_KeysInputs = {};
