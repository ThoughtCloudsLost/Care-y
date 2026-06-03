/**
* | output |
* | --- |
* | "Timed out. Try again." |
*
* @param {Twofa_Error_Push_TimeoutInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const twofa_error_push_timeout: ((inputs?: Twofa_Error_Push_TimeoutInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Twofa_Error_Push_TimeoutInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Twofa_Error_Push_TimeoutInputs = {};
