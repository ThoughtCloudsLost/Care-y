/**
* | output |
* | --- |
* | "{Manager}" |
*
* @param {Admin_Role_ManagerInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_role_manager: ((inputs: Admin_Role_ManagerInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Role_ManagerInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Role_ManagerInputs = {
    Manager: NonNullable<unknown>;
};
