/**
* | output |
* | --- |
* | "Senior team member role" |
*
* @param {Admin_Terminology_Group_ManagerInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_terminology_group_manager: ((inputs?: Admin_Terminology_Group_ManagerInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Terminology_Group_ManagerInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Terminology_Group_ManagerInputs = {};
