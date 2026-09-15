/**
* | output |
* | --- |
* | "Call clients" |
*
* @param {Permission_Call_ClientsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const permission_call_clients: ((inputs?: Permission_Call_ClientsInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Permission_Call_ClientsInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Permission_Call_ClientsInputs = {};
