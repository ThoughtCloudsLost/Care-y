/**
* | output |
* | --- |
* | "Request was denied." |
*
* @param {Twofa_Error_Push_DeniedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const twofa_error_push_denied: ((inputs?: Twofa_Error_Push_DeniedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Twofa_Error_Push_DeniedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Twofa_Error_Push_DeniedInputs = {};
