/**
* | output |
* | --- |
* | "This site is not recognized by your authenticator." |
*
* @param {Twofa_Error_SecurityInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const twofa_error_security: ((inputs?: Twofa_Error_SecurityInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Twofa_Error_SecurityInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Twofa_Error_SecurityInputs = {};
