/**
* | output |
* | --- |
* | "Push verification is not available. Web Push is not configured." |
*
* @param {Error_Push_2fa_Not_AvailableInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_push_2fa_not_available: ((inputs?: Error_Push_2fa_Not_AvailableInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Error_Push_2fa_Not_AvailableInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Error_Push_2fa_Not_AvailableInputs = {};
