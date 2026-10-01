/**
* | output |
* | --- |
* | "Request org deletion" |
*
* @param {Permission_Request_Org_DeletionInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const permission_request_org_deletion: ((inputs?: Permission_Request_Org_DeletionInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Permission_Request_Org_DeletionInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Permission_Request_Org_DeletionInputs = {};
