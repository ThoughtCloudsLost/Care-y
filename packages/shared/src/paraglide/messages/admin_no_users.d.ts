/**
* | output |
* | --- |
* | "No users yet. Invite your first volunteer." |
*
* @param {Admin_No_UsersInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_no_users: ((inputs?: Admin_No_UsersInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_No_UsersInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_No_UsersInputs = {};
