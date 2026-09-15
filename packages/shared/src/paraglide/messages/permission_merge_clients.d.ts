/**
* | output |
* | --- |
* | "Merge duplicate client records" |
*
* @param {Permission_Merge_ClientsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const permission_merge_clients: ((inputs?: Permission_Merge_ClientsInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Permission_Merge_ClientsInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Permission_Merge_ClientsInputs = {};
