/**
* | output |
* | --- |
* | "Sort users" |
*
* @param {Admin_Users_SortInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_users_sort: ((inputs?: Admin_Users_SortInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Users_SortInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Users_SortInputs = {};
