/**
* | output |
* | --- |
* | "Authenticator request was cancelled. Try again." |
*
* @param {Twofa_Error_Not_AllowedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const twofa_error_not_allowed: ((inputs?: Twofa_Error_Not_AllowedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Twofa_Error_Not_AllowedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Twofa_Error_Not_AllowedInputs = {};
