/**
* | output |
* | --- |
* | "All permission changes will revert to the defaults. This cannot be undone." |
*
* @param {Roles_Reset_ConfirmInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const roles_reset_confirm: ((inputs?: Roles_Reset_ConfirmInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Roles_Reset_ConfirmInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Roles_Reset_ConfirmInputs = {};
