/**
* | output |
* | --- |
* | "This login username is already taken." |
*
* @param {Error_Username_Already_TakenInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const error_username_already_taken: ((inputs?: Error_Username_Already_TakenInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Error_Username_Already_TakenInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Error_Username_Already_TakenInputs = {};
