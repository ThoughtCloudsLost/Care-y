/**
* | output |
* | --- |
* | "User deactivated" |
*
* @param {Admin_User_DeactivatedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_user_deactivated: ((inputs?: Admin_User_DeactivatedInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_User_DeactivatedInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_User_DeactivatedInputs = {};
