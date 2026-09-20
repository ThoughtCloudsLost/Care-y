/**
* | output |
* | --- |
* | "Applies to contact details on any client record, not only your own cases." |
*
* @param {Permission_Edit_Client_Contact_HintInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const permission_edit_client_contact_hint: ((inputs?: Permission_Edit_Client_Contact_HintInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Permission_Edit_Client_Contact_HintInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Permission_Edit_Client_Contact_HintInputs = {};
