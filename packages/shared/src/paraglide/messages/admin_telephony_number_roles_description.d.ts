/**
* | output |
* | --- |
* | "Choose which number to use for each type of communication." |
*
* @param {Admin_Telephony_Number_Roles_DescriptionInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_telephony_number_roles_description: ((inputs?: Admin_Telephony_Number_Roles_DescriptionInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Telephony_Number_Roles_DescriptionInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Telephony_Number_Roles_DescriptionInputs = {};
