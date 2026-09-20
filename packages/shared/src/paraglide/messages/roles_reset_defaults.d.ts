/**
* | output |
* | --- |
* | "Reset to defaults" |
*
* @param {Roles_Reset_DefaultsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const roles_reset_defaults: ((inputs?: Roles_Reset_DefaultsInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Roles_Reset_DefaultsInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Roles_Reset_DefaultsInputs = {};
