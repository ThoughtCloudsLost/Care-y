/**
* | output |
* | --- |
* | "Admin level" |
*
* @param {Roles_Group_AdminInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const roles_group_admin: ((inputs?: Roles_Group_AdminInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Roles_Group_AdminInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Roles_Group_AdminInputs = {};
