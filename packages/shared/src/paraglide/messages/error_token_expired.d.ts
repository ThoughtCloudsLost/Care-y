/**
* | output |
* | --- |
* | "The phone lookup token has expired. Please try again." |
*
* @param {Error_Token_ExpiredInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_token_expired: ((inputs?: Error_Token_ExpiredInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Error_Token_ExpiredInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Error_Token_ExpiredInputs = {};
