/**
* | output |
* | --- |
* | "No active verification code. Please request a new one." |
*
* @param {Error_No_Active_CodeInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_no_active_code: ((inputs?: Error_No_Active_CodeInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Error_No_Active_CodeInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Error_No_Active_CodeInputs = {};
