/**
* | output |
* | --- |
* | "Edit user" |
*
* @param {Admin_User_Edit_ActionsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_user_edit_actions: ((inputs?: Admin_User_Edit_ActionsInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_User_Edit_ActionsInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_User_Edit_ActionsInputs = {};
