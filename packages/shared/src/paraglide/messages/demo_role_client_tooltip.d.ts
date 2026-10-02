/**
* | output |
* | --- |
* | "Person seeking help, not a member of the organization. Sees the public intake form, the secure portal, and the client account with no role or staff permission." |
*
* @param {Demo_Role_Client_TooltipInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_role_client_tooltip: ((inputs?: Demo_Role_Client_TooltipInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Role_Client_TooltipInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Role_Client_TooltipInputs = {};
