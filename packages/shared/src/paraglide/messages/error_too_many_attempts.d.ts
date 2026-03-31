/**
* | output |
* | --- |
* | "Too many attempts. Please request a new code." |
*
* @param {Error_Too_Many_AttemptsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_too_many_attempts: ((inputs?: Error_Too_Many_AttemptsInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Error_Too_Many_AttemptsInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Error_Too_Many_AttemptsInputs = {};
