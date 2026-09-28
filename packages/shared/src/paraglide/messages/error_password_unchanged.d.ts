/**
* | output |
* | --- |
* | "The new password must be different from your current one." |
*
* @param {Error_Password_UnchangedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const error_password_unchanged: ((inputs?: Error_Password_UnchangedInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Error_Password_UnchangedInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Error_Password_UnchangedInputs = {};
