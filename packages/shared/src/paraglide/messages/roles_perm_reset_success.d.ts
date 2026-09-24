/**
* | output |
* | --- |
* | "Role permissions reset to defaults" |
*
* @param {Roles_Perm_Reset_SuccessInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const roles_perm_reset_success: ((inputs?: Roles_Perm_Reset_SuccessInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Roles_Perm_Reset_SuccessInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Roles_Perm_Reset_SuccessInputs = {};
