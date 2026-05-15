/**
* | output |
* | --- |
* | "Back to login" |
*
* @param {Twofa_Back_To_LoginInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const twofa_back_to_login: ((inputs?: Twofa_Back_To_LoginInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Twofa_Back_To_LoginInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Twofa_Back_To_LoginInputs = {};
