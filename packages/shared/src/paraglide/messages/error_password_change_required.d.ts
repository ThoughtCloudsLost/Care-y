/**
* | output |
* | --- |
* | "Choose your own password to continue." |
*
* @param {Error_Password_Change_RequiredInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const error_password_change_required: ((inputs?: Error_Password_Change_RequiredInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Error_Password_Change_RequiredInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Error_Password_Change_RequiredInputs = {};
