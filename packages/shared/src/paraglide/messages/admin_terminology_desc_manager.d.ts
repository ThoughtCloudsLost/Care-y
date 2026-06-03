/**
* | output |
* | --- |
* | "Team members with elevated access who oversee cases and supervise others." |
*
* @param {Admin_Terminology_Desc_ManagerInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_terminology_desc_manager: ((inputs?: Admin_Terminology_Desc_ManagerInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Terminology_Desc_ManagerInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Terminology_Desc_ManagerInputs = {};
