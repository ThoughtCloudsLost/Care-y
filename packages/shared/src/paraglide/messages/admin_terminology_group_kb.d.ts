/**
* | output |
* | --- |
* | "Reference library" |
*
* @param {Admin_Terminology_Group_KbInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_terminology_group_kb: ((inputs?: Admin_Terminology_Group_KbInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Terminology_Group_KbInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Terminology_Group_KbInputs = {};
