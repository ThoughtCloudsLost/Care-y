/**
* | output |
* | --- |
* | "Call clients" |
*
* @param {Permission_Call_ClientsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const permission_call_clients: ((inputs?: Permission_Call_ClientsInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Permission_Call_ClientsInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Permission_Call_ClientsInputs = {};
