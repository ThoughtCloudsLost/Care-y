/**
* | output |
* | --- |
* | "Manager level" |
*
* @param {Roles_Group_ManagerInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const roles_group_manager: ((inputs?: Roles_Group_ManagerInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Roles_Group_ManagerInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Roles_Group_ManagerInputs = {};
