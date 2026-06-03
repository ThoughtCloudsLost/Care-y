/**
* | output |
* | --- |
* | "{Manager}" |
*
* @param {Admin_Role_ManagerInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_role_manager: ((inputs: Admin_Role_ManagerInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Role_ManagerInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Role_ManagerInputs = {
    Manager: NonNullable<unknown>;
};
