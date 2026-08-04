/**
* | output |
* | --- |
* | "Reset to defaults" |
*
* @param {Roles_Reset_DefaultsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const roles_reset_defaults: ((inputs?: Roles_Reset_DefaultsInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Roles_Reset_DefaultsInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Roles_Reset_DefaultsInputs = {};
