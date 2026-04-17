/**
* | output |
* | --- |
* | "User reactivated" |
*
* @param {Admin_User_ReactivatedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_user_reactivated: ((inputs?: Admin_User_ReactivatedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_User_ReactivatedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_User_ReactivatedInputs = {};
