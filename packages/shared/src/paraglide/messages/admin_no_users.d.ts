/**
* | output |
* | --- |
* | "No users yet. Invite your first {volunteer}." |
*
* @param {Admin_No_UsersInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_no_users: ((inputs: Admin_No_UsersInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_No_UsersInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_No_UsersInputs = {
    volunteer: NonNullable<unknown>;
};
