/**
* | output |
* | --- |
* | "Delete client records" |
*
* @param {Permission_Delete_ClientsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const permission_delete_clients: ((inputs?: Permission_Delete_ClientsInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Permission_Delete_ClientsInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Permission_Delete_ClientsInputs = {};
