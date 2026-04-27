/**
* | output |
* | --- |
* | "Key Status" |
*
* @param {Admin_Users_Filter_KeysInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_users_filter_keys: ((inputs?: Admin_Users_Filter_KeysInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Users_Filter_KeysInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Users_Filter_KeysInputs = {};
