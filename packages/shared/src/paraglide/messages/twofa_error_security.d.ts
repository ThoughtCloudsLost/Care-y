/**
* | output |
* | --- |
* | "This site is not recognized by your authenticator." |
*
* @param {Twofa_Error_SecurityInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const twofa_error_security: ((inputs?: Twofa_Error_SecurityInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Twofa_Error_SecurityInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Twofa_Error_SecurityInputs = {};
