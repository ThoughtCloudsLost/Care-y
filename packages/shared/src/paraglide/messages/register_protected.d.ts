/**
* | output |
* | --- |
* | "Protected" |
*
* @param {Register_ProtectedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const register_protected: ((inputs?: Register_ProtectedInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Register_ProtectedInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Register_ProtectedInputs = {};
