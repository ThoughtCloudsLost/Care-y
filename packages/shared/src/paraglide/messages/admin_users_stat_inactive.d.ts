/**
* | output |
* | --- |
* | "inactive" |
*
* @param {Admin_Users_Stat_InactiveInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_users_stat_inactive: ((inputs?: Admin_Users_Stat_InactiveInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Users_Stat_InactiveInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Users_Stat_InactiveInputs = {};
