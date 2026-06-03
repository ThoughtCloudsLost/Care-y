/**
* | output |
* | --- |
* | "This authenticator is already registered." |
*
* @param {Twofa_Error_Invalid_StateInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const twofa_error_invalid_state: ((inputs?: Twofa_Error_Invalid_StateInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Twofa_Error_Invalid_StateInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Twofa_Error_Invalid_StateInputs = {};
