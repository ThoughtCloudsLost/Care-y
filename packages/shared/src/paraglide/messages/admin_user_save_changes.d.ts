/**
* | output |
* | --- |
* | "Save changes" |
*
* @param {Admin_User_Save_ChangesInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_user_save_changes: ((inputs?: Admin_User_Save_ChangesInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_User_Save_ChangesInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_User_Save_ChangesInputs = {};
