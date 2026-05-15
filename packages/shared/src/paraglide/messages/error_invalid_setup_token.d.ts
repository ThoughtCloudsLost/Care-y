/**
* | output |
* | --- |
* | "The setup token is invalid or has already been used." |
*
* @param {Error_Invalid_Setup_TokenInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_invalid_setup_token: ((inputs?: Error_Invalid_Setup_TokenInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Error_Invalid_Setup_TokenInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Error_Invalid_Setup_TokenInputs = {};
