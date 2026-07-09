/**
* | output |
* | --- |
* | "Careful" |
*
* @param {Register_CarefulInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const register_careful: ((inputs?: Register_CarefulInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Register_CarefulInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Register_CarefulInputs = {};
