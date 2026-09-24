/**
* | output |
* | --- |
* | "This authenticator is already registered." |
*
* @param {Twofa_Error_Invalid_StateInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const twofa_error_invalid_state: ((inputs?: Twofa_Error_Invalid_StateInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Twofa_Error_Invalid_StateInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Twofa_Error_Invalid_StateInputs = {};
