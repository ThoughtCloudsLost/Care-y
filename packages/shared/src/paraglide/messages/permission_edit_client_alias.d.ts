/**
* | output |
* | --- |
* | "Edit client alias" |
*
* @param {Permission_Edit_Client_AliasInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const permission_edit_client_alias: ((inputs?: Permission_Edit_Client_AliasInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Permission_Edit_Client_AliasInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Permission_Edit_Client_AliasInputs = {};
