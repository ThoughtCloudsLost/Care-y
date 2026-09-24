/**
* | output |
* | --- |
* | "Team members with elevated access who oversee cases and supervise others." |
*
* @param {Admin_Terminology_Desc_ManagerInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_terminology_desc_manager: ((inputs?: Admin_Terminology_Desc_ManagerInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Terminology_Desc_ManagerInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Terminology_Desc_ManagerInputs = {};
