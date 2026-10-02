/**
* | output |
* | --- |
* | "Client" |
*
* @param {Demo_Role_Client_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_role_client_label: ((inputs?: Demo_Role_Client_LabelInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Role_Client_LabelInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Role_Client_LabelInputs = {};
