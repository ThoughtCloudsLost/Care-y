/**
* | output |
* | --- |
* | "Only admins can assign non-default roles." |
*
* @param {Error_Only_Admins_Can_Assign_RolesInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_only_admins_can_assign_roles: ((inputs?: Error_Only_Admins_Can_Assign_RolesInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Error_Only_Admins_Can_Assign_RolesInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Error_Only_Admins_Can_Assign_RolesInputs = {};
