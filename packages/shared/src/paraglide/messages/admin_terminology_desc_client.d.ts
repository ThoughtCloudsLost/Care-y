/**
* | output |
* | --- |
* | "The people your organization serves and supports." |
*
* @param {Admin_Terminology_Desc_ClientInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_terminology_desc_client: ((inputs?: Admin_Terminology_Desc_ClientInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Terminology_Desc_ClientInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Terminology_Desc_ClientInputs = {};
