/**
* | output |
* | --- |
* | "This link already has a password." |
*
* @param {Error_Portal_Passphrase_Already_SetInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_portal_passphrase_already_set: ((inputs?: Error_Portal_Passphrase_Already_SetInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Error_Portal_Passphrase_Already_SetInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Error_Portal_Passphrase_Already_SetInputs = {};
