/**
* | output |
* | --- |
* | "This username is already taken." |
*
* @param {Error_Username_Already_TakenInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_username_already_taken: ((inputs?: Error_Username_Already_TakenInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Error_Username_Already_TakenInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Error_Username_Already_TakenInputs = {};
