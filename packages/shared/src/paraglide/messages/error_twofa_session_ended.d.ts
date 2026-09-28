/**
* | output |
* | --- |
* | "Too many incorrect codes. Sign in again to continue." |
*
* @param {Error_Twofa_Session_EndedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const error_twofa_session_ended: ((inputs?: Error_Twofa_Session_EndedInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Error_Twofa_Session_EndedInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Error_Twofa_Session_EndedInputs = {};
