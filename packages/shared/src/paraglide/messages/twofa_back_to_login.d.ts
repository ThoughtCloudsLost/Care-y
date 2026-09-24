/**
* | output |
* | --- |
* | "Back to login" |
*
* @param {Twofa_Back_To_LoginInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const twofa_back_to_login: ((inputs?: Twofa_Back_To_LoginInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Twofa_Back_To_LoginInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Twofa_Back_To_LoginInputs = {};
