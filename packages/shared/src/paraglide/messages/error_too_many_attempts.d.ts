/**
* | output |
* | --- |
* | "Too many attempts. Please request a new code." |
*
* @param {Error_Too_Many_AttemptsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const error_too_many_attempts: ((inputs?: Error_Too_Many_AttemptsInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Error_Too_Many_AttemptsInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Error_Too_Many_AttemptsInputs = {};
