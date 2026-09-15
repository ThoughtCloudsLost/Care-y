/**
* | output |
* | --- |
* | "Change contact details for any client" |
*
* @param {Permission_Edit_Client_ContactInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const permission_edit_client_contact: ((inputs?: Permission_Edit_Client_ContactInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Permission_Edit_Client_ContactInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Permission_Edit_Client_ContactInputs = {};
