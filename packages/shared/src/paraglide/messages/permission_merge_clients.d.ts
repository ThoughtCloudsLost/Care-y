/**
* | output |
* | --- |
* | "Merge clients" |
*
* @param {Permission_Merge_ClientsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const permission_merge_clients: ((inputs?: Permission_Merge_ClientsInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Permission_Merge_ClientsInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Permission_Merge_ClientsInputs = {};
