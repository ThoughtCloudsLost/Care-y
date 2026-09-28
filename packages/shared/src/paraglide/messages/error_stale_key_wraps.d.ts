/**
* | output |
* | --- |
* | "Your access changed while your password was being changed. Try again." |
*
* @param {Error_Stale_Key_WrapsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const error_stale_key_wraps: ((inputs?: Error_Stale_Key_WrapsInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Error_Stale_Key_WrapsInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Error_Stale_Key_WrapsInputs = {};
