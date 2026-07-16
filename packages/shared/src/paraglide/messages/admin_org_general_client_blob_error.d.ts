/**
* | output |
* | --- |
* | "Name saved. The public login page could not be updated and will show the old name until branding is saved again." |
*
* @param {Admin_Org_General_Client_Blob_ErrorInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_org_general_client_blob_error: ((inputs?: Admin_Org_General_Client_Blob_ErrorInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Org_General_Client_Blob_ErrorInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Org_General_Client_Blob_ErrorInputs = {};
