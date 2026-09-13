/**
* | output |
* | --- |
* | "Role permissions reset to defaults" |
*
* @param {Roles_Perm_Reset_SuccessInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const roles_perm_reset_success: ((inputs?: Roles_Perm_Reset_SuccessInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Roles_Perm_Reset_SuccessInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Roles_Perm_Reset_SuccessInputs = {};
