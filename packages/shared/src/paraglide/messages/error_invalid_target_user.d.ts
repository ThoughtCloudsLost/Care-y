/**
* | output |
* | --- |
* | "Cannot assign to this user." |
*
* @param {Error_Invalid_Target_UserInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const error_invalid_target_user: ((inputs?: Error_Invalid_Target_UserInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Error_Invalid_Target_UserInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Error_Invalid_Target_UserInputs = {};
