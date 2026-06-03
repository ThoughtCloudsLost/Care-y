/**
* | output |
* | --- |
* | "{Manager}" |
*
* @param {Role_ManagerInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const role_manager: ((inputs: Role_ManagerInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Role_ManagerInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Role_ManagerInputs = {
    Manager: NonNullable<unknown>;
};
