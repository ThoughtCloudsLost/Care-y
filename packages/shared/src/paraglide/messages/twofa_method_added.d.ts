/**
* | output |
* | --- |
* | "Verification method added" |
*
* @param {Twofa_Method_AddedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const twofa_method_added: ((inputs?: Twofa_Method_AddedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Twofa_Method_AddedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Twofa_Method_AddedInputs = {};
